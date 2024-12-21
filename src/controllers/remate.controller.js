const Property = require('../models/remate.model');

exports.getAllremates = async (req, res) => {
    try {
        const remates = await Property.fetchAll();
        res.render('layouts/remates', { remates: 'remates/index', rematesData: remates });
    } catch (error) {
        res.status(500).render('error', {
            error: error.message
        });
    }
};
