const comprarModel = require('../models/comprar.model');

exports.getAllcomprar = async (req, res) => {
    try {
        res.render('layouts/compra_venta',{
            content:'comprar/index'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.getAllvender = async (req, res) => {
    try {
        res.render('layouts/compra_venta',{
            content:'vender/index'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.postComprar = async (req, res) => {
    try {
        const data = {
            tipo_cliente: req.body.tipo_cliente,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            telefono: req.body.telefono,
            correo_electronico: req.body.correo_electronico,
            departamento: req.body.departamento,
            ciudad: req.body.ciudad,
            productos_interes: req.body.productos_interes
        };

        await comprarModel.quierocomprar(data);
        res.redirect('/comprar?success=true');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};