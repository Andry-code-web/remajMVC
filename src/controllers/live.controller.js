const Live = require("../models/live.model");

exports.getAllLive = async (req, res) => {
  try {
    const liveData = await Live.getAll();
    const imgInmuebles = await Live.getImagenesInmuebles();
    console.log(liveData);
    
    // Construir los datos de las subastas con sus detalles asociados
    const liveDataConImagenes = await Promise.all(
      liveData.map(async (auction) => {
        if (!auction || !auction.id) {
          console.error(
            "Datos incompletos para la subasta:",
            auction ? auction.id : "Desconocido"
          );
          return null;
        }

        const inmuebles = await Live.getInmuebles(auction.id);
        const cronograma = await Live.getCronograma(auction.id);
        const detalles = await Live.getDetalles(auction.id); // Aquí obtienes los detalles
        console.log(detalles);
        
        return {
          ...auction,
          imagen:
            imgInmuebles.find((img) => img.remates_id === auction.id)
              ?.imagenes_inmueble || "/img/default.png",
          inmuebles,
          cronograma,
          detalles, // Asegúrate de pasar detalles
        };
      })
    );

    // Filtrar las subastas válidas
    const validLiveData = liveDataConImagenes.filter((data) => data !== null);

    // Enviar los datos a la vista
    res.render("live/live", { liveData: validLiveData });
  } catch (error) {
    console.error("Error al obtener los datos de las subastas:", error);
    res.status(500).render("error", { error: error.message });
  }
};
