const EnVivo = require("../models/en_vivo.model");
const fs = require("fs").promises;
const path = require("path");

exports.getEnVivo = async (req, res) => {
    try {
        const enVivoData = await EnVivo.getAll();
        const imgInmuebles = await EnVivo.getImagenesInmuebles();

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

        res.render("en_vivo/en_vivo", { enVivoData: dataConImagenes });
    } catch (error) {
        console.error('Error en getEnVivo:', error);
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

exports.getPdf = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const aviso = await EnVivo.getPdf(auctionId);

        if (!aviso || !aviso.aviso_pdf) {
            return res.render("error", { message: "PDF no encontrado" });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=aviso-${auctionId}.pdf`);
        res.send(aviso.aviso_pdf);
    } catch (error) {
        console.error('Error en getPdf:', error);
        res.render("error", { message: "Error al descargar el PDF" });
    }
};