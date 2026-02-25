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

    // Validar política de contraseñas: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_\-#]{8,}$/;
    if (!passwordRegex.test(admin_password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número'
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
        message: 'Organización y administrador creados correctamente. Envíe las credenciales al rescatista de forma segura.'
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
 * Actualizar organización
 * PUT /api/super-admin/organizations/:id
 */
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      email,
      telefono,
      whatsapp,
      direccion,
      descripcion,
      instagram,
      facebook,
      donacion_alias,
      donacion_cbu,
      donacion_info,
      admin_username,
      admin_email,
      admin_password
    } = req.body;

    const orgId = parseInt(id);

    // Verificar que la organización existe
    const organizacion = await prisma.organizacion.findUnique({
      where: { id: orgId },
      include: {
        administradores: {
          select: { id: true, username: true, email: true }
        }
      }
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

    // Si se cambia nombre, actualizar slug
    let newSlug = organizacion.slug;
    if (nombre && nombre !== organizacion.nombre) {
      newSlug = nombre
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 45);

      // Verificar si el nuevo slug ya existe (excluyendo la org actual)
      const existingSlug = await prisma.organizacion.findFirst({
        where: {
          slug: newSlug,
          id: { not: orgId }
        }
      });
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Actualizar organización y admin en transacción
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrg = await tx.organizacion.update({
        where: { id: orgId },
        data: {
          nombre: nombre || undefined,
          slug: nombre ? newSlug : undefined,
          email: email !== undefined ? (email || null) : undefined,
          telefono: telefono !== undefined ? (telefono || null) : undefined,
          whatsapp: whatsapp !== undefined ? (whatsapp || null) : undefined,
          direccion: direccion !== undefined ? (direccion || null) : undefined,
          descripcion: descripcion !== undefined ? (descripcion || null) : undefined,
          instagram: instagram !== undefined ? (instagram || null) : undefined,
          facebook: facebook !== undefined ? (facebook || null) : undefined,
          donacion_alias: donacion_alias !== undefined ? (donacion_alias || null) : undefined,
          donacion_cbu: donacion_cbu !== undefined ? (donacion_cbu || null) : undefined,
          donacion_info: donacion_info !== undefined ? (donacion_info || null) : undefined
        },
        include: {
          administradores: {
            select: { id: true, username: true, email: true }
          }
        }
      });

      // Actualizar admin principal si se envían datos
      if ((admin_username || admin_email || admin_password) && organizacion.administradores.length > 0) {
        const adminId = organizacion.administradores[0].id;

        // Verificar duplicados si se cambia username o email
        if (admin_username || admin_email) {
          const existingAdmin = await tx.administrador.findFirst({
            where: {
              OR: [
                admin_username ? { username: admin_username } : {},
                admin_email ? { email: admin_email } : {}
              ].filter(obj => Object.keys(obj).length > 0),
              id: { not: adminId }
            }
          });

          if (existingAdmin) {
            throw new Error('DUPLICATE_ADMIN');
          }
        }

        // Preparar datos de actualización del admin
        const adminUpdateData = {
          username: admin_username || undefined,
          email: admin_email || undefined
        };

        // Si se envía contraseña, validar y hashear
        if (admin_password) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_\-#]{8,}$/;
          if (!passwordRegex.test(admin_password)) {
            throw new Error('WEAK_PASSWORD');
          }
          adminUpdateData.password_hash = await bcrypt.hash(admin_password, 10);
        }

        await tx.administrador.update({
          where: { id: adminId },
          data: adminUpdateData
        });
      }

      return updatedOrg;
    });

    res.json({
      success: true,
      data: {
        organizacion: result,
        message: 'Organización actualizada correctamente'
      }
    });

  } catch (error) {
    console.error('Error en updateOrganization:', error);

    if (error.message === 'DUPLICATE_ADMIN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'El username o email del admin ya está en uso'
        }
      });
    }

    if (error.message === 'WEAK_PASSWORD') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número'
        }
      });
    }

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
 * Eliminar organización completamente (hard delete)
 * DELETE /api/super-admin/organizations/:id
 */
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = parseInt(id);

    // Verificar que existe
    const organizacion = await prisma.organizacion.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            animales: true,
            administradores: true
          }
        }
      }
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

    // Eliminar en cascada usando transacción
    await prisma.$transaction(async (tx) => {
      // 1. Obtener IDs de animales de esta organización
      const animales = await tx.animal.findMany({
        where: { organizacion_id: orgId },
        select: { id: true }
      });
      const animalIds = animales.map(a => a.id);

      // 2. Eliminar solicitudes de adopción de esos animales
      if (animalIds.length > 0) {
        await tx.solicitudAdopcion.deleteMany({
          where: { animal_id: { in: animalIds } }
        });
      }

      // 3. Eliminar animales
      await tx.animal.deleteMany({
        where: { organizacion_id: orgId }
      });

      // 4. Eliminar administradores
      await tx.administrador.deleteMany({
        where: { organizacion_id: orgId }
      });

      // 5. Eliminar organización
      await tx.organizacion.delete({
        where: { id: orgId }
      });
    });

    res.json({
      success: true,
      data: {
        message: `Organización "${organizacion.nombre}" eliminada correctamente junto con ${organizacion._count.animales} animal(es) y ${organizacion._count.administradores} admin(s)`
      }
    });

  } catch (error) {
    console.error('Error en deleteOrganization:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al eliminar la organización'
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

/**
 * Resetear contraseña de un administrador
 * PUT /api/super-admin/admins/:id/reset-password
 */
const resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'La nueva contraseña es requerida'
        }
      });
    }

    // Validar política de contraseñas
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_\-#]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número'
        }
      });
    }

    // Verificar que el admin existe
    const admin = await prisma.administrador.findUnique({
      where: { id: parseInt(id) },
      include: { organizacion: true }
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

    // Hash de la nueva contraseña
    const password_hash = await bcrypt.hash(new_password, 10);

    // Actualizar contraseña
    await prisma.administrador.update({
      where: { id: parseInt(id) },
      data: { password_hash }
    });

    res.json({
      success: true,
      data: {
        message: `Contraseña reseteada correctamente para ${admin.username}`,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          organizacion: admin.organizacion.nombre
        }
      }
    });

  } catch (error) {
    console.error('Error en resetAdminPassword:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al resetear la contraseña'
      }
    });
  }
};

/**
 * Listar todos los administradores
 * GET /api/super-admin/admins
 */
const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.administrador.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        es_super_admin: true,
        fecha_creacion: true,
        ultimo_acceso: true,
        organizacion: {
          select: {
            id: true,
            nombre: true,
            slug: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    res.json({
      success: true,
      data: { admins }
    });

  } catch (error) {
    console.error('Error en getAdmins:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener administradores'
      }
    });
  }
};

module.exports = {
  verificarSuperAdmin,
  getOrganizations,
  createOrganization,
  updateOrganization,
  toggleOrganization,
  deleteOrganization,
  getContactRequests,
  updateContactRequest,
  createContactRequest,
  resetAdminPassword,
  getAdmins
};
