const express = require('express');
const router = express.Router();
const {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  updateAnimalStatus,
  deleteAnimal
} = require('../controllers/animals.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const {
  animalValidation,
  statusValidation,
  idParamValidation
} = require('../middlewares/validators');

// Middleware opcional para detectar si está autenticado (sin bloquear)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = decoded;
    } catch (error) {
      // Token inválido, pero no bloqueamos - es opcional
    }
  }

  next();
};

/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Listar animales
 *     description: |
 *       Lista animales con filtros opcionales y paginación.
 *       - **Público**: Solo muestra animales Disponible, En proceso, En transito
 *       - **Admin autenticado**: Muestra todos los animales de su organización
 *       - **Super Admin**: Muestra todos los animales de todas las organizaciones (o filtrar con organizacion_id)
 *     tags: [Animales]
 *     parameters:
 *       - in: query
 *         name: organizacion_id
 *         schema:
 *           type: integer
 *         description: (Solo Super Admin) Filtrar por organización específica
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Disponible, En proceso, Adoptado, En transito]
 *         description: Filtrar por estado
 *       - in: query
 *         name: especie
 *         schema:
 *           type: string
 *           enum: [Perro, Gato]
 *         description: Filtrar por especie
 *       - in: query
 *         name: tamanio
 *         schema:
 *           type: string
 *           enum: [Pequeño, Mediano, Grande]
 *         description: Filtrar por tamaño
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Buscar por nombre del animal
 *         example: Luna
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de animales con paginación
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
 *                     animals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           especie:
 *                             type: string
 *                           sexo:
 *                             type: string
 *                           edad_aproximada:
 *                             type: string
 *                           tamanio:
 *                             type: string
 *                           estado:
 *                             type: string
 *                           foto_principal:
 *                             type: string
 *                           fecha_publicacion:
 *                             type: string
 *                             format: date-time
 *                           organizacion:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               nombre:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                     total:
 *                       type: integer
 *                       description: Total de animales que coinciden con los filtros
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       description: Página actual
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Resultados por página
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       description: Total de páginas
 *                       example: 3
 *       400:
 *         description: Estado inválido
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
router.get('/', optionalAuth, getAnimals);

/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Obtener un animal por ID
 *     tags: [Animales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del animal
 *     responses:
 *       200:
 *         description: Detalle del animal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Animal'
 *       404:
 *         description: Animal no encontrado
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
router.get('/:id', idParamValidation, optionalAuth, getAnimalById);

/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Crear un nuevo animal
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnimalInput'
 *     responses:
 *       201:
 *         description: Animal creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Animal'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
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
router.post('/', verificarToken, animalValidation, createAnimal);

/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     summary: Actualizar un animal
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnimalInput'
 *     responses:
 *       200:
 *         description: Animal actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Animal'
 *       400:
 *         description: Error de validación
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
 *         description: Animal no encontrado
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
router.put('/:id', verificarToken, idParamValidation, animalValidation, updateAnimal);

/**
 * @swagger
 * /api/animals/{id}/status:
 *   patch:
 *     summary: Cambiar estado de un animal
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Disponible, En proceso, Adoptado, En transito]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Animal'
 *       400:
 *         description: Estado inválido
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
 *         description: Animal no encontrado
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
router.patch('/:id/status', verificarToken, idParamValidation, statusValidation, updateAnimalStatus);

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Eliminar un animal (soft delete)
 *     tags: [Animales]
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
 *         description: Animal eliminado exitosamente
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
 *                   example: Animal eliminado correctamente
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Animal no encontrado
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
router.delete('/:id', verificarToken, idParamValidation, deleteAnimal);

module.exports = router;
