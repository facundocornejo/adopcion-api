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
 *         description: Datos de la organización del admin autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     whatsapp:
 *                       type: string
 *                     direccion:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     instagram:
 *                       type: string
 *                     facebook:
 *                       type: string
 *                     donacion_alias:
 *                       type: string
 *                     donacion_cbu:
 *                       type: string
 *                     donacion_info:
 *                       type: string
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *                 example: "Refugio Patitas Felices"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contacto@patitas.org"
 *               telefono:
 *                 type: string
 *                 example: "+54 343 555-1234"
 *               whatsapp:
 *                 type: string
 *                 example: "+54 9 343 555-1234"
 *               direccion:
 *                 type: string
 *                 example: "Av. Almafuerte 123, Paraná"
 *               descripcion:
 *                 type: string
 *                 example: "Refugio dedicado al rescate de animales..."
 *               instagram:
 *                 type: string
 *                 example: "@patitas_felices"
 *               facebook:
 *                 type: string
 *                 example: "patitasfelices"
 *               donacion_alias:
 *                 type: string
 *                 example: "PATITAS.FELICES"
 *               donacion_cbu:
 *                 type: string
 *                 example: "0000003100000000000001"
 *               donacion_info:
 *                 type: string
 *                 example: "Banco Nación - Cuenta Corriente"
 *     responses:
 *       200:
 *         description: Organización actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Slug único de la organización
 *         example: "patitas-felices"
 *     responses:
 *       200:
 *         description: Datos públicos de la organización
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     whatsapp:
 *                       type: string
 *                     instagram:
 *                       type: string
 *                     facebook:
 *                       type: string
 *       404:
 *         description: Organización no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', getOrganizationBySlug);

module.exports = router;
