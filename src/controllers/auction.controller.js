const Auction = require('../models/auction.model');
const moment = require('moment');

exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.getAll();
    res.render('auctions/index', { auctions });
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

    await Auction.updateStatus(auction.id, auction.estado);
    res.render('auctions/detail', { auction });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};