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
const lastSentMessages = {}; // Guardará el último monto procesado por remate para evitar duplicados

io.on('connection', (socket) => {
  console.log('🔵 Nuevo cliente conectado:', socket.id);

  socket.on('join-auction', async (remates_id) => {
    socket.join(remates_id);
    console.log(`Cliente ${socket.id} se unió al remate ${remates_id}`);

    try {
      const [messages] = await db.execute(
        'SELECT m.monto, u.usuario, m.remates_id FROM mensajes m INNER JOIN usuarios u ON m.usuarios_id = u.id WHERE m.remates_id = ? ORDER BY m.id ASC',
        [remates_id]
      );

      socket.emit('load-messages', messages);

      const mensaje = `Bienvenido al remate ${remates_id}`;
      socket.emit('site-alert', mensaje);

    } catch (error) {
      console.error('❌ Error al cargar mensajes persistentes:', error.message);
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

      const [highestRow] = await db.execute(
        'SELECT IFNULL(MAX(monto), 0) as highestAmount FROM mensajes WHERE remates_id = ?',
        [remates_id]
      );
      const currentHighestAmount = highestRow[0].highestAmount;

      // Verificamos si el monto ya fue procesado
      if (lastSentMessages[remates_id] && lastSentMessages[remates_id] === monto) {
        socket.emit('error-message', `Este monto ya ha sido enviado: USD$${monto}`);
        return; // No enviar el mensaje si el monto ya fue enviado
      }

      // Solo se permite si la oferta es mayor que el monto más alto actual
      if (monto > currentHighestAmount) {
        await db.execute(
          'INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)',
          [monto, usuarios_id, remates_id]
        );

        // Guardar el monto como el último procesado para este remate
        lastSentMessages[remates_id] = monto;

        io.to(remates_id).emit('chat-message', {
          monto,
          usuario: usuarioNombre,
          remates_id,
        });

      } else {
        socket.emit('error-message', `El monto debe ser mayor a USD$${currentHighestAmount}`);
      }
    } catch (error) {
      socket.emit('error-message', 'Ocurrió un error al procesar tu oferta');
      console.error('❌ Error al procesar mensaje:', error);
    }
  });
});


// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});