const Live = require('../models/live.model');

exports.getAllLive = async (req, res) => {
    try {
        const liveData = await Live.getAll();

        const img_inmuebles = await Live.getImagenesInmuebles();

        const liveDataConImagenes = liveData.map(auction => {
            const imagen = img_inmuebles.find(img => img.remates_id === auction.id); 
            return {
                ...auction, 
                imagen: imagen ? imagen.imagenes_inmueble : null 
            };
        });

        res.render('live/live', {
            liveData: liveDataConImagenes,
        });
    } catch (error) {
        console.error('Error retrieving live data:', error); 
        res.status(500).render('error', { error: error.message }); 
    }
};

exports.getLiveById = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la subasta desde los parámetros de la URL
    try {
        const liveAuction = await Live.getById(id);

        const img_inmuebles = await Live.getImagenesInmuebles();

        const imagen = img_inmuebles.find(img => img.remates_id === liveAuction.id);
        liveAuction.imagen = imagen ? imagen.imagenes_inmueble : null;

        res.render('live/details', {
            auction: liveAuction,
        });
    } catch (error) {
        console.error('Error retrieving live auction by ID:', error); // Log de errores
        res.status(500).render('error', { error: error.message }); // Mostrar error al usuario
    }
};
