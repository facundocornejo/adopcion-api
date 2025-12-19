const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que vengan los campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email y contraseña son requeridos'
        }
      });
    }

    // Buscar el admin por email
    const admin = await prisma.administrador.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email o contraseña incorrectos'
        }
      });
    }

    // Comparar la contraseña
    const passwordValido = await bcrypt.compare(password, admin.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email o contraseña incorrectos'
        }
      });
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        username: admin.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Actualizar último acceso
    await prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimo_acceso: new Date() }
    });

    // Responder con el token y datos del admin
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // En JWT stateless, el logout se maneja en el frontend
  // eliminando el token del storage. Este endpoint es simbólico
  // pero útil para logging o invalidar tokens en el futuro.

  res.json({
    success: true,
    data: {
      message: 'Sesión cerrada correctamente'
    }
  });
};

// GET /api/auth/me - Obtener datos del admin autenticado
const me = async (req, res) => {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        username: true,
        email: true,
        fecha_creacion: true,
        ultimo_acceso: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Administrador no encontrado'
        }
      });
    }

    res.json({
      success: true,
      data: { admin }
    });

  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

module.exports = { login, logout, me };
