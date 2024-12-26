const EnVivo = require("../models/en_vivo.model");
const fs = require("fs").promises;
const path = require("path");

// Obtener todas las subastas en vivo
exports.getEnVivo = async (req, res) => {
    try {
        console.log('Iniciando getEnVivo');
        const enVivoData = await EnVivo.getAll();
        console.log('Datos obtenidos de subastas:', enVivoData);
        
        const imgInmuebles = await EnVivo.getImagenesInmuebles();
        console.log('Imágenes de inmuebles obtenidas:', imgInmuebles);

        const dataConImagenes = await Promise.all(enVivoData.map(async (auction) => {
            const imagePath = imgInmuebles.find((img) => img.remates_id === auction.id)?.imagenes_inmueble || "/img/default.png";
            let base64Image;

            try {
                const imageBuffer = await fs.readFile(path.join(__dirname, '..', 'public', imagePath));
                base64Image = `data:image/${path.extname(imagePath).slice(1)};base64,${imageBuffer.toString('base64')}`;
            } catch (error) {
                console.error('Error al cargar imagen:', error);
                base64Image = "/img/default.png";
            }

            return { ...auction, imagen: base64Image };
        }));

        console.log('Renderizando vista con datos:', { enVivoData: dataConImagenes });
        res.render("en_vivo/en_vivo", {
            enVivoData: dataConImagenes, 
            detalles: [],
            inmuebles: [],
            cronogramas: []
        });
    } catch (error) {
        console.error('Error en getEnVivo:', error);
        res.status(500).render("error", { message: "Error al obtener datos de subastas en vivo" });
    }
};
// Controlador de seguimiento
exports.getSeguimiento = async (req, res) => {
    try {
        const auctionId = req.params.id;
        console.log('Obteniendo seguimiento para subasta:', auctionId);
        
        const seguimiento = await EnVivo.getSeguimiento(auctionId);
        console.log('Datos de seguimiento:', seguimiento);

        if (!seguimiento || seguimiento.length === 0) {
            console.log('No se encontró seguimiento para la subasta:', auctionId);
            return res.status(404).render("error", { message: "Seguimiento no encontrado" });
        }

        res.render("en_vivo/en_vivo", { seguimiento, auctionId });
    } catch (error) {
        console.error("Error en getSeguimiento:", error);
        res.status(500).render("error", { message: "Error al cargar el seguimiento" });
    }
};

// Controlador de detalles
exports.getDetalles = async (req, res) => {
    try {
        const auctionId = req.params.id;
        console.log('Obteniendo detalles para subasta:', auctionId);
        
        const detalles = await EnVivo.getDetalles(auctionId);
        console.log('Datos de detalles:', detalles);

        if (!detalles) {
            console.log('No se encontraron detalles para la subasta:', auctionId);
            return res.status(404).render("error", { message: "Detalles no encontrados" });
        }

        res.render("en_vivo/en_vivo", { detalles, auctionId });
    } catch (error) {
        console.error("Error en getDetalles:", error);
        res.status(500).render("error", { message: "Error al cargar los detalles" });
    }
};

// Controlador de inmuebles
exports.getInmuebles = async (req, res) => {
    try {
        const auctionId = req.params.id;
        console.log('Obteniendo inmuebles para subasta:', auctionId);
        
        const inmuebles = await EnVivo.getInmuebles(auctionId);
        console.log('Datos de inmuebles:', inmuebles);

        res.render("en_vivo/en_vivo", { inmuebles, auctionId });
    } catch (error) {
        console.error("Error en getInmuebles:", error);
        res.status(500).render("error", { message: "Error al cargar los inmuebles" });
    }
};

// Controlador de cronograma
exports.getCronograma = async (req, res) => {
    try {
        const auctionId = req.params.id;
        console.log('Obteniendo cronograma para subasta:', auctionId);
        
        const cronograma = await EnVivo.getCronograma(auctionId);
        console.log('Datos de cronograma:', cronograma);

        res.render("en_vivo/en_vivo", { cronograma, auctionId });
    } catch (error) {
        console.error("Error en getCronograma:", error);
        res.status(500).render("error", { message: "Error al cargar el cronograma" });
    }
};

// Controlador de PDF
exports.getPdf = async (req, res) => {
    try {
        const auctionId = req.params.id;
        console.log('Obteniendo PDF para subasta:', auctionId);
        
        const aviso = await EnVivo.getPdf(auctionId);
        console.log('Datos de aviso:', aviso);

        if (!aviso) {
            console.log('No se encontró aviso para la subasta:', auctionId);
            return res.status(404).render("error", { message: "Aviso no encontrado" });
        }
        
        res.render("en_vivo/en_vivo", { aviso, auctionId });
    } catch (error) {
        console.error("Error en getPdf:", error);
        res.status(500).render("error", { message: "Error al cargar el aviso" });
    }
};