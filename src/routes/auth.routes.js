const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/register', authController.register_vista);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;