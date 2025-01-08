const Home = require('../models/home.model');
const db = require('../config/database');

exports.getAllRemates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Elementos por página
    const offset = (page - 1) * limit;

    // Obtener total de registros para calcular páginas
    const [[{ total }]] = await db.query(`
      SELECT COUNT(DISTINCT r.id) as total 
      FROM remates r
    `);

    const totalPages = Math.ceil(total / limit);

    // Obtener remates paginados
    const rematesData = await Home.getAll({ limit, offset });

    // Agrupamos las imágenes por remate
    const remates = rematesData.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          ...row,
          imagen: row.imagenes_inmueble || null,
          anexos: []
        };
      }
      return acc;
    }, {});

    // Obtener anexos para cada remate
    for (const remateId in remates) {
      const anexos = await Home.getAnexos(remateId);
      remates[remateId].anexos = anexos;
    }

    // Verificar que tengamos exactamente 'limit' resultados o menos en la última página
    const rematesList = Object.values(remates);
    console.log(`Número de remates en la página ${page}: ${rematesList.length}`);

    const pagination = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      total
    };

    res.render('layouts/main', {
      content: 'home/index',
      remates: rematesList,
      pagination
    });

  } catch (error) {
    console.error('Error en getAllRemates:', error);
    res.render('layouts/main', {
      content: 'home/index',
      remates: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: 1,
        prevPage: 1,
        total: 0
      },
      error: 'Ha ocurrido un error al cargar los remates.'
    });
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
