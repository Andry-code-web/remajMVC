const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.get('/register', authController.register_vista);
router.post('/register', authController.register);
router.get('/login', authController.login_vista);
router.post('/loginP', authController.login);
router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;