const prisma = require('../config/database');

/**
 * Obtener datos de la organización del admin autenticado (PROTEGIDO)
 * GET /api/organization
 */
const getMyOrganization = async (req, res) => {
  try {
    const organizacion = await prisma.organizacion.findUnique({
      where: { id: req.admin.organizacion_id },
      select: {
        id: true,
        nombre: true,
        slug: true,
        email: true,
        telefono: true,
        whatsapp: true,
        direccion: true,
        logo_url: true,
        descripcion: true,
        instagram: true,
        facebook: true,
        donacion_alias: true,
        donacion_cbu: true,
        donacion_info: true,
        activa: true,
        fecha_creacion: true
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

    res.json({
      success: true,
      data: { organizacion }
    });

  } catch (error) {
    console.error('Error en getMyOrganization:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener la organización'
      }
    });
  }
};

/**
 * Actualizar datos de la organización del admin autenticado (PROTEGIDO)
 * PUT /api/organization
 */
const updateMyOrganization = async (req, res) => {
  try {
    const {
      nombre,
      email,
      telefono,
      whatsapp,
      direccion,
      logo_url,
      descripcion,
      instagram,
      facebook,
      donacion_alias,
      donacion_cbu,
      donacion_info
    } = req.body;

    const organizacion = await prisma.organizacion.update({
      where: { id: req.admin.organizacion_id },
      data: {
        nombre: nombre || undefined,
        email: email || null,
        telefono: telefono || null,
        whatsapp: whatsapp || null,
        direccion: direccion || null,
        logo_url: logo_url || null,
        descripcion: descripcion || null,
        instagram: instagram || null,
        facebook: facebook || null,
        donacion_alias: donacion_alias || null,
        donacion_cbu: donacion_cbu || null,
        donacion_info: donacion_info || null
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        email: true,
        telefono: true,
        whatsapp: true,
        direccion: true,
        logo_url: true,
        descripcion: true,
        instagram: true,
        facebook: true,
        donacion_alias: true,
        donacion_cbu: true,
        donacion_info: true
      }
    });

    res.json({
      success: true,
      data: {
        organizacion,
        message: 'Organización actualizada correctamente'
      }
    });

  } catch (error) {
    console.error('Error en updateMyOrganization:', error);
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
 * Obtener datos públicos de una organización por slug (PÚBLICO)
 * GET /api/organization/:slug
 */
const getOrganizationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const organizacion = await prisma.organizacion.findUnique({
      where: { slug },
      select: {
        id: true,
        nombre: true,
        slug: true,
        telefono: true,
        whatsapp: true,
        direccion: true,
        logo_url: true,
        descripcion: true,
        instagram: true,
        facebook: true,
        donacion_alias: true,
        donacion_info: true
        // No exponemos email ni CBU completo por seguridad
      }
    });

    if (!organizacion || !organizacion.activa) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organización no encontrada'
        }
      });
    }

    res.json({
      success: true,
      data: { organizacion }
    });

  } catch (error) {
    console.error('Error en getOrganizationBySlug:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener la organización'
      }
    });
  }
};

module.exports = {
  getMyOrganization,
  updateMyOrganization,
  getOrganizationBySlug
};
