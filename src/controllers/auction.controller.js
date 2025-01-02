// controllers/auction.controller.js
const Auction = require('../models/auction.model');
const db = require('../config/database'); // Asegúrate de tener acceso a la base de datos


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

    const auctionState = auction.estado || 'activo';

    // Renderizamos la vista con la subasta y el estado, el usuario estará en res.locals
    res.render('layouts/main', {
      auction,
      auctionState,
      content: 'auctions/details'  // Vista de detalle específica para esta subasta
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

    res.json({ message: 'Mensaje enviado' });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

exports.checkOpportunities = async (req, res) => {
  try {
    const userId = req.user?.id;
    const auctionId = req.body.auctionId; // El auctionId es pasado en el body

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    const [userRows] = await db.execute(
      'SELECT usuario_validado FROM usuarios WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userRows[0];

    // Verificar si el usuario está validado para el remate
    if (user.usuario_validado !== auctionId) {
      return res.status(403).json({ message: 'No estás validado para este remate' });
    }

    // Si el usuario está validado, continuar sin problemas
    res.json({ success: true });
  } catch (error) {
    console.error('Error al verificar validación:', error);
    res.status(500).json({ message: 'Error al verificar validación' });
  }
};

exports.getTopBids = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const topBids = await Auction.getTopBids(auctionId);
    res.json(topBids);
  } catch (error) {
    console.error('Error al obtener las mejores ofertas:', error);
    res.status(500).json({ message: 'Error al obtener las mejores ofertas' });
  }
};
