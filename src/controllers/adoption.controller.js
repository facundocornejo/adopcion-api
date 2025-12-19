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
      select: { id: true, nombre: true, estado: true }
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

    // Enviar email de notificación al admin (async, no bloquea la respuesta)
    notificarNuevaSolicitud(solicitud, solicitud.animal)
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
 */
const getAdoptionRequests = async (req, res) => {
  try {
    const { estado_solicitud, animal_id } = req.query;

    // Construir filtros
    const where = {};

    if (estado_solicitud) {
      where.estado_solicitud = estado_solicitud;
    }

    if (animal_id) {
      where.animal_id = parseInt(animal_id);
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
            estado: true
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
 */
const getAdoptionRequestById = async (req, res) => {
  try {
    const { id } = req.params;

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
            contacto_rescatista: true
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
 */
const updateAdoptionRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_solicitud } = req.body;

    // Verificar que existe
    const existingSolicitud = await prisma.solicitudAdopcion.findUnique({
      where: { id: parseInt(id) },
      include: {
        animal: { select: { id: true, nombre: true } }
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
 */
const deleteAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const existingSolicitud = await prisma.solicitudAdopcion.findUnique({
      where: { id: parseInt(id) }
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
 */
const getAdoptionStats = async (req, res) => {
  try {
    // Contar por estado
    const stats = await prisma.solicitudAdopcion.groupBy({
      by: ['estado_solicitud'],
      _count: { id: true }
    });

    // Total de solicitudes
    const total = await prisma.solicitudAdopcion.count();

    // Solicitudes de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await prisma.solicitudAdopcion.count({
      where: {
        fecha_solicitud: { gte: sevenDaysAgo }
      }
    });

    // Formatear estadísticas por estado
    const porEstado = {};
    stats.forEach(s => {
      porEstado[s.estado_solicitud] = s._count.id;
    });

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
