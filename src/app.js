const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require("morgan");
const flash = require('connect-flash');
const { setUserLocals } = require('./middleware/auth.middleware');
const db = require('./config/database')
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server,
  {
    conectionStateRecovery: {}
  }
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hora
  }
}));

app.use(flash());
app.use(morgan("dev"));
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
app.use('/admin', require('./routes/admin.routes'));

// Socket.IO
/* io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (data) => {
    console.log('Client joining room:', data.room);
    socket.join(data.room);
  });

  socket.on('submit-bid', async (data) => {
    console.log('New bid received:', data);
    io.to(`auction-${data.auctionId}`).emit('bid-accepted', {
      userId: data.userId,
      amount: data.amount,
      timestamp: data.timestamp
    });
  });

  socket.on('chat-message', (data) => {
    console.log('New chat message:', data);
    io.to(`auction-${data.auctionId}`).emit('chat-message', {
      userId: data.userId,
      message: data.message,
      timestamp: data.timestamp,
      username: data.username || 'Usuario'
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
 */




let highestAmount = 0; // Definir la variable globalmente

// Escuchar mensajes del cliente
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Escuchar mensajes del cliente
  socket.on('chat-message', async (msg) => {
    const { monto, usuarios_id, remates_id } = msg;

    try {
      // Realizar la consulta para obtener el nombre del usuario
      const [rows] = await db.execute('SELECT usuario FROM usuarios WHERE id = ?', [usuarios_id]);

      // Si el usuario no existe
      if (rows.length === 0) {
        socket.emit('error-message', 'Usuario no encontrado');
        return;
      }

      const usuarioNombre = rows[0].nombre; // Nombre del usuario

      // Validar que el monto sea mayor al monto más alto
      if (monto > highestAmount) {
        highestAmount = monto; // Actualizar el monto más alto

        // Guardar el mensaje en la base de datos
        await db.execute('INSERT INTO mensajes (monto, usuarios_id, remates_id) VALUES (?, ?, ?)', [
          monto,
          usuarios_id,
          remates_id,
        ]);
        console.log('✅ Mensaje guardado en la base de datos');

        // Emitir el mensaje a todos los clientes conectados
        io.emit('chat-message', { monto, usuario: usuarioNombre, remates_id });
      } else {
        console.log(`Monto rechazado: ${monto}. Debe ser mayor a ${highestAmount}`);
        socket.emit('error-message', `El monto debe ser mayor a ${highestAmount}`);
      }
    } catch (error) {
      console.error('❌ Error al obtener nombre de usuario:', error.message);
      socket.emit('error-message', 'Error al obtener nombre de usuario');
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});



const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
