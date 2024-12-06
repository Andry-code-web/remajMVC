const express = require('express');
const router = express.Router();
const {geterror404, geterrorSSL, geterrorCORS, geterror503, geterror502, geterror504, geterror304, geterror204, geterror500, geterror403, geterror401, geterror400}= require('../controllers/errores.controller');

// Ruta para error 400
router.get('/error400', geterror400);

// Ruta para error 401
router.get('/error401', geterror401);

// Ruta para error 403
router.get('/error403', geterror403);

// Ruta para error 404
router.get('/error404', geterror404);

// Ruta para error 500
router.get('/error500', geterror500);

// Ruta para error 502
router.get('/error502', geterror502);

// Ruta para error 503
router.get('/error503', geterror503);

// Ruta para error 504
router.get('/error504', geterror504);

// Ruta para error 304
router.get('/error304', geterror304);

// Ruta para error 204
router.get('/error204', geterror204);

// Ruta para error CORS
router.get('/errorCORS', geterrorCORS);

// Ruta para error SSL
router.get('/errorSSL', geterrorSSL);

module.exports = router;