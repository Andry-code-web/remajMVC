const Home = require('../models/home.model');
const db = require('../config/database');

exports.getAllRemates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query('SELECT COUNT(DISTINCT r.id) as total FROM remates r');
    const totalPages = Math.ceil(total / limit);

    const rematesData = await Home.getAll({ limit, offset });

    // Obtener anexos para cada remate
    for (const remate of rematesData) {
      const anexos = await Home.getAnexos(remate.id);
      remate.anexos = anexos;
    }

    const rematesList = rematesData.map(remate => ({
      ...remate,
      imagen: remate.imagenes_inmueble ? Buffer.from(remate.imagenes_inmueble).toString('base64') : null,
      anexos: remate.anexos // Asegúrate de pasar los anexos
    }));

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
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    const filtro = {
      id: req.body.id,
      ubicacion: req.body.ubicacion,
      precio: req.body.precio,
      partida_registral: req.body.partida_registral,
      categoria: req.body.categoria,
      limit,
      offset
    };

    const { remates, total } = await Home.getFiltro(filtro);

    if (remates.length === 0) {
      return renderErrorPage(res, {
        error: 'No se encontraron resultados para tu búsqueda.',
        total: 0
      });
    }

    const totalPages = Math.ceil(total / limit);
    const paginationData = {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      total
    };

    const rematesConImagenes = remates.map(remate => ({
      ...remate,
      imagen: remate.imagen ? Buffer.from(remate.imagen).toString('base64') : null
    }));

    res.render('layouts/main', {
      content: 'home/index',
      remates: rematesConImagenes,
      pagination: paginationData
    });

  } catch (error) {
    console.error("Error al obtener remates filtrados:", error);
    renderErrorPage(res, {
      error: 'Ocurrió un error al filtrar los remates.',
      total: 0
    });
  }
};

function renderErrorPage(res, { error, total }) {
  res.render('layouts/main', {
    content: 'home/index',
    remates: [],
    error,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: 1,
      prevPage: 1,
      total
    }
  });
}

exports.getFiltrarRemateG = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    const categoria = req.query.categoria || null;
    const filtro = { categoria, limit, offset };

    const { remates, total } = await Home.getFiltro(filtro);
    const totalPages = Math.ceil(total / limit);

    const rematesConImagenes = remates.map(remate => ({
      ...remate,
      imagen: remate.imagen ? Buffer.from(remate.imagen).toString('base64') : null
    }));

    res.render('layouts/main', {
      content: 'home/index',
      remates: rematesConImagenes,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        total
      },
      error: remates.length === 0 ? 'No se encontraron resultados para tu búsqueda.' : null
    });

  } catch (error) {
    console.error("Error al obtener remates filtrados:", error);
    res.render('layouts/main', {
      content: 'home/index',
      remates: [],
      error: 'Ocurrió un error al filtrar los remates.',
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: 1,
        prevPage: 1,
        total: 0
      }
    });
  }
};

exports.checkOpportunities = async (req, res) => {
  try {
    const userId = req.user?.id;
    const auctionId = req.body.auctionId; // El auctionId es pasado en el body

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    const [userRows] = await db.execute(
      'SELECT * FROM usuario_remate WHERE usuario_id = ? AND remate_id = ?',
      [userId, auctionId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o no está validado para este remate' });
    }

    const user = userRows[0];

    console.log('Usuario validado:', user.validado); // Depuración
    console.log('Auction ID:', auctionId); // Depuración

    // Verificar si el usuario está validado para el remate
    if (user.validado !== 1) {
      return res.status(403).json({ message: 'No estás validado para este remate' });
    }

    // Si el usuario está validado, continuar sin problemas
    res.json({ success: true });
  } catch (error) {
    console.error('Error al verificar validación:', error);
    res.status(500).json({ message: 'Error al verificar validación' });
  }
};

/* funcion dar like  */

exports.toggleLike = async (req, res) => {
  const { remateId } = req.body;
  const userId = req.user.id;

  try {
    if (await Home.hasLiked(userId, remateId)) {
      await Home.removeLike(userId, remateId);
      res.json({ message: 'Like removido' });
    } else {
      await Home.addLike(userId, remateId);
      res.json({ message: 'Like añadido' });
    }
  } catch (error) {
    console.error('Error al manejar like:', error);
    res.status(500).json({ error: 'Error al manejar like' });
  }
};
/* verificación de likes */
exports.checkLike = async (req, res) => {
  const { remateId } = req.query;
  const userId = req.user.id;

  try {
    const liked = await Home.hasLiked(userId, remateId);
    res.json({ liked });
  } catch (error) {
    console.error('Error al verificar like:', error);
    res.status(500).json({ error: 'Error al verificar like' });
  }
};
