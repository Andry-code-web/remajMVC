// live.controller.js
const Live = require('../models/live.model');

// Controlador para obtener todos los live
exports.getAllLive = async (req, res) => {
    try {
        const liveData = await Live.getAll();
        const imgInmuebles = await Live.getImagenesInmuebles();

        // Traer los datos de inmuebles y cronograma para cada remate
        const liveDataConImagenes = await Promise.all(liveData.map(async (auction) => {
            const inmuebles = await Live.getInmuebles(auction.id);
            const cronograma = await Live.getCronograma(auction.id);
            return {
                ...auction,
                imagen: imgInmuebles.find(img => img.remates_id === auction.id)?.imagenes_inmueble || '/img/default.png',
                inmuebles,
                cronograma
            };
        }));

        res.render('live/live', { liveData: liveDataConImagenes });
    } catch (error) {
        console.error('Error retrieving live data:', error);
        res.status(500).render('error', { error: error.message });
    }
};
