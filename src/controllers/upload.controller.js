const cloudinary = require('../config/cloudinary');

// Constantes de configuración (Airbnb: UPPER_SNAKE_CASE para constantes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_IMAGE_DIMENSION = 1200;
const CLOUDINARY_FOLDER = 'adopcion';

// POST /api/upload - Subir imagen a Cloudinary
const uploadImage = async (req, res) => {
  try {
    // Verificar que se envió un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No se envió ningún archivo'
        }
      });
    }

    // Subir a Cloudinary usando el buffer del archivo
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          resource_type: 'image',
          allowed_formats: ALLOWED_FORMATS,
          max_bytes: MAX_FILE_SIZE,
          transformation: [
            { width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });

  } catch (error) {
    console.error('Error en uploadImage:', error);

    // Error específico de Cloudinary
    if (error.message && error.message.includes('File size too large')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'El archivo excede el tamaño máximo de 5MB'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Error al subir la imagen'
      }
    });
  }
};

// DELETE /api/upload/:publicId - Eliminar imagen de Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    // El publicId viene como "adopcion/abc123", pero en la URL viene como "adopcion-abc123"
    // porque las barras no son válidas en URLs
    const fullPublicId = publicId.replace('-', '/');

    const result = await cloudinary.uploader.destroy(fullPublicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        data: {
          message: 'Imagen eliminada correctamente'
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Imagen no encontrada'
        }
      });
    }

  } catch (error) {
    console.error('Error en deleteImage:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Error al eliminar la imagen'
      }
    });
  }
};

module.exports = { uploadImage, deleteImage };
