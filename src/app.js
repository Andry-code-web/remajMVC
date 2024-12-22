const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const flash = require('connect-flash');
const moment = require('moment');
const { setUserLocals } = require('./middleware/auth.middleware');
const db = require('./config/database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  connectionStateRecovery: {},
});

// Middleware
app.use(cookieParser());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
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

// Rutas
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

io.on('connection', (socket) => {
  console.log('🔵 Nuevo cliente conectado:', socket.id);

  socket.on('join-auction', async (remates_id) => {
    socket.join(remates_id);
    console.log(`Cliente ${socket.id} se unió al remate ${remates_id}`);

    try {
      // Recuperar mensajes persistentes de la base de datos
      const [messages] = await db.execute(
        'SELECT m.monto, u.usuario, m.remates_id FROM mensajes m INNER JOIN usuarios u ON m.usuarios_id = u.id WHERE m.remates_id = ? ORDER BY m.id ASC',
        [remates_id]
      );

      // Emitir mensajes al cliente
      socket.emit('load-messages', messages);

      // Recuperar el tiempo de inicio de la subasta
      const [auctionRows] = await db.execute('SELECT fecha_remate, hora_remate FROM remates WHERE id = ?', [remates_id]);

      if (auctionRows.length > 0) {
        const fechaInicio = moment(`${auctionRows[0].fecha_remate} ${auctionRows[0].hora_remate}`).utc(); // Convertir a UTC con moment
        const countdownDuration = fechaInicio.diff(moment(), 'seconds'); // Tiempo restante en segundos

        // Emitir el tiempo de inicio y duración del cronómetro al cliente
        socket.emit('auction-start-time', { startTime: fechaInicio.format(), endTime: fechaInicio.format() });
        socket.emit('start-auction-timer', countdownDuration);
      }

    } catch (error) {
      console.error('❌ Error al cargar mensajes persistentes o la subasta:', error.message);
    }
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
      // Emitir el mensaje del chat
      io.to(remates_id).emit('chat-message', { monto, usuario: usuarioNombre, remates_id });

      // Actualizar la mayor oferta
      if (monto > highestAmount) {
        highestAmount = monto;
        io.to(remates_id).emit('highest-offer-update', monto);
      }

    } catch (error) {
      console.error('❌ Error al procesar mensaje:', error.message);
    }
  });

  socket.on('start-auction-timer', (countdownDuration) => {
    let countdown = countdownDuration;
    const remates_id = socket.id; // Asignar un remate_id

    timers[remates_id] = setInterval(() => {
      if (countdown > 0) {
        io.to(remates_id).emit('timer-update', countdown);
        countdown--;
      } else {
        clearInterval(timers[remates_id]);
        io.to(remates_id).emit('auction-ended', 'La subasta ha finalizado');
      }
    }, 1000);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});
