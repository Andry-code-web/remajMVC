const User = require('../models/user.model');

exports.getAllerrores = async (req, res) => {
    try {
        res.render('errores/error404');
    } catch (error) {
        res.status(500).render('error', {
            error: error.message
        });
    }
};