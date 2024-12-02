const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require("morgan");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(morgan("dev"));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/auctions', require('./routes/auction.routes'));
app.use('/btn_menu', require('./routes/btn_menu.routes'));
// Socket.IO
io.on('connection', (socket) => {
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
  });

  socket.on('bid', async (data) => {
    // Handle bid logic
    io.to(`auction-${data.auctionId}`).emit('new-bid', {
      userId: data.userId,
      amount: data.amount
    });
  });
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

