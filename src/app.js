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

// Mantener un registro global de temporizadores


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
      // Obtener la fecha y hora de inicio del remate desde la base de datos
      const [rows] = await db.execute('SELECT fecha_remate, hora_remate FROM remates WHERE id = ?', [remates_id]);
      if (rows.length === 0) {
        socket.emit('error-message', 'Remate no encontrado');
        return;
      }

      const fechaInicio = rows[0].fecha_remate;
      const horaInicio = rows[0].hora_remate;
      const fechaHoraInicio = new Date(`${fechaInicio}T${horaInicio}`);

      // Enviar la hora de inicio al cliente
      socket.emit('auction-start-time', { startTime: fechaHoraInicio });

      // Verificar si ya existe un temporizador para este remate
      if (!auctionTimers[remates_id]) {
        const now = new Date();
        const timeDiffInSeconds = Math.floor((fechaHoraInicio - now) / 1000);

        if (timeDiffInSeconds > 0) {
          // Programar el inicio del cronómetro cuando llegue la hora
          setTimeout(() => startAuctionTimer(remates_id), timeDiffInSeconds * 1000);
        } else {
          // Iniciar inmediatamente si ya pasó la hora
          startAuctionTimer(remates_id);
        }

        // Registrar temporizador con tiempo restante
        auctionTimers[remates_id] = {
          startTime: fechaHoraInicio,
          remainingTime: timeDiffInSeconds > 0 ? timeDiffInSeconds : 0,
        };
      }

      // Enviar tiempo restante al cliente
      socket.emit('timer-update', auctionTimers[remates_id].remainingTime);

      // Cargar mensajes persistentes del chat
      const [messages] = await db.execute(
        'SELECT m.monto, u.usuario FROM mensajes m INNER JOIN usuarios u ON m.usuarios_id = u.id WHERE m.remates_id = ? ORDER BY m.id ASC',
        [remates_id]
      );

      socket.emit('load-messages', messages);

    } catch (error) {
      console.error('❌ Error al cargar datos de la subasta:', error.message || error);
      socket.emit('error-message', 'Ocurrió un error al cargar la información');
    }
  });

  function startAuctionTimer(remates_id, durationInSeconds = 5 * 60 * 60) {
    if (auctionTimers[remates_id]?.intervalId) {
      clearInterval(auctionTimers[remates_id].intervalId);
      console.log(`⏹️ Temporizador existente cancelado para la subasta ${remates_id}`);
    }

    let remainingTime = durationInSeconds;

    const intervalId = setInterval(() => {
      if (remainingTime > 0) {
        io.to(remates_id).emit('timer-update', remainingTime);
        remainingTime--;
      } else {
        clearInterval(intervalId);
        delete auctionTimers[remates_id];
        io.to(remates_id).emit('auction-ended', 'La subasta ha finalizado');
        console.log(`⏰ Subasta ${remates_id} finalizada`);
      }
    }, 1000);

    auctionTimers[remates_id] = {
      ...auctionTimers[remates_id],
      intervalId,
    };

    console.log(`⏳ Temporizador iniciado para la subasta ${remates_id} con ${durationInSeconds} segundos`);
  }

  socket.on('chat-message', async ({ monto, usuarios_id, remates_id }) => {
    if (!remates_id || !usuarios_id || monto === undefined) {
      socket.emit('error-message', 'Datos incompletos para el mensaje');
      return;
    }

    try {
      // Insertar mensaje en la base de datos
      await db.execute(
        'INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)',
        [monto, usuarios_id, remates_id]
      );

      // Obtener el nombre del usuario
      const [userRows] = await db.execute('SELECT usuario FROM usuarios WHERE id = ?', [usuarios_id]);
      const usuario = userRows.length > 0 ? userRows[0].usuario : 'Anónimo';

      // Emitir mensaje al resto de los clientes en la subasta
      io.to(remates_id).emit('chat-message', { monto, usuario, remates_id });

      // Actualizar el monto más alto si corresponde
      if (auctionTimers[remates_id]) {
        auctionTimers[remates_id].highestAmount = Math.max(monto, auctionTimers[remates_id].highestAmount || 0);
      }
    } catch (error) {
      console.error('❌ Error al guardar el mensaje:', error.message || error);
      socket.emit('error-message', 'Error al enviar el mensaje');
    }
  });
});


// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});
