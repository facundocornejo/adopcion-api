const prisma = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Middleware para verificar si es super admin
 */
const verificarSuperAdmin = async (req, res, next) => {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { id: req.admin.id },
      select: { es_super_admin: true }
    });

    if (!admin || !admin.es_super_admin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tenés permisos de super administrador'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando super admin:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al verificar permisos'
      }
    });
  }
};

/**
 * Listar todas las organizaciones
 * GET /api/super-admin/organizations
 */
const getOrganizations = async (req, res) => {
  try {
    const organizaciones = await prisma.organizacion.findMany({
      include: {
        _count: {
          select: {
            animales: true,
            administradores: true
          }
        },
        administradores: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    res.json({
      success: true,
      data: { organizaciones }
    });

  } catch (error) {
    console.error('Error en getOrganizations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener organizaciones'
      }
    });
  }
};

/**
 * Crear nueva organización con admin
 * POST /api/super-admin/organizations
 */
const createOrganization = async (req, res) => {
  try {
    const {
      nombre,
      email,
      telefono,
      direccion,
      descripcion,
      admin_username,
      admin_email,
      admin_password
    } = req.body;

    // Validaciones básicas
    if (!nombre || !admin_username || !admin_email || !admin_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nombre, username, email y contraseña del admin son obligatorios'
        }
      });
    }

    // Generar slug único
    let slug = nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 45);

    // Verificar si el slug ya existe
    const existingSlug = await prisma.organizacion.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Verificar si el username o email ya existen
    const existingAdmin = await prisma.administrador.findFirst({
      where: {
        OR: [
          { username: admin_username },
          { email: admin_email }
        ]
      }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'El username o email ya está en uso'
        }
      });
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(admin_password, 10);

    // Crear organización y admin en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const organizacion = await tx.organizacion.create({
        data: {
          nombre,
          slug,
          email: email || null,
          telefono: telefono || null,
          direccion: direccion || null,
          descripcion: descripcion || null
        }
      });

      const administrador = await tx.administrador.create({
        data: {
          organizacion_id: organizacion.id,
          username: admin_username,
          email: admin_email,
          password_hash
        }
      });

      return { organizacion, administrador };
    });

    res.status(201).json({
      success: true,
      data: {
        organizacion: result.organizacion,
        administrador: {
          id: result.administrador.id,
          username: result.administrador.username,
          email: result.administrador.email
        },
        credenciales: {
          username: admin_username,
          password: admin_password // Devolvemos la contraseña para que se la envíen al rescatista
        },
        message: 'Organización y administrador creados correctamente'
      }
    });

  } catch (error) {
    console.error('Error en createOrganization:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al crear la organización'
      }
    });
  }
};

/**
 * Activar/Desactivar organización
 * PUT /api/super-admin/organizations/:id/toggle
 */
const toggleOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organizacion = await prisma.organizacion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!organizacion) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organización no encontrada'
        }
      });
    }

    const updated = await prisma.organizacion.update({
      where: { id: parseInt(id) },
      data: { activa: !organizacion.activa }
    });

    res.json({
      success: true,
      data: {
        organizacion: updated,
        message: updated.activa ? 'Organización activada' : 'Organización desactivada'
      }
    });

  } catch (error) {
    console.error('Error en toggleOrganization:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al actualizar la organización'
      }
    });
  }
};

/**
 * Listar solicitudes de contacto de rescatistas
 * GET /api/super-admin/contact-requests
 */
const getContactRequests = async (req, res) => {
  try {
    const { estado } = req.query;

    const where = estado ? { estado } : {};

    const solicitudes = await prisma.solicitudContacto.findMany({
      where,
      orderBy: { fecha_solicitud: 'desc' }
    });

    res.json({
      success: true,
      data: { solicitudes }
    });

  } catch (error) {
    console.error('Error en getContactRequests:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener solicitudes'
      }
    });
  }
};

/**
 * Actualizar estado de solicitud de contacto
 * PUT /api/super-admin/contact-requests/:id
 */
const updateContactRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas_admin } = req.body;

    const solicitud = await prisma.solicitudContacto.update({
      where: { id: parseInt(id) },
      data: {
        estado: estado || undefined,
        notas_admin: notas_admin || undefined,
        fecha_respuesta: estado ? new Date() : undefined
      }
    });

    res.json({
      success: true,
      data: {
        solicitud,
        message: 'Solicitud actualizada'
      }
    });

  } catch (error) {
    console.error('Error en updateContactRequest:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al actualizar la solicitud'
      }
    });
  }
};

/**
 * Crear solicitud de contacto (PÚBLICO)
 * POST /api/contact-requests
 */
const createContactRequest = async (req, res) => {
  try {
    const {
      nombre_refugio,
      nombre_contacto,
      email,
      telefono,
      ciudad,
      descripcion,
      instagram,
      facebook,
      cantidad_animales
    } = req.body;

    // Validaciones básicas
    if (!nombre_refugio || !nombre_contacto || !email || !telefono || !ciudad || !descripcion) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Todos los campos obligatorios deben completarse'
        }
      });
    }

    const solicitud = await prisma.solicitudContacto.create({
      data: {
        nombre_refugio,
        nombre_contacto,
        email,
        telefono,
        ciudad,
        descripcion,
        instagram: instagram || null,
        facebook: facebook || null,
        cantidad_animales: cantidad_animales || null
      }
    });

    res.status(201).json({
      success: true,
      data: {
        solicitud,
        message: 'Tu solicitud fue enviada correctamente. Te contactaremos pronto.'
      }
    });

  } catch (error) {
    console.error('Error en createContactRequest:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al enviar la solicitud'
      }
    });
  }
};

module.exports = {
  verificarSuperAdmin,
  getOrganizations,
  createOrganization,
  toggleOrganization,
  getContactRequests,
  updateContactRequest,
  createContactRequest
};
