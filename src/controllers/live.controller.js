const Live = require("../models/live.model");

exports.getEnVivo = async (req, res) => {
  try {
    const liveData = await Live.getAll();
    const imgInmuebles = await Live.getImagenesInmuebles();

    const liveDataConImagenes = await Promise.all(
      liveData.map(async (auction) => {
        try {
          return {
            ...auction,
            imagen:
              imgInmuebles.find((img) => img.remates_id === auction.id)
                ?.imagenes_inmueble || "/img/default.png", // Imagen por defecto si no tiene
          };
        } catch (err) {
          console.error(`Error al procesar la subasta ID ${auction.id}:`, err);
          return null;
        }
      })
    );

    const validLiveData = liveDataConImagenes.filter((data) => data !== null);

    res.render("live/en_vivo", { liveData: validLiveData });
  } catch (error) {
    console.error("Error al obtener los datos de las subastas:", error);
    res.status(500).render("error", { message: "Error al cargar los datos" });
  }
};



// controlador de seguimiento
exports.getSeguimiento = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const seguimiento = await Live.getSeguimiento(auctionId);

    if (!seguimiento || seguimiento.length === 0) {
      return res
        .status(404)
        .render("error", { message: "Seguimiento no encontrado" });
    }

    res.render("live/seguimiento", { seguimiento, auctionId });
  } catch (error) {
    console.error("Error al obtener seguimiento:", error);
    res
      .status(500)
      .render("error", { message: "Error al cargar el seguimiento" });
  }
};


//controlador de detalles
exports.getDetalles = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const detalles = await Live.getDetalles(auctionId);

    if (!detalles) {
      return res
        .status(404)
        .render("error", { message: "Detalles no encontrados" });
    }

    res.render("live/detalles", { detalles, auctionId });
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    res
      .status(500)
      .render("error", { message: "Error al cargar los detalles" });
  }
};

// controlador de inmuebles 
exports.getInmuebles = async (req, res) => {
  try {
    const inmuebles = await Live.getInmuebles();
    res.render("live/inmuebles", { inmuebles });
    } catch (error) {
      console.error("Error al obtener inmuebles:", error);
      res
      .status(500)
      .render("error", { message: "Error al cargar los inmuebles" });
      }
      };
  

// controlador de cronograma 
exports.getCronograma = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const cronograma = await Live.getCronograma(auctionId);
    res.render("live/cronograma", { cronograma, auctionId });
    } catch (error) {
      console.error("Error al obtener cronograma:", error);
      res
      .status(500)
      .render("error", { message: "Error al cargar el cronograma" });
      }
  }


// controlador de pdf
exports.getPdf = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const aviso = await Live.getPdf(auctionId);
    if (!aviso) {
      return res
        .status(404)
        .render("error", { message: "Aviso no encontrado" });
    }
    res.render("live/aviso", { aviso, auctionId });
  } catch (error) {
    console.error("Error al obtener aviso:", error);
    res.status(500).render("error", { message: "Error al cargar el aviso" });
  }
};


