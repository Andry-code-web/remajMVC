const Live = require('../models/live.model');

// Controlador para obtener todos los live
exports.getAllLive = async (req, res) => {
    try {
        const liveData = await Live.getAll();
        const imgInmuebles = await Live.getImagenesInmuebles();
            
        // Traer los datos de inmuebles, cronograma y detalles para cada remate
        const liveDataConImagenes = await Promise.all(liveData.map(async (auction) => {
            // Verificar si 'auction' tiene los datos necesarios
            if (!auction || !auction.id) {
                console.error('Auction data missing for ID:', auction ? auction.id : 'Unknown');
                return null; // O algún valor por defecto si prefieres manejarlo de otra manera
            }
        
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

        const validLiveData = liveDataConImagenes.filter(data => data !== null);
        // Pasar los datos válidos a la vista
        res.render('live/live', { liveData: validLiveData });
        res.render('live/live', { liveData: liveDataConImagenes });
    } catch (error) {
        console.error('Error retrieving live data:', error);
        res.status(500).render('error', { error: error.message });
    }
};

// Controlador para obtener detalles de la subasta
exports.getSubastaDetails = async (req, res) => {
    try {
        const id = req.params.id; // Obtener el id de la URL
        const auction = await Live.getById(id); // Obtener la subasta por ID
        const inmuebles = await Live.getInmuebles(id); // Obtener los inmuebles asociados
        const cronograma = await Live.getCronograma(id); // Obtener el cronograma asociado
        const detalles = await Live.getDetalles(id); // Obtener los detalles de la subasta

        if (!auction) {
            return res.status(404).json({ error: 'No se encontró la subasta con este ID' });
        }

        // Renderizar la vista con los detalles de la subasta
        res.render('subasta-details', {
            auction,
            inmuebles,
            cronograma,
            detalles
        });
    } catch (error) {
        console.error('Error retrieving subasta details:', error);
        res.status(500).json({ error: 'Error retrieving subasta details' });
    }
};

// Controlador para obtener detalles específicos de la subasta
exports.getSubastaDetalles = async (req, res) => {
    try {
        const id = req.params.id; // Obtener el ID de la URL
        const auction = await Live.getById(id); // Obtener los detalles de la subasta
        if (!auction) {
            return res.status(404).json({ error: 'No se encontró la subasta con este ID' });
        }
        res.render('subasta-detalles', { auction }); // Renderiza la vista con los detalles
    } catch (error) {
        console.error('Error retrieving subasta detalles:', error);
        res.status(500).json({ error: 'Error retrieving subasta detalles' });
    }
};

// Controlador para obtener el cronograma de la subasta
exports.getSubastaCronograma = async (req, res) => {
    try {
        const id = req.params.id; // Obtener el ID de la URL
        const cronograma = await Live.getCronograma(id); // Obtener el cronograma de la subasta
        if (!cronograma) {
            return res.status(404).json({ error: 'No se encontró el cronograma con este ID' });
        }
        res.render('subasta-cronograma', { cronograma }); // Renderiza la vista con el cronograma
    } catch (error) {
        console.error('Error retrieving subasta cronograma:', error);
        res.status(500).json({ error: 'Error retrieving subasta cronograma' });
    }
};

// Función para obtener los detalles de la subasta (Ejemplo adicional si se necesita)
async function getDetalles() {
    try {
        const detalles = await Detalles.findAll();
        console.log(detalles);
        return detalles;
    } catch (error) {
        console.error('Error al obtener los detalles:', error);
    }
}
