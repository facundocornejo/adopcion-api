const express = require('express');
const router = express.Router();

// Importar controller
const {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  updateAdoptionRequestStatus,
  deleteAdoptionRequest,
  getAdoptionStats
} = require('../controllers/adoption.controller');

// Importar middleware de autenticación
const { verificarToken } = require('../middlewares/auth.middleware');

// Importar validaciones
const {
  adoptionRequestValidation,
  adoptionStatusValidation,
  idParamValidation
} = require('../middlewares/validators');

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * POST /api/adoption-requests
 * Crear nueva solicitud de adopción
 * Cualquier persona puede enviar una solicitud
 */
router.post('/', adoptionRequestValidation, createAdoptionRequest);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * GET /api/adoption-requests/stats
 * Obtener estadísticas de solicitudes
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id para que no la confunda con un ID
 */
router.get('/stats', verificarToken, getAdoptionStats);

/**
 * GET /api/adoption-requests
 * Listar todas las solicitudes
 * Query params: ?estado_solicitud=Nueva&animal_id=1
 */
router.get('/', verificarToken, getAdoptionRequests);

/**
 * GET /api/adoption-requests/:id
 * Obtener detalle de una solicitud
 */
router.get('/:id', verificarToken, idParamValidation, getAdoptionRequestById);

/**
 * PATCH /api/adoption-requests/:id
 * Actualizar estado de una solicitud
 * Body: { estado_solicitud: "Aprobada" }
 */
router.patch('/:id', verificarToken, idParamValidation, adoptionStatusValidation, updateAdoptionRequestStatus);

/**
 * DELETE /api/adoption-requests/:id
 * Eliminar una solicitud
 */
router.delete('/:id', verificarToken, idParamValidation, deleteAdoptionRequest);

module.exports = router;
