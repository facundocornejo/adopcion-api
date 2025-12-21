const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const {
  getMyOrganization,
  updateMyOrganization,
  getOrganizationBySlug
} = require('../controllers/organization.controller');

/**
 * @swagger
 * /api/organization:
 *   get:
 *     summary: Obtener datos de mi organización
 *     tags: [Organización]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de la organización
 */
router.get('/', verificarToken, getMyOrganization);

/**
 * @swagger
 * /api/organization:
 *   put:
 *     summary: Actualizar datos de mi organización
 *     tags: [Organización]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               direccion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               donacion_alias:
 *                 type: string
 *               donacion_cbu:
 *                 type: string
 *               donacion_info:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organización actualizada
 */
router.put('/', verificarToken, updateMyOrganization);

/**
 * @swagger
 * /api/organization/{slug}:
 *   get:
 *     summary: Obtener datos públicos de una organización
 *     tags: [Organización]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos públicos de la organización
 */
router.get('/:slug', getOrganizationBySlug);

module.exports = router;
