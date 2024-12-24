const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const flash = require('connect-flash');
const { setUserLocals } = require('./middleware/auth.middleware');
const db = require('./config/database'); // Usando la conexión pool
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  connectionStateRecovery: {},
});

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    },
  })
);

app.use(flash());
app.use(morgan('dev'));
app.use(setUserLocals);

// Middleware para pasar mensajes flash a las vistas
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/home.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/auth', require('./routes/auth.routes'));
app.use('/auctions', require('./routes/auction.routes'));
app.use('/contacto', require('./routes/contacto.routes'));
app.use('/remates', require('./routes/remates.routes'));
app.use('/errores', require('./routes/errores.routes'));

app.get('/unauthorized', (req, res) => {
  res.render('unauthorized/unauthorized');
});

// Socket.IO
let highestAmount = 0;
const timers = {};
const auctionTimers = {};

io.on('connection', (socket) => {
  console.log('🔵 Nuevo cliente conectado:', socket.id);

  socket.on('join-auction', async (remates_id) => {
    if (!remates_id) {
      console.error('❌ remates_id no proporcionado');
      socket.emit('error-message', 'ID del remate no proporcionado');
      return;
    }

    socket.join(remates_id);
    console.log(`Cliente ${socket.id} se unió al remate ${remates_id}`);

    try {
      // Consulta la fecha y hora de inicio desde la base de datos usando el pool
      const [rows] = await db.execute('SELECT fecha_remate, hora_remate FROM remates WHERE id = ?', [remates_id]);

      if (rows.length === 0) {
        socket.emit('error-message', 'Remate no encontrado');
        return;
      }

      const fechaInicio = rows[0].fecha_remate; // Fecha de inicio de la subasta desde la base de datos
      const horaInicio = rows[0].hora_remate; // Hora de inicio de la subasta desde la base de datos
      const fechaHoraInicio = new Date(`${fechaInicio}T${horaInicio}`); // Combinar fecha y hora
      console.log('Fecha y hora de inicio servidor:', fechaHoraInicio);

      // Enviar la fecha y hora de inicio al cliente
      socket.emit('auction-start-time', { startTime: fechaHoraInicio });

      // Recuperar los mensajes persistentes (si los hay)
      const [messages] = await db.execute(
        'SELECT m.monto, u.usuario, m.remates_id FROM mensajes m INNER JOIN usuarios u ON m.usuarios_id = u.id WHERE m.remates_id = ? ORDER BY m.id ASC',
        [remates_id]
      );

      // Emitir los mensajes al cliente
      socket.emit('load-messages', messages);

      // Emitir un mensaje de bienvenida
      const mensaje = `Bienvenido al remate ${remates_id}`;
      socket.emit('site-alert', mensaje);

      // Iniciar el temporizador si no está ya iniciado
      if (!auctionTimers[remates_id]) {
        const now = new Date();
        const timeDiff = fechaHoraInicio - now;

        if (timeDiff > 0) {
          setTimeout(() => {
            startAuctionTimer(remates_id);
          }, timeDiff);
        } else {
          startAuctionTimer(remates_id);
        }
      }

    } catch (error) {
      console.error('❌ Error al cargar la fecha y hora de inicio o los mensajes:', error.message || error);
      socket.emit('error-message', 'Ocurrió un error al cargar la información');
    }
  });

  socket.on('start-auction-timer', (remates_id) => {
    console.log(`⏳ Temporizador iniciado para remate ${remates_id}`);
    startAuctionTimer(remates_id);
  });

  socket.on('chat-message', async (msg) => {
    const { monto, usuarios_id, remates_id } = msg;

    try {
      const [remateRows] = await db.execute('SELECT id FROM remates WHERE id = ?', [remates_id]);
      if (remateRows.length === 0) {
        socket.emit('error-message', 'El ID del remate no existe.');
        console.log(`❌ Remate ID inválido: ${remates_id}`);
        return;
      }

      const [userRows] = await db.execute('SELECT usuario FROM usuarios WHERE id = ?', [usuarios_id]);
      if (userRows.length === 0) {
        socket.emit('error-message', 'Usuario no encontrado');
        console.log('❌ Usuario no encontrado en la base de datos');
        return;
      }

      const usuarioNombre = userRows[0].usuario;

      const [highestRow] = await db.execute(
        'SELECT IFNULL(MAX(monto), 0) as highestAmount FROM mensajes WHERE remates_id = ?',
        [remates_id]
      );
      const highestAmount = highestRow[0].highestAmount;

      if (monto > highestAmount) {
        await db.execute(
          'INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)',
          [monto, usuarios_id, remates_id]
        );

        console.log('✅ Mensaje guardado en la base de datos');
        io.to(remates_id).emit('chat-message', {
          monto,
          usuario: usuarioNombre,
          remates_id,
        });
      } else {
        socket.emit('error-message', `El monto debe ser mayor a USD$${highestAmount}`);
        console.log(`❌ Monto rechazado: ${monto}. Debe ser mayor a ${highestAmount}`);
      }
    } catch (error) {
      console.error('❌ Error al procesar el mensaje:', error.message);
      socket.emit('error-message', 'Ocurrió un error al procesar tu oferta');
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

function startAuctionTimer(remates_id) {
  let countdown = 5 * 60 * 60;  // Timer duration in seconds (5 hours)
  auctionTimers[remates_id] = setInterval(() => {
    if (countdown > 0) {
      io.to(remates_id).emit('timer-update', countdown);
      countdown--;
    } else {
      clearInterval(auctionTimers[remates_id]);
      io.to(remates_id).emit('auction-ended', 'La subasta ha finalizado');
    }
  }, 1000);
}

// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});
