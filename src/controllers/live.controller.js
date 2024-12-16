const Live = require('../models/live.model');

// Controlador para obtener todas las subastas en vivo
exports.getAllLive = async (req, res) => {
    try {
        // Obtener datos principales de las subastas
        const liveData = await Live.getAll();

        // Obtener las imágenes relacionadas con los inmuebles
        const img_inmuebles = await Live.getImagenesInmuebles();

        // Combinar las subastas con sus respectivas imágenes
        const liveDataConImagenes = liveData.map(auction => {
            const imagen = img_inmuebles.find(img => img.remates_id === auction.id); // Buscar imagen correspondiente
            return {
                ...auction, // Mantener datos originales de la subasta
                imagen: imagen ? imagen.imagenes_inmueble : null // Agregar imagen si existe, o null si no
            };
        });

        // Renderizar la vista con los datos de subastas y sus imágenes
        res.render('live/live', {
            liveData: liveDataConImagenes, // Enviar datos procesados a la vista
        });
    } catch (error) {
        console.error('Error retrieving live data:', error); // Log de errores en el servidor
        res.status(500).render('error', { error: error.message }); // Mostrar error al usuario
    }
};

// Controlador para obtener una subasta en vivo específica por su ID
exports.getLiveById = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la subasta desde los parámetros de la URL
    try {
        // Obtener datos de la subasta específica
        const liveAuction = await Live.getById(id);

        // Obtener las imágenes relacionadas con los inmuebles
        const img_inmuebles = await Live.getImagenesInmuebles();

        // Asociar la imagen correspondiente a la subasta
        const imagen = img_inmuebles.find(img => img.remates_id === liveAuction.id);
        liveAuction.imagen = imagen ? imagen.imagenes_inmueble : null;

        // Renderizar la vista de detalles de la subasta con sus datos
        res.render('live/details', {
            auction: liveAuction,
        });
    } catch (error) {
        console.error('Error retrieving live auction by ID:', error); // Log de errores
        res.status(500).render('error', { error: error.message }); // Mostrar error al usuario
    }
};
