const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const flash = require('connect-flash');
const { setUserLocals } = require('./middleware/auth.middleware');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./config/database'); // Usando la conexión pool
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  connectionStateRecovery: {},
});

const options ={
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'remajud',
}

const sessionStore = new MySQLStore(options);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
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
app.use('/en_vivo', require('./routes/en_vivo.routes'));
app.use('/terminos', require('./routes/terminoscondiciones.routes'))
app.use('/comprar', require('./routes/comprar.routes'));
app.use('/vender', require('./routes/vender.routes'));

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
      // Obtener la fecha y hora del remate y el estado actual
      const [rows] = await db.execute(
        'SELECT fecha_remate, hora_remate, estado FROM remates WHERE id = ?',
        [remates_id]
      );

      if (rows.length === 0) {
        socket.emit('error-message', 'Remate no encontrado');
        return;
      }

      const fechaRemate = new Date(rows[0].fecha_remate);
      const [hour, minute, second] = rows[0].hora_remate.split(':');
      fechaRemate.setHours(hour, minute, second);
      const now = new Date();

      console.log('Fecha y hora del remate:', fechaRemate);
      console.log('Fecha y hora actual del cliente:', now);

      // Enviar la hora de inicio del remate al cliente
      socket.emit('auction-start-time', fechaRemate);

      // Si el remate ya está en curso, calcular tiempo restante
      if (rows[0].estado === 'en_curso') {
        const duracionTotal = 15 * 60; // 6 horas en segundos

        // Obtener el tiempo transcurrido desde el inicio del remate
        const tiempoTranscurrido = Math.floor((now - fechaRemate) / 1000);
        const tiempoRestante = Math.max(0, duracionTotal - tiempoTranscurrido);

        if (tiempoRestante > 0) {
          startAuctionTimer(remates_id, tiempoRestante);
        } else {
          // Si ya pasó el tiempo, finalizar la subasta
          await finalizeAuction(remates_id);
        }
      } else if (now >= fechaRemate && rows[0].estado !== 'finalizado') {
        // Si es hora de iniciar y no ha iniciado, comenzar nuevo temporizador
        startAuctionTimer(remates_id);
      } else if (rows[0].estado !== 'finalizado') {
        // Programar inicio futuro
        const timeDiff = fechaRemate - now;
        console.log(`⏳ Temporizador programado para iniciar en ${timeDiff / 1000} segundos`);
        setTimeout(() => startAuctionTimer(remates_id), timeDiff);
      }

      // Cargar mensajes persistentes del chat
      const [messages] = await db.execute(
        'SELECT m.monto, u.usuario FROM mensajes m INNER JOIN usuarios u ON m.usuarios_id = u.id WHERE m.remates_id = ? ORDER BY m.id ASC',
        [remates_id]
      );

      socket.emit('load-messages', messages);

    } catch (error) {
      console.error('❌ Error al verificar la fecha y hora del remate:', error.message || error);
      socket.emit('error-message', 'Error al verificar la información del remate');
    }
  });

  socket.on('chat-message', async ({ monto, usuarios_id, remates_id }) => {
    try {
      await db.execute(
        'INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)',
        [monto, usuarios_id, remates_id]
      );

      const [user] = await db.execute(
        'SELECT usuario FROM usuarios WHERE id = ?',
        [usuarios_id]
      );

      const usuario = user[0].usuario;

      io.to(remates_id).emit('chat-message', { monto, usuario, remates_id });
    } catch (error) {
      console.error('❌ Error al guardar el mensaje:', error.message || error);
      socket.emit('error-message', 'Error al guardar el mensaje');
    }
  });

  async function startAuctionTimer(remates_id, remainingTime = 15 * 60) {
    if (auctionTimers[remates_id]?.intervalId) {
      clearInterval(auctionTimers[remates_id].intervalId);
      console.log(`⏹️ Temporizador existente cancelado para la subasta ${remates_id}`);
    }

    try {
      if (remainingTime === 15 * 60) {
        await db.execute('UPDATE remates SET estado = "en_curso" WHERE id = ?', [remates_id]);
        console.log(`La subasta ${remates_id} ha comenzado`);
      }

      auctionTimers[remates_id] = { remainingTime };
      auctionTimers[remates_id].intervalId = setInterval(() => {
        auctionTimers[remates_id].remainingTime -= 1;
        io.to(remates_id).emit('timer-update', auctionTimers[remates_id].remainingTime);

        // Si el tiempo se acaba, finalizar subasta
        if (auctionTimers[remates_id].remainingTime <= 0) {
          finalizeAuction(remates_id);
        }
      }, 1000);
    } catch (error) {
      console.error(`❌ Error al iniciar el temporizador para la subasta ${remates_id}: ${error.message || error}`);
    }
  }

  async function finalizeAuction(remates_id) {
    try {
      await db.execute('UPDATE remates SET estado = "finalizado" WHERE id = ?', [remates_id]);
      console.log(`⏹️ Subasta ${remates_id} finalizada`);
      io.to(remates_id).emit('auction-finished');
    } catch (error) {
      console.error('❌ Error al finalizar subasta:', error.message || error);
    }
  }
});




// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
}); 