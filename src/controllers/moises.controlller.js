
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.getAll();
    res.render('layouts/views', { 
      content: 'auctions/btn_menu',
      auctions
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};