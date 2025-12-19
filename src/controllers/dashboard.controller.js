const prisma = require('../config/database');

/**
 * Obtener estadísticas generales para el dashboard (PROTEGIDO - Admin)
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      totalAnimales,
      animalesPorEstado,
      totalSolicitudes,
      solicitudesPorEstado,
      solicitudesRecientes,
      animalesRecientes
    ] = await Promise.all([
      // Total de animales
      prisma.animal.count(),

      // Animales agrupados por estado
      prisma.animal.groupBy({
        by: ['estado'],
        _count: { id: true }
      }),

      // Total de solicitudes
      prisma.solicitudAdopcion.count(),

      // Solicitudes agrupadas por estado
      prisma.solicitudAdopcion.groupBy({
        by: ['estado_solicitud'],
        _count: { id: true }
      }),

      // Solicitudes de los últimos 7 días
      prisma.solicitudAdopcion.count({
        where: {
          fecha_solicitud: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Animales publicados en los últimos 30 días
      prisma.animal.count({
        where: {
          fecha_publicacion: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Formatear animales por estado
    const animalesEstado = {};
    animalesPorEstado.forEach(item => {
      animalesEstado[item.estado] = item._count.id;
    });

    // Formatear solicitudes por estado
    const solicitudesEstado = {};
    solicitudesPorEstado.forEach(item => {
      solicitudesEstado[item.estado_solicitud] = item._count.id;
    });

    // Calcular tasa de adopción (animales adoptados / total)
    const adoptados = animalesEstado['Adoptado'] || 0;
    const tasaAdopcion = totalAnimales > 0
      ? Math.round((adoptados / totalAnimales) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        resumen: {
          total_animales: totalAnimales,
          total_solicitudes: totalSolicitudes,
          solicitudes_ultimos_7_dias: solicitudesRecientes,
          animales_ultimos_30_dias: animalesRecientes,
          tasa_adopcion: `${tasaAdopcion}%`
        },
        animales_por_estado: {
          disponible: animalesEstado['Disponible'] || 0,
          en_proceso: animalesEstado['En proceso'] || 0,
          adoptado: animalesEstado['Adoptado'] || 0,
          en_transito: animalesEstado['En transito'] || 0
        },
        solicitudes_por_estado: {
          nueva: solicitudesEstado['Nueva'] || 0,
          en_revision: solicitudesEstado['En revisión'] || 0,
          aprobada: solicitudesEstado['Aprobada'] || 0,
          rechazada: solicitudesEstado['Rechazada'] || 0
        },
        fecha_consulta: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener estadísticas del dashboard'
      }
    });
  }
};

module.exports = {
  getDashboardStats
};
