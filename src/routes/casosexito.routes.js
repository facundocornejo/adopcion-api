const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const {
  getCasosExito,
  getCasosExitoByOrg,
  createCasoExito,
  updateCasoExito,
  deleteCasoExito
} = require('../controllers/casosexito.controller');

/**
 * @swagger
 * tags:
 *   name: Casos de Éxito
 *   description: Historias de adopciones exitosas
 */

/**
 * @swagger
 * /api/casos-exito:
 *   get:
 *     summary: Obtener todos los casos de éxito agrupados por organización
 *     tags: [Casos de Éxito]
 *     responses:
 *       200:
 *         description: Lista de casos de éxito por organización
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       organizacion:
 *                         type: object
 *                       casos:
 *                         type: array
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getCasosExito);

/**
 * @swagger
 * /api/casos-exito/{orgSlug}:
 *   get:
 *     summary: Obtener casos de éxito de una organización específica
 *     tags: [Casos de Éxito]
 *     parameters:
 *       - in: path
 *         name: orgSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la organización
 *     responses:
 *       200:
 *         description: Casos de éxito de la organización
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
 *                     organizacion:
 *                       type: object
 *                     casos:
 *                       type: array
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
router.get('/:orgSlug', getCasosExitoByOrg);

/**
 * @swagger
 * /api/casos-exito:
 *   post:
 *     summary: Crear un nuevo caso de éxito
 *     tags: [Casos de Éxito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animal_id
 *               - titulo
 *               - historia
 *               - fecha_adopcion
 *             properties:
 *               animal_id:
 *                 type: integer
 *                 description: ID del animal adoptado
 *               titulo:
 *                 type: string
 *                 example: "Luna encontró su hogar"
 *               historia:
 *                 type: string
 *                 example: "Después de meses en el refugio, Luna fue adoptada por una familia..."
 *               foto_actual_1:
 *                 type: string
 *                 format: uri
 *               foto_actual_2:
 *                 type: string
 *                 format: uri
 *               foto_actual_3:
 *                 type: string
 *                 format: uri
 *               fecha_adopcion:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Caso de éxito creado exitosamente
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
router.post('/', verificarToken, createCasoExito);

/**
 * @swagger
 * /api/casos-exito/{id}:
 *   put:
 *     summary: Actualizar un caso de éxito existente
 *     tags: [Casos de Éxito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del caso de éxito
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               historia:
 *                 type: string
 *               foto_actual_1:
 *                 type: string
 *                 format: uri
 *               foto_actual_2:
 *                 type: string
 *                 format: uri
 *               foto_actual_3:
 *                 type: string
 *                 format: uri
 *               fecha_adopcion:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Caso de éxito actualizado exitosamente
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
 *       404:
 *         description: Caso no encontrado
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
router.put('/:id', verificarToken, updateCasoExito);

/**
 * @swagger
 * /api/casos-exito/{id}:
 *   delete:
 *     summary: Eliminar un caso de éxito
 *     tags: [Casos de Éxito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del caso de éxito
 *     responses:
 *       200:
 *         description: Caso de éxito eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Caso de éxito eliminado correctamente
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos para eliminar este caso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Caso no encontrado
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
router.delete('/:id', verificarToken, deleteCasoExito);

module.exports = router;
