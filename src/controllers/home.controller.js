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

    // Obtener anexos para cada remate
    for (const remateId in remates) {
      const anexos = await Home.getAnexos(remateId);
      remates[remateId].anexos = anexos;
    }

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


exports.getFiltrarRemate = async (req, res) => {
  try {
    // Obtener los parámetros de filtro desde el cuerpo de la solicitud
    const filtro = {
      id: req.body.id,
      ubicacion: req.body.ubicacion,
      precio: req.body.precio,
      partida_registral: req.body.partida_registral,
      categoria: req.body.categoria, // Asegúrate de que este campo esté en el cuerpo de la solicitud
    };

    // Llama al modelo para obtener los resultados filtrados con paginación
    const remates = await Home.getFiltro(filtro);


    // Renderiza la vista con los resultados y la paginación
    res.render('layouts/main', {
      content: 'home/index',
      remates,
    });
  } catch (error) {
    console.error("Error al obtener remates filtrados:", error);
    res.status(500).send("Ocurrió un error al filtrar los remates.");
  }
};
