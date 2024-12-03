const Home = require('../models/home.model');

exports.getAllRemates = async (req, res) => {
    try {
        const remates = await Home.getAll();
        res.render('layouts/main', {
            content: 'home/index',
            remates
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};