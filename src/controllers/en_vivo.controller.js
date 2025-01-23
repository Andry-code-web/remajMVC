const EnVivo = require("../models/en_vivo.model");

exports.getEnVivo = async (req, res) => {
    try {
        // Obtener el ID del usuario si está logueado
        const userId = req.session.user ? req.session.user.id : null;
        
        // Obtener datos de remates y anexos
        const enVivoData = await EnVivo.getAll(userId);
        const imgInmuebles = await EnVivo.getImagenesInmuebles();
        const anexosData = await EnVivo.getAnexosAll();

        // Combinar datos con imágenes y anexos
        const dataConImagenesYAnexos = enVivoData.map((remate) => {
            // Buscar la imagen correspondiente
            const imagenData = imgInmuebles.find(img => img.remates_id === remate.id);
            // Buscar el anexo correspondiente
            const anexoData = anexosData.find(anexo => anexo.remates_id === remate.id);

            return {
                ...remate,
                imagen: imagenData ? imagenData.imagenes_inmueble : null,
                anexo: anexoData ? anexoData.papeles_inmuebles : null
            };
        });

        // Renderizar la vista con los datos
        res.render("en_vivo/en_vivo", { 
            enVivoData: dataConImagenesYAnexos,
            user: req.session.user || null
        });

    } catch (error) {
        console.error("Error en getEnVivo:", error);
        res.status(500).render("error", { 
            message: "Error al obtener datos de subastas en vivo",
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Los demás controladores se mantienen igual...
exports.getSeguimiento = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const seguimientos = await EnVivo.getSeguimiento(auctionId);

        res.render("en_vivo/seguimiento", {
            seguimientos: seguimientos || [],
            auctionId
        });
    } catch (error) {
        console.error('Error en getSeguimiento:', error);
        res.render("error", {
            message: "Error al cargar el seguimiento",
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

exports.getDetalles = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const detalles = await EnVivo.getDetalles(auctionId);

        res.render("en_vivo/detalles", {
            detalles: detalles || [],
            auctionId
        });
    } catch (error) {
        console.error('Error en getDetalles:', error);
        res.render("error", {
            message: "Error al cargar los detalles",
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

exports.getInmuebles = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const inmuebles = await EnVivo.getInmuebles(auctionId);

        res.render("en_vivo/inmuebles", {
            inmuebles: inmuebles || [],
            auctionId
        });
    } catch (error) {
        console.error('Error en getInmuebles:', error);
        res.render("error", {
            message: "Error al cargar los inmuebles"
        });
    }
};

exports.getCronograma = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const cronograma = await EnVivo.getCronograma(auctionId);

        res.render("en_vivo/cronograma", {
            cronograma: cronograma || [],
            auctionId
        });
    } catch (error) {
        console.error('Error en getCronograma:', error);
        res.render("error", {
            message: "Error al cargar el cronograma"
        });
    }
};

exports.getAviso = async (req, res) => {
    const { id } = req.params;

    try {
        const [anexo] = await EnVivo.getAnexos(id);

        if (anexo && anexo.papeles_inmuebles) {
            return res.redirect(anexo.papeles_inmuebles);
        } else {
            return res.status(404).send('No se encontró el enlace del aviso para este remate.');
        }
    } catch (error) {
        console.error('Error al obtener el aviso:', error);
        res.status(500).send('Hubo un error al obtener el enlace del aviso.');
    }
};