const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/upload.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Constantes de configuración (Airbnb: UPPER_SNAKE_CASE)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Configurar multer para almacenar en memoria (buffer)
const storage = multer.memoryStorage();

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido. Solo JPG, JPEG, PNG y WEBP'), false);
  }
};

// Configurar multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'El archivo excede el tamaño máximo de 5MB'
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE',
        message: err.message
      }
    });
  }

  next();
};

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Subir imagen a Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida
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
 *                     url:
 *                       type: string
 *                     public_id:
 *                       type: string
 */
router.post('/', verificarToken, upload.single('file'), handleMulterError, uploadImage);

/**
 * @swagger
 * /api/upload/{publicId}:
 *   delete:
 *     summary: Eliminar imagen de Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagen eliminada
 */
router.delete('/:publicId', verificarToken, deleteImage);

module.exports = router;
