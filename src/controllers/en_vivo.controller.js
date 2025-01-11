const EnVivo = require("../models/en_vivo.model");
const fs = require("fs").promises;
const path = require("path");

exports.getEnVivo = async (req, res) => {
    try {
        // Obtener datos de remates y anexos
        const enVivoData = await EnVivo.getAll();
        const imgInmuebles = await EnVivo.getImagenesInmuebles();
        const anexosData = await EnVivo.getAnexosAll(); // Traemos todos los anexos

        console.log("Datos de remates:", enVivoData);
        console.log("Imágenes de inmuebles:", imgInmuebles);
        console.log("Datos de anexos:", anexosData);

        // Combinar datos con imágenes y anexos
        const dataConImagenesYAnexos = enVivoData.map((auction) => {
            const imagenBase64 = imgInmuebles.find((img) => img.remates_id === auction.id)?.imagenes_inmueble || "";
            const anexo = anexosData.find((anexo) => anexo.remates_id === auction.id)?.papeles_inmuebles || ""; // Enlace al PDF o aviso

            return {
                ...auction,
                imagen: imagenBase64,
                anexo, // Incluimos el enlace del anexo
            };
        });

        res.render("en_vivo/en_vivo", { enVivoData: dataConImagenesYAnexos });
    } catch (error) {
        console.error("Error en getEnVivo:", error);
        res.render("error", { message: "Error al obtener datos de subastas en vivo" });
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
        const inmueblesConImagenes = await Promise.all(
            inmuebles.map(async (inmueble) => {
                if (inmueble.img_inmuebles_id) {
                    const imagen = await EnVivo.getImagenInmuebleById(inmueble.img_inmuebles_id);
                    return {
                        ...inmueble,
                        imagen_base64: imagen ? imagen.imagenes_inmueble : null,
                    };
                }
                return { ...inmueble, imagen_base64: null };
            })
        );

        res.render("en_vivo/inmuebles", {
            inmuebles: inmueblesConImagenes || [],
            auctionId,
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
        console.log('datos cronograma: ', cronograma);
        

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


