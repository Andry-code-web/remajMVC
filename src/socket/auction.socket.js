const moment = require('moment');
const Auction = require('../models/auction.model');
const User = require('../models/user.model');
const Bid = require('../models/bid.model');
const Message = require('../models/message.model');

class AuctionSocket {
  constructor(io) {
    this.io = io;
    this.activeAuctions = new Map();
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      socket.on('join-auction', async (data) => {
        try {
          // Validar datos de entrada
          const { auctionId, userId } = data;
          if (!auctionId || !userId) {
            return socket.emit('error', { message: 'Datos de entrada inválidos. Asegúrate de proporcionar auctionId y userId.' });
          }
      
          // Obtener datos del usuario y la subasta
          const user = await User.findById(userId);
          const auction = await Auction.getById(auctionId);
      
          // Validar si existen la subasta y el usuario
          if (!auction) {
            return socket.emit('error', { message: 'Subasta no encontrada.' });
          }
          if (!user) {
            return socket.emit('error', { message: 'Usuario no encontrado.' });
          }
      
          // Unir al socket a la sala específica de la subasta
          const roomName = `auction-${auctionId}`;
          socket.join(roomName);
      
          // Si la subasta no está en el mapa de subastas activas, agregarla
          if (!this.activeAuctions.has(auctionId)) {
            this.activeAuctions.set(auctionId, {
              currentBid: auction.precios,
              participants: new Map()
            });
          }
      
          // Agregar al usuario como participante en la subasta activa
          const auctionRoom = this.activeAuctions.get(auctionId);
          auctionRoom.participants.set(userId, {
            socket: socket.id,
            username: user.nombres_apellidos
          });
      
          // Notificar a todos los participantes que un usuario se unió
          this.io.to(roomName).emit('user-joined', {
            userId,
            username: user.nombres_apellidos
          });
      
          // Obtener y enviar el historial de los últimos 50 mensajes al usuario que se conecta
          const messages = await Message.getLastMessages(auctionId, 50);
          socket.emit('message-history', messages);
      
        } catch (error) {
          // Manejo de errores
          console.error('Error al unirse a la subasta:', error);
          socket.emit('error', { message: 'Hubo un problema al intentar unirse a la subasta. Por favor, intenta nuevamente.' });
        }
      });
      

      socket.on('new-bid', async (data) => {
        try {
          const { auctionId, userId, amount } = data;
          const auctionRoom = this.activeAuctions.get(auctionId);
          
          if (!auctionRoom || amount <= auctionRoom.currentBid) return;

          const user = await User.findById(userId);
          if (!user) return;

          // Save bid to database
          await Bid.create({
            userId,
            auctionId,
            amount,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
          });

          auctionRoom.currentBid = amount;

          this.io.to(`auction-${auctionId}`).emit('new-bid', {
            userId,
            username: user.nombres_apellidos,
            amount
          });

        } catch (error) {
          console.error('Error processing bid:', error);
        }
      });

      socket.on('chat-message', async (data) => {
        try {
          const { auctionId, userId, message } = data;
          const user = await User.findById(userId);
          if (!user) return;

          // Save message to database
          await Message.create({
            userId,
            auctionId,
            message,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
          });

          this.io.to(`auction-${auctionId}`).emit('chat-message', {
            userId,
            username: user.nombres_apellidos,
            message,
            timestamp: moment().format('HH:mm')
          });

        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleDisconnect(socket) {
    for (const [auctionId, auction] of this.activeAuctions) {
      for (const [userId, participant] of auction.participants) {
        if (participant.socket === socket.id) {
          auction.participants.delete(userId);
          
          this.io.to(`auction-${auctionId}`).emit('user-left', {
            userId,
            username: participant.username
          });

          if (auction.participants.size === 0) {
            this.activeAuctions.delete(auctionId);
          }
          
          break;
        }
      }
    }
  }
}

module.exports = AuctionSocket;