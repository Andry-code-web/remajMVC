const Live = require('../models/live.model');

// Controlador para obtener todos los live
exports.getAllLive = async (req, res) => {
    try {
        const liveData = await Live.getAll();
        const imgInmuebles = await Live.getImagenesInmuebles();

        const liveDataConImagenes = liveData.map(auction => ({
            ...auction,
            imagen: imgInmuebles.find(img => img.remates_id === auction.id)?.imagenes_inmueble || null
        }));

        res.render('live/live', { liveData: liveDataConImagenes });
    } catch (error) {
        console.error('Error retrieving live data:', error);
        res.status(500).render('error', { error: error.message });
    }
};

// Controlador para obtener un live específico por ID
exports.getLiveById = async (req, res) => {
    const { id } = req.params;
    try {
        const auction = await Live.getById(id);
        const imgInmuebles = await Live.getImagenesInmuebles();

        auction.imagen = imgInmuebles.find(img => img.remates_id === auction.id)?.imagenes_inmueble || null;

        res.render('live/details', { auction });
    } catch (error) {
        console.error('Error retrieving live auction by ID:', error);
        res.status(500).render('error', { error: error.message });
    }
};


exports.getInmueblesByAuctionId = async (req, res) => {
    const { auctionId } = req.params;
    try {
        const inmuebles = await Live.getInmueblesByAuctionId(auctionId);
        res.json({ success: true, data: inmuebles });
    } catch (error) {
        console.error('Error retrieving inmuebles:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCronogramaByAuctionId = async (req, res) => {
    const { auctionId } = req.params;
    try {
        const cronograma = await Live.getCronogramaByAuctionId(auctionId);
        res.json({ success: true, data: cronograma });
    } catch (error) {
        console.error('Error retrieving cronograma:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};