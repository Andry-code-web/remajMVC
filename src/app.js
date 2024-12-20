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

io.on('connection', (socket) => {
  console.log('🔵 Nuevo cliente conectado:', socket.id);

  socket.on('join-auction', async (remates_id) => {
    socket.join(remates_id);
    console.log(`Cliente ${socket.id} se unió al remate ${remates_id}`);

    try {
      // Retrieve persisted messages from the database
      const [messages] = await db.execute(
        'SELECT m.monto, u.usuario, m.remates_id FROM mensajes m INNER JOIN usuarios u ON m.usuarios_id = u.id WHERE m.remates_id = ? ORDER BY m.id ASC',
        [remates_id]
      );

      // Emit messages to the client
      socket.emit('load-messages', messages);

      // Emit initial alert
      const mensaje = `Bienvenido al remate ${remates_id}`;
      socket.emit('site-alert', mensaje);

    } catch (error) {
      console.error('❌ Error al cargar mensajes persistentes:', error.message);
    }
  });

  socket.on('start-auction-timer', (remates_id) => {
    console.log(`⏳ Temporizador iniciado para remate ${remates_id}`);
    
    let countdown = 30;  // Timer duration in seconds
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
});


// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});