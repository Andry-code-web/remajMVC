const User = require('../models/user.model');


exports.getAllremates = async (req, res) => {
    try {
        res.render('remates/index');
    } catch (error) {
        res.status(500).render('error', {
            error: error.message
        });
    }
};