const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Rutas públicas (no requieren autenticación)
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.post('/logout', verificarToken, logout);
router.get('/me', verificarToken, me);

module.exports = router;
