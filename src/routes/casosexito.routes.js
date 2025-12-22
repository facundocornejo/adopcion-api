const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const {
  getCasosExito,
  getCasosExitoByOrg,
  createCasoExito,
  updateCasoExito
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
 *       404:
 *         description: Organización no encontrada
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
 *               titulo:
 *                 type: string
 *               historia:
 *                 type: string
 *               foto_actual_1:
 *                 type: string
 *               foto_actual_2:
 *                 type: string
 *               foto_actual_3:
 *                 type: string
 *               fecha_adopcion:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Caso de éxito creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
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
 *               foto_actual_2:
 *                 type: string
 *               foto_actual_3:
 *                 type: string
 *               fecha_adopcion:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Caso de éxito actualizado
 *       404:
 *         description: Caso no encontrado
 */
router.put('/:id', verificarToken, updateCasoExito);

module.exports = router;
