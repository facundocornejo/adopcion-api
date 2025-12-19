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

// Rutas públicas (con auth opcional para mostrar más datos si está logueado)
router.get('/', optionalAuth, getAnimals);
router.get('/:id', idParamValidation, optionalAuth, getAnimalById);

// Rutas protegidas
router.post('/', verificarToken, animalValidation, createAnimal);
router.put('/:id', verificarToken, idParamValidation, animalValidation, updateAnimal);
router.patch('/:id/status', verificarToken, idParamValidation, statusValidation, updateAnimalStatus);
router.delete('/:id', verificarToken, idParamValidation, deleteAnimal);

module.exports = router;
