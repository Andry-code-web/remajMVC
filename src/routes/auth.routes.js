const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.get('/register', authController.register_vista);
router.post('/register', authController.register);
router.get('/login', authController.login_vista);
router.post('/login', authController.login);
router.get('/logout', isAuthenticated, authController.logout);


router.get('/forgot-password', authController.forgotPassword_vista);
router.post('/forgot-password', authController.forgotPassword);
router.get('/edit-profile', isAuthenticated, authController.editUser_vista);
router.post('/update-profile', isAuthenticated, authController.updateUser);

module.exports = router;