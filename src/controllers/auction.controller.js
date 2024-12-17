const Auction = require('../models/auction.model');

exports.getAuctionDetails = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const auction = await Auction.getById(auctionId);
    
    if (!auction) {
      return res.status(404).render('error', { 
        message: 'Subasta no encontrada'
      });
    }

    auction.statusMessage = getStatusMessage(auction.estado);
    
    res.render('auctions/details', {
      auction,
      user: res.locals.user || { id: null }
    });
  } catch (error) {
    console.error('Error al obtener detalles de la subasta:', error);
    res.status(500).render('error', { 
      message: 'Error al cargar los detalles de la subasta'
    });
  }
};

exports.submitBid = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    const auction = await Auction.getById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    if (auction.estado !== 'en_curso') {
      return res.status(400).json({ message: 'La subasta no está activa' });
    }

    if (amount <= auction.precios) {
      return res.status(400).json({ message: 'La oferta debe ser mayor que el precio actual' });
    }

    await Auction.updatePrice(auctionId, amount, userId);
    res.json({ message: 'Oferta aceptada' });
  } catch (error) {
    console.error('Error al procesar la oferta:', error);
    res.status(500).json({ message: 'Error al procesar la oferta' });
  }
};

exports.submitMessage = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const auction = await Auction.getById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    if (auction.estado !== 'en_curso') {
      return res.status(400).json({ message: 'El chat está cerrado' });
    }

    res.json({ message: 'Mensaje enviado' });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

function getStatusMessage(estado) {
  const messages = {
    'en_curso': 'En curso',
    'finalizada': 'Finalizada',
    'pendiente': 'Próximamente',
    'cancelada': 'Cancelada'
  };
  return messages[estado] || estado;
}