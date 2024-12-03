const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para obtener todos los remates
router.get('/index', adminController.getAlladmin);

// Ruta para crear un nuevo remate
router.post('/admin/nuevo-remate', upload.single('photo'), adminController.createRemate);

// Ruta para actualizar un remate existente
router.put('/admin/actualizar-remate/:id', upload.none(), adminController.updateRemate);

// Ruta para eliminar un remate
router.delete('/admin/eliminar-remate', adminController.deleteRemate);

// Ruta para obtener un remate por ID para editar
router.get('/admin/editar-remate/:id', adminController.getRemateById);

// Ruta para la vista de subasta
router.get('/subasta', (req, res) => {
  res.render("subasta");
});

module.exports = router;
