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

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});



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



io.on('connection', (socket) => {
  console.log('New client connected')

  // Escuchar mensajes del cliente
  socket.on('chat-message', async (msg) => {
    // Guardar el mensaje en la base de datos
    try {
      await db.execute('INSERT INTO mensajes (monto) VALUES (?)', [msg]);
      console.log('✅ Mensaje guardado en la base de datos');
    } catch (error) {
      console.error('❌ Error al guardar mensaje:', error.message);
    }
    // Enviar mensaje a todos los clientes conectados
    io.emit('chat-message', msg)
  })

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})



const PORT = process.env.PORT || 5050;


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
