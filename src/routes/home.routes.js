const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', homeController.getAllRemates);
router.get('/remate/:id', homeController.getRemateDetails);
router.get('/anexos/:id', homeController.getAnexos);
router.post('/filtrar', homeController.getFiltrarRemate);
router.get('/filtrarG', homeController.getFiltrarRemateG);
router.post('/check-opportunities', authMiddleware.isAuthenticated, homeController.checkOpportunities);
router.post('/toggle-like', authMiddleware.isAuthenticated, homeController.toggleLike); // Nueva ruta
router.get('/check-like', authMiddleware.isAuthenticated, homeController.checkLike);

module.exports = router;
