const prisma = require('../config/database');
const { notificarNuevaSolicitud } = require('../services/email.service');

/**
 * Crear nueva solicitud de adopción (PÚBLICO)
 * POST /api/adoption-requests
 */
const createAdoptionRequest = async (req, res) => {
  try {
    const {
      animal_id,
      nombre_completo,
      edad,
      email,
      telefono_whatsapp,
      instagram,
      ciudad_zona,
      tipo_vivienda,
      vive_solo_acompanado,
      todos_de_acuerdo,
      tiene_otros_animales,
      otros_animales_castrados,
      experiencia_previa,
      puede_cubrir_gastos,
      veterinaria_que_usa,
      motivacion,
      compromiso_castracion,
      acepta_contacto
    } = req.body;

    // Verificar que el animal existe y está disponible
    const animal = await prisma.animal.findUnique({
      where: { id: parseInt(animal_id) },
      select: {
        id: true,
        nombre: true,
        estado: true,
        especie: true,
        organizacion: {
          select: { id: true, nombre: true, email: true }
        }
      }
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'El animal no existe'
        }
      });
    }

    // Solo permitir solicitudes para animales disponibles o en proceso
    if (!['Disponible', 'En proceso', 'En transito'].includes(animal.estado)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_AVAILABLE',
          message: 'Este animal ya no está disponible para adopción'
        }
      });
    }

    // Crear la solicitud
    const solicitud = await prisma.solicitudAdopcion.create({
      data: {
        animal_id: parseInt(animal_id),
        nombre_completo,
        edad: parseInt(edad),
        email,
        telefono_whatsapp,
        instagram: instagram || null,
        ciudad_zona,
        tipo_vivienda,
        vive_solo_acompanado,
        todos_de_acuerdo: Boolean(todos_de_acuerdo),
        tiene_otros_animales: Boolean(tiene_otros_animales),
        otros_animales_castrados: otros_animales_castrados || null,
        experiencia_previa,
        puede_cubrir_gastos: Boolean(puede_cubrir_gastos),
        veterinaria_que_usa: veterinaria_que_usa || null,
        motivacion,
        compromiso_castracion: Boolean(compromiso_castracion),
        acepta_contacto: acepta_contacto !== false
      },
      include: {
        animal: {
          select: { id: true, nombre: true, especie: true }
        }
      }
    });

    // Enviar email de notificación a la organización (async, no bloquea la respuesta)
    notificarNuevaSolicitud(solicitud, solicitud.animal, animal.organizacion)
      .then(result => {
        if (!result.success) {
          console.warn('No se pudo enviar email de notificación:', result.reason || result.error);
        }
      })
      .catch(err => console.error('Error enviando notificación:', err));

    res.status(201).json({
      success: true,
      data: {
        solicitud: {
          id: solicitud.id,
          animal: solicitud.animal,
          nombre_completo: solicitud.nombre_completo,
          email: solicitud.email,
          fecha_solicitud: solicitud.fecha_solicitud,
          estado_solicitud: solicitud.estado_solicitud
        },
        message: 'Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.'
      }
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al procesar la solicitud'
      }
    });
  }
};

/**
 * Obtener todas las solicitudes (PROTEGIDO - Admin)
 * GET /api/adoption-requests
 * Query params: ?estado=Nueva&animal_id=1
 * - Superadmin: ve todas las solicitudes
 * - Admin regular: solo ve solicitudes de animales de su organización
 */
const getAdoptionRequests = async (req, res) => {
  try {
    const { estado_solicitud, animal_id } = req.query;
    const { es_super_admin, organizacion_id } = req.admin;

    // Construir filtros
    const where = {};

    if (estado_solicitud) {
      where.estado_solicitud = estado_solicitud;
    }

    if (animal_id) {
      where.animal_id = parseInt(animal_id);
    }

    // Si NO es superadmin, filtrar solo solicitudes de animales de su organización
    if (!es_super_admin) {
      where.animal = {
        organizacion_id: organizacion_id
      };
    }

    const solicitudes = await prisma.solicitudAdopcion.findMany({
      where,
      include: {
        animal: {
          select: {
            id: true,
            nombre: true,
            especie: true,
            foto_principal: true,
            estado: true,
            organizacion_id: true
          }
        }
      },
      orderBy: { fecha_solicitud: 'desc' }
    });

    res.json({
      success: true,
      data: {
        solicitudes,
        total: solicitudes.length
      }
    });

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener las solicitudes'
      }
    });
  }
};

/**
 * Obtener una solicitud por ID (PROTEGIDO - Admin)
 * GET /api/adoption-requests/:id
 * - Superadmin: puede ver cualquier solicitud
 * - Admin regular: solo puede ver solicitudes de animales de su organización
 */
const getAdoptionRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { es_super_admin, organizacion_id } = req.admin;

    const solicitud = await prisma.solicitudAdopcion.findUnique({
      where: { id: parseInt(id) },
      include: {
        animal: {
          select: {
            id: true,
            nombre: true,
            especie: true,
            sexo: true,
            edad_aproximada: true,
            foto_principal: true,
            estado: true,
            contacto_rescatista: true,
            organizacion_id: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Solicitud no encontrada'
        }
      });
    }

    // Verificar que el admin tenga acceso a esta solicitud
    if (!es_super_admin && solicitud.animal.organizacion_id !== organizacion_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tenés permiso para ver esta solicitud'
        }
      });
    }

    res.json({
      success: true,
      data: { solicitud }
    });

  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener la solicitud'
      }
    });
  }
};

/**
 * Actualizar estado de solicitud (PROTEGIDO - Admin)
 * PATCH /api/adoption-requests/:id
 * - Superadmin: puede actualizar cualquier solicitud
 * - Admin regular: solo puede actualizar solicitudes de animales de su organización
 */
const updateAdoptionRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_solicitud } = req.body;
    const { es_super_admin, organizacion_id } = req.admin;

    // Verificar que existe
    const existingSolicitud = await prisma.solicitudAdopcion.findUnique({
      where: { id: parseInt(id) },
      include: {
        animal: { select: { id: true, nombre: true, organizacion_id: true } }
      }
    });

    if (!existingSolicitud) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Solicitud no encontrada'
        }
      });
    }

    // Verificar permisos
    if (!es_super_admin && existingSolicitud.animal.organizacion_id !== organizacion_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tenés permiso para modificar esta solicitud'
        }
      });
    }

    // Actualizar estado
    const solicitud = await prisma.solicitudAdopcion.update({
      where: { id: parseInt(id) },
      data: { estado_solicitud },
      select: {
        id: true,
        nombre_completo: true,
        email: true,
        estado_solicitud: true,
        animal: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Si la solicitud fue aprobada, opcionalmente cambiar estado del animal
    // Esto se puede hacer manualmente o agregar lógica aquí

    res.json({
      success: true,
      data: {
        solicitud,
        message: `Estado actualizado a "${estado_solicitud}"`
      }
    });

  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
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
 * Eliminar solicitud (PROTEGIDO - Admin)
 * DELETE /api/adoption-requests/:id
 * - Superadmin: puede eliminar cualquier solicitud
 * - Admin regular: solo puede eliminar solicitudes de animales de su organización
 */
const deleteAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { es_super_admin, organizacion_id } = req.admin;

    // Verificar que existe
    const existingSolicitud = await prisma.solicitudAdopcion.findUnique({
      where: { id: parseInt(id) },
      include: {
        animal: { select: { organizacion_id: true } }
      }
    });

    if (!existingSolicitud) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Solicitud no encontrada'
        }
      });
    }

    // Verificar permisos
    if (!es_super_admin && existingSolicitud.animal.organizacion_id !== organizacion_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tenés permiso para eliminar esta solicitud'
        }
      });
    }

    await prisma.solicitudAdopcion.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      data: {
        message: 'Solicitud eliminada correctamente'
      }
    });

  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al eliminar la solicitud'
      }
    });
  }
};

/**
 * Obtener estadísticas de solicitudes (PROTEGIDO - Admin)
 * GET /api/adoption-requests/stats
 * - Superadmin: ve estadísticas de todas las solicitudes
 * - Admin regular: solo ve estadísticas de solicitudes de animales de su organización
 */
const getAdoptionStats = async (req, res) => {
  try {
    const { es_super_admin, organizacion_id } = req.admin;

    // Filtro base para admins regulares
    const baseWhere = !es_super_admin ? {
      animal: { organizacion_id: organizacion_id }
    } : {};

    // Contar por estado
    const solicitudes = await prisma.solicitudAdopcion.findMany({
      where: baseWhere,
      select: {
        estado_solicitud: true,
        fecha_solicitud: true
      }
    });

    // Calcular estadísticas manualmente (groupBy no soporta filtros relacionales)
    const porEstado = {};
    solicitudes.forEach(s => {
      porEstado[s.estado_solicitud] = (porEstado[s.estado_solicitud] || 0) + 1;
    });

    // Total de solicitudes
    const total = solicitudes.length;

    // Solicitudes de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = solicitudes.filter(s =>
      new Date(s.fecha_solicitud) >= sevenDaysAgo
    ).length;

    res.json({
      success: true,
      data: {
        total,
        ultimos_7_dias: recentCount,
        por_estado: porEstado
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener estadísticas'
      }
    });
  }
};

module.exports = {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  updateAdoptionRequestStatus,
  deleteAdoptionRequest,
  getAdoptionStats
};
