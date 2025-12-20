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

/**
 * @swagger
 * /api/adoption-requests:
 *   post:
 *     summary: Crear solicitud de adopción
 *     tags: [Solicitudes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudInput'
 *     responses:
 *       201:
 *         description: Solicitud creada
 *       400:
 *         description: Error de validación
 */
router.post('/', adoptionRequestValidation, createAdoptionRequest);

/**
 * @swagger
 * /api/adoption-requests/stats:
 *   get:
 *     summary: Estadísticas de solicitudes
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 */
router.get('/stats', verificarToken, getAdoptionStats);

/**
 * @swagger
 * /api/adoption-requests:
 *   get:
 *     summary: Listar solicitudes
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado_solicitud
 *         schema:
 *           type: string
 *       - in: query
 *         name: animal_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get('/', verificarToken, getAdoptionRequests);

/**
 * @swagger
 * /api/adoption-requests/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de solicitud
 *       404:
 *         description: No encontrada
 */
router.get('/:id', verificarToken, idParamValidation, getAdoptionRequestById);

/**
 * @swagger
 * /api/adoption-requests/{id}:
 *   patch:
 *     summary: Actualizar estado de solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_solicitud:
 *                 type: string
 *                 enum: [Nueva, Revisada, En evaluación, Aprobada, Rechazada]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id', verificarToken, idParamValidation, adoptionStatusValidation, updateAdoptionRequestStatus);

/**
 * @swagger
 * /api/adoption-requests/{id}:
 *   delete:
 *     summary: Eliminar solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitud eliminada
 */
router.delete('/:id', verificarToken, idParamValidation, deleteAdoptionRequest);

module.exports = router;
