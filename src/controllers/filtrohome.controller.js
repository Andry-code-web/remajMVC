const filtrohomeModel = require('../models/filtrohome.model'); // Asegúrate de la ruta correcta

async function filtrarRemates(req, res) {
    const { remates_id, expediente, precio_base, distrito_judicial } = req.query;

    // Validamos que los parámetros existan
    if (!remates_id || !expediente || !precio_base || !distrito_judicial) {
        return res.status(400).send('Faltan parámetros para filtrar');
    }

    const params = {
        remates_id: remates_id,
        expediente: expediente,
        precio_base: precio_base,
        distrito_judicial: distrito_judicial
    };

    try {
        const results = await filtrohomeModel.obtenerFiltrados(params);
        res.render('remates', { remates: results }); // Renderizar la vista con los resultados
    } catch (err) {
        console.error('Error al filtrar remates:', err);
        res.status(500).send('Error al filtrar remates');
    }
}

module.exports = { filtrarRemates };


/* const FiltroHome = require('../models/filtrohome.model');

exports.getFiltarRemates = async (req, res) => {
  
};
 */