const Live = require('../models/live.model');

exports.getAllLive = async (req, res) => {
    try {
        const liveData = await Live.getAll(); 
        res.render('live/live', {
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};