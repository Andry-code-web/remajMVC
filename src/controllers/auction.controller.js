const Auction = require('../models/auction.model');
const Bid = require('../models/bid.model');
const moment = require('moment');

exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.getAll();
    res.render('layouts/main', { 
      content: 'auctions/index',
      auctions
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};

exports.getAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.getById(req.params.id);
    if (!auction) {
      return res.status(404).render('error', { error: 'Auction not found' });
    }

    const now = moment();
    const auctionDate = moment(auction.fecha_remate);
    const auctionTime = moment(auction.hora_remate, 'HH:mm:ss');

    if (auction.estado === 'finalizado') {
      auction.statusMessage = 'Subasta finalizada';
    } else if (now.isSame(auctionDate, 'day') && 
               now.isBetween(auctionTime, auctionTime.clone().add(2, 'hours'))) {
      auction.estado = 'en_curso';
      auction.statusMessage = 'Subasta en curso';
    } else if (now.isBefore(auctionDate)) {
      auction.estado = 'activo';
      auction.statusMessage = 'Subasta próximamente';
    }

    const highestBid = await Bid.getHighestBid(auction.id);
    if (highestBid) {
      auction.precios = highestBid.monto_oferta;
    }

    await Auction.updateStatus(auction.id, auction.estado);
    res.render('auctions/details', { 
      auction,
      user: req.session.user
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};