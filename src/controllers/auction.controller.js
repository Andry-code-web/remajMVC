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

/* exports.getAnexosByid = async (req, res) => {
  const { id } = req.params;
  console.log('ID recibido en el controlador:', id); // Depuración

  try {
    const anexos = await Auction.anexos(id);
    console.log('Datos obtenidos:', anexos); // Depuración
    res.json(anexos);
  } catch (error) {
    console.error('Error al obtener anexos:', error); // Depuración
    res.status(500).json({ error: error.message });
  }
}; */


exports.getAuctionDetails = async (req, res) => {
  try {
    const auctionId = req.params.id;

    // Obtén la subasta por su ID
    const auction = await Auction.getById(auctionId);

    // Si no existe la subasta, renderiza un error
    if (!auction) {
      return res.status(404).render('error', {
        message: 'Subasta no encontrada'
      });
    }

    // Obtén los anexos asociados a la subasta
    const anexos = await Auction.anexos(auctionId);

    const auctionState = auction.estado || 'activo';

    // Renderiza la vista con la subasta, los anexos y el estado
    res.render('layouts/main', {
      auction,
      anexos, // Pasamos los anexos a la vista
      auctionState,
      content: 'auctions/details' // Vista específica de los detalles
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