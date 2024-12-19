// live.controller.js
const Live = require('../models/live.model');

// Controlador para obtener todos los live
exports.getAllLive = async (req, res) => {
    try {
        const liveData = await Live.getAll();
        const imgInmuebles = await Live.getImagenesInmuebles();

        // Traer los datos de inmuebles, cronograma y detalles para cada remate
        const liveDataConImagenes = await Promise.all(liveData.map(async (auction) => {
            const inmuebles = await Live.getInmuebles(auction.id);
            const cronograma = await Live.getCronograma(auction.id);
            const detalles = await Live.getDetalles(auction.id);
            return {
                ...auction,
                imagen: imgInmuebles.find(img => img.remates_id === auction.id)?.imagenes_inmueble || '/img/default.png',
                inmuebles,
                cronograma,
                detalles
            };
        }));

        res.render('live/live', { liveData: liveDataConImagenes });
    } catch (error) {
        console.error('Error retrieving live data:', error);
        res.status(500).render('error', { error: error.message });
    }
};


exports.getTrackingData = async (req, res) => {
    try {
        const id = req.params.id;
        const detalles = await Live.getDetalles(id);
        res.json(detalles);
    } catch (error) {
        console.error('Error retrieving tracking data:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
};

exports.getDetailsData = async (req, res) => {
    try {
        const id = req.params.id;
        const detalles = await Live.getDetalles(id);
        res.json(detalles);
    } catch (error) {
        console.error('Error retrieving details:', error);
        res.status(500).json({ error: 'Error retrieving details' });
    }
};
