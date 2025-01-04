const Home = require('../models/home.model');

exports.getAllRemates = async (req, res) => {
  try {
    const rematesData = await Home.getAll();

    // Agrupamos las imágenes por remate, tomando solo la primera imagen
    const remates = rematesData.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          ...row,
          imagen: row.imagenes_inmueble || null, // Guardar la primera imagen encontrada
          anexos: [] // Inicializar anexos como un array vacío
        };
      }
      return acc;
    }, {});

    res.render('layouts/main', {
      content: 'home/index',
      remates: Object.values(remates)
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};

exports.getRemateDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const remateDetails = await Home.getRemateDetails(id);
    console.log(remateDetails); // Verifica los datos devueltos
    res.json(remateDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnexos = async (req, res) => {
  const { id } = req.params;
  try {
    const anexos = await Home.getAnexos(id);
    res.json(anexos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
