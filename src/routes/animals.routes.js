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
 *     tags: [Animales]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Lista de animales
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
 *       404:
 *         description: Animal no encontrado
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
 *         description: Animal creado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
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
 *         description: Animal actualizado
 *       404:
 *         description: Animal no encontrado
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
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Disponible, En proceso, Adoptado, En transito]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/status', verificarToken, idParamValidation, statusValidation, updateAnimalStatus);

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Eliminar un animal
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
 *         description: Animal eliminado
 *       404:
 *         description: Animal no encontrado
 */
router.delete('/:id', verificarToken, idParamValidation, deleteAnimal);

module.exports = router;
