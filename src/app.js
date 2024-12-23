const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const flash = require('connect-flash');
const { setUserLocals } = require('./middleware/auth.middleware');
const db = require('./config/database');
const { zonedTimeToUtc } = require('date-fns-tz');

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
const timers = {};

io.on('connection', (socket) => {
  console.log('🔵 Nuevo cliente conectado:', socket.id);

  socket.on('join-auction', async (remates_id) => {
    try {
      socket.join(remates_id);
      console.log(`Cliente ${socket.id} se unió al remate ${remates_id}`);

      // Función para calcular el tiempo restante
      async function calculateRemainingTime(remates_id) {
        try {
          const [remateRows] = await db.execute(
            'SELECT fecha_remate, hora_remate FROM remates WHERE id = ?',
            [remates_id]
          );

          if (remateRows.length === 0) {
            console.error('❌ No se encontró el remate con el ID proporcionado');
            return 0;
          }

          const { fecha_remate, hora_remate } = remateRows[0];
          console.log(`Fecha del remate: ${fecha_remate}, Hora del remate: ${hora_remate}`);
          const remateTime = zonedTimeToUtc(`${fecha_remate}T${hora_remate}`, 'UTC');
          const currentTime = zonedTimeToUtc(new Date(), 'UTC');

          return Math.max(remateTime - currentTime, 0);
        } catch (error) {
          console.error('❌ Error al calcular el tiempo restante:', error.message);
          return 0;
        }
      }

      const remainingTime = await calculateRemainingTime(remates_id);
      console.log(`Tiempo restante: ${remainingTime / 1000}s`);

      if (remainingTime > 0) {
        console.log(`⏳ Tiempo restante para el remate: ${remainingTime / 1000}s`);
        setTimeout(() => startAuctionTimer(remates_id), remainingTime);
      } else {
        console.log('El remate ya debería haber iniciado.');
      }
    } catch (error) {
      console.error('❌ Error al procesar join-auction:', error.message);
      socket.emit('error-message', 'Ocurrió un error al unirse al remate');
    }
  });

  // Evento de chat
  socket.on('chat-message', async (msg) => {
    const { monto, usuarios_id, remates_id } = msg;

    try {
      const [remateRows] = await db.execute('SELECT id FROM remates WHERE id = ?', [remates_id]);
      if (remateRows.length === 0) {
        socket.emit('error-message', 'El ID del remate no existe.');
        return;
      }

      const [userRows] = await db.execute('SELECT usuario FROM usuarios WHERE id = ?', [usuarios_id]);
      if (userRows.length === 0) {
        socket.emit('error-message', 'Usuario no encontrado');
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
        io.to(remates_id).emit('chat-message', { monto, usuario: usuarioNombre, remates_id });
      } else {
        socket.emit('error-message', `El monto debe ser mayor a USD$${highestAmount}`);
      }
    } catch (error) {
      console.error('❌ Error al procesar el mensaje:', error.message);
      socket.emit('error-message', 'Ocurrió un error al procesar tu oferta');
    }
  });
});

// Función para iniciar el temporizador
function startAuctionTimer(remates_id) {
  let countdown = 18000; // 5 horas en segundos
  timers[remates_id] = setInterval(async () => {
    if (countdown > 0) {
      io.to(remates_id).emit('timer-update', countdown);
      countdown--;
    } else {
      clearInterval(timers[remates_id]);
      io.to(remates_id).emit('auction-ended', 'La subasta ha finalizado');
      delete timers[remates_id];
      await db.execute('UPDATE remates SET estado = ? WHERE id = ?', ['finalizado', remates_id]);
    }
  }, 1000);
}

// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});