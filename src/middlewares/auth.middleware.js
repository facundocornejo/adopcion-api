const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // Obtener el header de autorización
  const authHeader = req.headers['authorization'];

  // El formato es: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Token de autenticación no proporcionado'
      }
    });
  }

  try {
    // Verificar que el token sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar los datos del usuario al request para usarlos después
    req.admin = decoded;

    // Continuar al siguiente middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado'
      }
    });
  }
};

module.exports = { verificarToken };
