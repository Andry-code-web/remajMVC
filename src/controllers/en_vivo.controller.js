const EnVivo = require("../models/en_vivo.model");

exports.getEnVivo = async (req, res) => {
    try {
        // Obtener el ID del usuario que dio like
        const userId = req.session.user.id;
        console.log('id del usuario:', userId);
        
        // Obtener datos de remates con imágenes y anexos
        const enVivoData = await EnVivo.getAll(userId);

        // Renderizar la vista con los datos
        res.render("en_vivo/en_vivo", { 
            enVivoData: enVivoData,
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


















