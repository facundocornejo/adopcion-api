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
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Estadísticas del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumen:
 *                       type: object
 *                     animales_por_estado:
 *                       type: object
 *                     solicitudes_por_estado:
 *                       type: object
 */
router.get('/stats', verificarToken, getDashboardStats);

module.exports = router;
