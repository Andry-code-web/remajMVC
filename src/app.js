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
      maxAge: 3600000, // 1 hora
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

// Socket.IO
let highestAmount = 0; // Variable global para el monto más alto

io.on('connection', (socket) => {
  console.log('🔵 Nuevo cliente conectado:', socket.id);

  // Escuchar mensajes del cliente
  socket.on('chat-message', async (msg) => {
    const { monto, usuarios_id, remates_id } = msg;

    try {
      // Verificar si el remates_id existe en la tabla remates
      const [remateRows] = await db.execute('SELECT id FROM remates WHERE id = ?', [remates_id]);
      if (remateRows.length === 0) {
        socket.emit('error-message', 'El ID del remate no existe.');
        console.log(`❌ Remate ID inválido: ${remates_id}`);
        return;
      }

      // Verificar si el usuario existe
      const [userRows] = await db.execute('SELECT usuario FROM usuarios WHERE id = ?', [usuarios_id]);
      if (userRows.length === 0) {
        socket.emit('error-message', 'Usuario no encontrado');
        console.log('❌ Usuario no encontrado en la base de datos');
        return;
      }

      const usuarioNombre = userRows[0].usuario;

      // Verificar si el monto es mayor al monto más alto
      if (monto > highestAmount) {
        highestAmount = monto;

        // Insertar el mensaje en la base de datos
        await db.execute(
          'INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)',
          [monto, usuarios_id, remates_id]
        );

        console.log('✅ Mensaje guardado en la base de datos');

        // Emitir mensaje a todos los clientes
        io.emit('chat-message', {
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

  // Evento de desconexión
  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});
