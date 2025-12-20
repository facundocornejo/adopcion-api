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

    // Buscar el admin por email con su organización
    const admin = await prisma.administrador.findUnique({
      where: { email },
      include: { organizacion: true }
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

    // Verificar que la organización esté activa
    if (!admin.organizacion.activa) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ORGANIZATION_INACTIVE',
          message: 'La organización está desactivada'
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

    // Generar el token JWT con organizacion_id
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        organizacion_id: admin.organizacion_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Actualizar último acceso
    await prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimo_acceso: new Date() }
    });

    // Responder con el token y datos del admin + organización
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        },
        organizacion: {
          id: admin.organizacion.id,
          nombre: admin.organizacion.nombre,
          slug: admin.organizacion.slug
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
        ultimo_acceso: true,
        organizacion: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            email: true,
            telefono: true,
            direccion: true,
            logo_url: true
          }
        }
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
