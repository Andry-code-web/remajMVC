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

app.set('trust proxy', 1); // Confía en el proxy para HTTPS

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      httpOnly: true,
      domain: '.remajud.com', // Comparte cookies entre subdominios
      maxAge: 3600000, // 1 hora
    },
  })
);


app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});



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

      // Si el remate ya está en curso, calcular tiempo restante
      if (rows[0].estado === 'en_curso') {
        const duracionTotal = 6 * 60 * 60; // 6 horas en segundos

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

  async function startAuctionTimer(remates_id, remainingTime = 6 * 60 * 60) {
    if (auctionTimers[remates_id]?.intervalId) {
      clearInterval(auctionTimers[remates_id].intervalId);
      console.log(`⏹️ Temporizador existente cancelado para la subasta ${remates_id}`);
    }

    try {
      if (remainingTime === 6 * 60 * 60) {
        await db.execute(
          'UPDATE remates SET estado = ? WHERE id = ?',
          ['en_curso', remates_id]
        );
      }
    } catch (error) {
      console.error(`❌ Error al actualizar el estado de la subasta ${remates_id}:`, error.message || error);
      return;
    }

    const intervalId = setInterval(async () => {
      if (remainingTime > 0) {
        io.to(remates_id).emit('timer-update', remainingTime);
        remainingTime--;
      } else {
        await finalizeAuction(remates_id);
      }
    }, 1000);

    io.to(remates_id).emit('auction-started', 'La subasta ha comenzado');
    io.to(remates_id).emit('chat-enabled', true);
    io.to(remates_id).emit('timer-update', remainingTime);

    auctionTimers[remates_id] = { intervalId, remainingTime };
    console.log(`⏳ Temporizador iniciado para la subasta ${remates_id}, tiempo restante: ${remainingTime} segundos`);
  }

  async function finalizeAuction(remates_id) {
    clearInterval(auctionTimers[remates_id]?.intervalId);
    const { highestAmount = 0, highestBidder: winner = null } = auctionTimers[remates_id] || {};

    if (winner) {
      try {
        await db.execute(
          'UPDATE remates SET estado = ?, ganador = ?, monto_venta = ? WHERE id = ?',
          ['finalizado', winner, highestAmount, remates_id]
        );
        console.log(`✅ Remate ${remates_id} finalizado. Ganador: ${winner}, Monto de venta: ${highestAmount}`);
      } catch (error) {
        console.error(`❌ Error al actualizar el remate ${remates_id}:`, error.message || error);
      }
    }

    io.to(remates_id).emit('auction-ended', 'La subasta ha finalizado');
    io.to(remates_id).emit('alert-auction-ended', { message: `Felicidades ${winner}, nos comunicaremos en 24 horas` });
    console.log(`⏰ Subasta ${remates_id} finalizada, chat deshabilitado`);

    delete auctionTimers[remates_id];
  }

  socket.on('chat-message', async ({ monto, usuarios_id, remates_id }) => {
    if (!remates_id || !usuarios_id || monto === undefined) {
      socket.emit('error-message', 'Datos incompletos para el mensaje');
      return;
    }

    const [row] = await db.execute('SELECT estado, precios, hora_remate FROM remates WHERE id = ?', [remates_id]);

    if (row.length === 0 || row[0].estado !== 'en_curso') {
      socket.emit('error-message', 'El chat no está habilitado en este momento');
      return;
    }

    const basePrice = parseFloat(row[0].precios);
    const chatStartTime = new Date();
    const [hour, minute, second] = row[0].hora_remate.split(':');
    chatStartTime.setHours(hour, minute, second);
    const currentTime = new Date();

    if (currentTime < chatStartTime) {
      socket.emit('error-message', 'El chat aún no está habilitado');
      return;
    }

    if (monto <= basePrice) {
      socket.emit('error-message', `La oferta debe ser mayor a USD$${basePrice}`);
      return;
    }

    try {
      await db.execute(
        'INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)',
        [monto, usuarios_id, remates_id]
      );

      const [userRows] = await db.execute('SELECT usuario FROM usuarios WHERE id = ?', [usuarios_id]);
      const usuario = userRows.length > 0 ? userRows[0].usuario : 'Anónimo';

      io.to(remates_id).emit('chat-message', { monto, usuario, remates_id });

      if (auctionTimers[remates_id]) {
        auctionTimers[remates_id].highestAmount = Math.max(monto, auctionTimers[remates_id].highestAmount || 0);
        if (auctionTimers[remates_id].highestAmount === monto) {
          auctionTimers[remates_id].highestBidder = usuario;
        }
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