const User = require('../models/user.model');


exports.getAlladmin = async (req, res) => {
    try {
        res.render('layouts/admin');
        admin = 'admin/index'
    } catch (error) {
        res.status(500).render('error', {
            error: error.message
        });
    }
};