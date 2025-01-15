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
      // Verificar el estado de la subasta
      const [row] = await db.execute('SELECT estado FROM remates WHERE id = ?', [remates_id]);
      if (row.length === 0) {
        socket.emit('error-message', 'Remate no encontrado');
        return;
      }

      const estadoRemate = row[0].estado;

      if (estadoRemate === 'finalizado') {
        socket.emit('error-message', 'La subasta ha finalizado, el chat está deshabilitado');
        return;
      }

      // Obtener la fecha y hora de inicio del remate
      const [rows] = await db.execute('SELECT fecha_remate, hora_remate FROM remates WHERE id = ?', [remates_id]);
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
          chatEnabled: true, // Inicialmente el chat está habilitado
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

  async function startAuctionTimer(remates_id, durationInSeconds = 6 * 60 * 60) {
    // Cancelar temporizador existente si existe
    if (auctionTimers[remates_id]?.intervalId) {
      clearInterval(auctionTimers[remates_id].intervalId);
      console.log(`⏹️ Temporizador existente cancelado para la subasta ${remates_id}`);
    }

    // Inicializar tiempo restante
    let remainingTime = durationInSeconds;

    // Función para finalizar la subasta
    async function finalizeAuction() {
      clearInterval(auctionTimers[remates_id]?.intervalId);
      const { highestAmount = 0, highestBidder: winner = null } = auctionTimers[remates_id] || {};
    
      if (winner) {
        try {
          // Actualizar la base de datos con los resultados de la subasta
          await db.execute(
            'UPDATE remates SET estado = ?, ganador = ?, monto_venta = ? WHERE id = ?',
            ['finalizado', winner, highestAmount, remates_id]
          );
          console.log(`✅ Remate ${remates_id} finalizado. Ganador: ${winner}, Monto de venta: ${highestAmount}`);
        } catch (error) {
          console.error(`❌ Error al actualizar el remate ${remates_id}:`, error.message || error);
        }
      }
    
      // Emitir eventos de finalización y deshabilitar el chat
      io.to(remates_id).emit('auction-ended', 'La subasta ha finalizado');
      io.to(remates_id).emit('alert-auction-ended', { message: `Felicidades ${winner}, nos comunicaremos en 24 horas` }); // Emitir evento alert-auction-ended con mensaje personalizado
      console.log(`⏰ Subasta ${remates_id} finalizada, chat deshabilitado`);
    
      // Cambiar estado a "finalizado" cuando la subasta termine
      try {
        await db.execute(
          'UPDATE remates SET estado = ? WHERE id = ?',
          ['finalizado', remates_id] // Cambiar estado a "finalizado"
        );
        console.log(`✅ Estado de la subasta ${remates_id} actualizado a "finalizado"`);
      } catch (error) {
        console.error(`❌ Error al actualizar el estado de la subasta ${remates_id}:`, error.message || error);
      }
    
      // Eliminar el temporizador de la memoria
      delete auctionTimers[remates_id];
    }
    

    // Iniciar el temporizador
    const intervalId = setInterval(async () => {
      if (remainingTime > 0) {
        // Actualizar el tiempo restante
        io.to(remates_id).emit('timer-update', remainingTime);
        remainingTime--;
      } else {
        await finalizeAuction();
      }
    }, 1000);

    // Actualizar el estado de la subasta a "en curso" en la base de datos
    try {
      await db.execute(
        'UPDATE remates SET estado = ? WHERE id = ?',
        ['en_curso', remates_id] // Cambiar estado a "en_curso"
      );
      console.log(`✅ Estado de la subasta ${remates_id} actualizado a "en curso"`);
    } catch (error) {
      console.error(`❌ Error al actualizar el estado de la subasta ${remates_id}:`, error.message || error);
    }

    // Emitir el evento de que la subasta ha comenzado
    io.to(remates_id).emit('auction-started', 'La subasta ha comenzado');
    io.to(remates_id).emit('chat-enabled', true); // Habilitar el chat

    // Guardar el temporizador en la estructura global
    auctionTimers[remates_id] = { intervalId, remainingTime };
    console.log(`⏳ Temporizador iniciado para la subasta ${remates_id}, duración: ${durationInSeconds} segundos`);
  }

  socket.on('chat-message', async ({ monto, usuarios_id, remates_id }) => {
    if (!remates_id || !usuarios_id || monto === undefined) {
      socket.emit('error-message', 'Datos incompletos para el mensaje');
      return;
    }

    // Verificar el estado de la subasta antes de permitir el mensaje
    const [row] = await db.execute('SELECT estado FROM remates WHERE id = ?', [remates_id]);
    if (row.length === 0 || row[0].estado !== 'en_curso') {
      socket.emit('error-message', 'El chat no está habilitado en este momento');
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