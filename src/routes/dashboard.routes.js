const express = require('express');
const router = express.Router();

// Importar controller
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Importar middleware de autenticación
const { verificarToken } = require('../middlewares/auth.middleware');

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * GET /api/dashboard/stats
 * Obtener estadísticas generales para el dashboard
 * Solo accesible por administradores autenticados
 */
router.get('/stats', verificarToken, getDashboardStats);

module.exports = router;
