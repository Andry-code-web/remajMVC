const User = require('../models/user.model');

// Controlador para error 400
const geterror400 = async (req, res) => {
    try {
        res.render('errores/error400');
    } catch (error) {
        res.status(500).render('errores/error400', {
            error: error.message
        });
    }
};

// Controlador para error 401
const geterror401 = async (req, res) => {
    try {
        res.render('errores/error401');
    } catch (error) {
        res.status(500).render('errores/error401', {
            error: error.message
        });
    }
};

// Controlador para error 403
const geterror403 = async (req, res) => {
    try {
        res.render('errores/error403');
    } catch (error) {
        res.status(500).render('errores/error403', {
            error: error.message
        });
    }
};

// Controlador para error 404
const geterror404 = async (req, res) => {
    try {
        res.render('errores/error404');
    } catch (error) {
        res.status(500).render('errores/error404', {
            error: error.message
        });
    }
};

// Controlador para error 500
const geterror500 = async (req, res) => {
    try {
        res.render('errores/error500');
    } catch (error) {
        res.status(500).render('errores/error500', {
            error: error.message
        });
    }
};

// Controlador para error 502
const geterror502 = async (req, res) => {
    try {
        res.render('errores/error502');
    } catch (error) {
        res.status(500).render('errores/error502', {
            error: error.message
        });
    }
};
// Controlador para error 503
const geterror503 = async (req, res) => {
    try {
        res.render('errores/error503');
    } catch (error) {
        res.status(500).render('errores/error503', {
            error: error.message
        });
    }
};
// Controlador para error 504
const geterror504 = async (req, res) => {
    try {
        res.render('errores/error504');
    } catch (error) {
        res.status(500).render('errores/error504', {
            error: error.message
        });
    }
};

// Controlador para error 304
const geterror304 = async (req, res) => {
    try {
        res.render('errores/error304');
    } catch (error) {
        res.status(500).render('errores/error304', {
            error: error.message
        });
    }
};

// Controlador para error 204
const geterror204 = async (req, res) => {
    try {
        res.render('errores/error204');
    } catch (error) {
        res.status(500).render('errores/error204', {
            error: error.message
        });
    }
};

// Controlador para error CORS
const geterrorCORS = async (req, res) => {
    try {
        res.render('errores/errorCORS');
    } catch (error) {
        res.status(500).render('errores/errorCORS', {
            error: error.message
        });
    }
};

//Controlador para error SSL
const geterrorSSL = async (req, res) => {
    try {
        res.render('errores/errorSSL');
    } catch (error) {
        res.status(500).render('errores/errorSSL', {
            error: error.message
        });
    }
};

module.exports = {
    geterror400,
    geterror401,
    geterror403,
    geterror404,
    geterror500,
    geterror502,
    geterror503,
    geterror504,
    geterror304,
    geterror204,
    geterrorCORS,
    geterrorSSL
};