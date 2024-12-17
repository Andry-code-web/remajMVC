const Auction = require('../models/auction.model');


exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.getAll();
    res.render('layouts/main', { 
      content: 'auctions/mapa',
      auctions
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};


exports.getAuctionDetails = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const auction = await Auction.getById(auctionId);
    
    if (!auction) {
      return res.status(404).render('error', { 
        message: 'Subasta no encontrada'
      });
    }

    // Asignar el estado de la subasta para pasarlo a la vista
    const auctionState = auction.estado || 'activo';
    
    res.render('layouts/main', {
      auction,
      auctionState,  // Aquí pasamos el estado de la subasta
      content: 'auctions/details',
    });
  } catch (error) {
    console.error('Error al obtener detalles de la subasta:', error);
    res.status(500).render('error', { 
      message: 'Error al cargar los detalles de la subasta'
    });
  }
};


exports.joinAuction = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    const auction = await Auction.getById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    if (auction.estado !== 'en_curso') {
      return res.status(400).json({ message: 'La subasta no está en curso' });
    }

    // Here you could add logic to track auction participants if needed
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al unirse a la subasta:', error);
    res.status(500).json({ message: 'Error al unirse a la subasta' });
  }
};

exports.submitBid = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    const auction = await Auction.getById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    if (auction.estado !== 'en_curso') {
      return res.status(400).json({ message: 'La subasta no está activa' });
    }

    if (amount <= auction.monto_venta) {
      return res.status(400).json({ message: 'La oferta debe ser mayor que el precio actual' });
    }

    await Auction.updatePrice(auctionId, amount);
    res.json({ success: true, newAmount: amount });
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

    // Aquí podrías guardar el mensaje en la base de datos si lo deseas
    res.json({ message: 'Mensaje enviado' });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};