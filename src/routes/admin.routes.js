const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const upload = require('../middleware/upload.middleware');
const { isAuthenticated } = require('../middleware/LoginAdministrador.middleware');

// Ruta para vista de login
router.get('/login', adminController.getloginadmin);

// Ruta para procesar el login
router.post('/login', adminController.loginAdmin);

// Ruta para procesar el logout
router.get('/logout', adminController.logoutAdmin);

// Ruta para obtener todos los remates (protegida)
router.get('/index', isAuthenticated, adminController.getAlladmin);

// Ruta para crear un nuevo remate (protegida)
router.post("/nuevo-remate", isAuthenticated, upload.fields([{ name: "photo" }, { name: "anexos" }]), adminController.crearRemate);

// Ruta para eliminar un remate (protegida)
router.delete('/eliminar-remate', isAuthenticated, adminController.deleteRemate);

// Ruta para obtener los datos de un remate para editar (protegida)
router.get('/editar-remate/:id', isAuthenticated, adminController.getRemateForEdit);

// Ruta para guardar los cambios de un remate (protegida)
router.post('/editar-remate/:id', isAuthenticated, upload.fields([{ name: "photo" }, { name: "anexos" }]), adminController.updateRemate);

// Ruta para la vista de subasta (protegida)
router.get('/subasta', isAuthenticated, (req, res) => {
  res.render("subasta");
});

module.exports = router;
