const Home = require('../models/home.model');

exports.getAllRemates = async (req, res) => {
  try {
    // Obtener la página desde los parámetros de la solicitud (por defecto 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    // Obtener los remates solo para la página solicitada
    const rematesData = await Home.getAll(page, limit);

    // Agrupar las imágenes por remate, tomando solo la primera imagen
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

    // Calcular el total de remates (para la paginación)
    const [totalRemates] = await db.execute('SELECT COUNT(*) AS total FROM remates');
    const totalPaginas = Math.ceil(totalRemates[0].total / limit);

    // Renderizar la vista con los remates y la paginación
    res.render('layouts/main', {
      content: 'home/index',
      remates: Object.values(remates),
      page, // Pasar la página actual a la vista
      totalPaginas // Pasar el total de páginas a la vista
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en la consulta");
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

    // Obtener el número de página desde la solicitud (por defecto es 1)
    const pagina = parseInt(req.query.page) || 1;
    const limite = 10; // O puedes definirlo como lo desees, por ejemplo 10 resultados por página

    // Llama al modelo para obtener los resultados filtrados con paginación
    const remates = await Home.getFiltro(filtro, pagina, limite);

    // Obtener el total de remates para calcular el número de páginas
    const totalRemates = await Home.getTotalRemates(filtro);

    // Calcular el número total de páginas
    const totalPaginas = Math.ceil(totalRemates / limite);

    // Renderiza la vista con los resultados y la paginación
    res.render('layouts/main', {
      content: 'home/index',
      remates,
      pagina,
      totalPaginas,
      filtro,  // Opcional: si deseas que los filtros seleccionados se mantengan
    });
  } catch (error) {
    console.error("Error al obtener remates filtrados:", error);
    res.status(500).send("Ocurrió un error al filtrar los remates.");
  }
};
