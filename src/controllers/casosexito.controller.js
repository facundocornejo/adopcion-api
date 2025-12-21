const prisma = require('../config/database');

/**
 * GET /api/casos-exito
 * Listar todos los casos de éxito agrupados por organización
 */
const getCasosExito = async (req, res) => {
  try {
    // Obtener organizaciones con sus casos de éxito
    const organizaciones = await prisma.organizacion.findMany({
      where: {
        activa: true,
        casosExito: {
          some: {} // Solo orgs que tienen al menos un caso
        }
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        casosExito: {
          select: {
            id: true,
            titulo: true,
            historia: true,
            foto_actual_1: true,
            foto_actual_2: true,
            foto_actual_3: true,
            fecha_adopcion: true,
            fecha_publicacion: true,
            animal: {
              select: {
                id: true,
                nombre: true,
                especie: true,
                foto_principal: true
              }
            }
          },
          orderBy: { fecha_publicacion: 'desc' }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json({
      success: true,
      data: { organizaciones }
    });

  } catch (error) {
    console.error('Error en getCasosExito:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener casos de éxito'
      }
    });
  }
};

/**
 * GET /api/casos-exito/:orgSlug
 * Listar casos de éxito de una organización específica
 */
const getCasosExitoByOrg = async (req, res) => {
  try {
    const { orgSlug } = req.params;

    const organizacion = await prisma.organizacion.findUnique({
      where: { slug: orgSlug },
      select: {
        id: true,
        nombre: true,
        slug: true,
        casosExito: {
          select: {
            id: true,
            titulo: true,
            historia: true,
            foto_actual_1: true,
            foto_actual_2: true,
            foto_actual_3: true,
            fecha_adopcion: true,
            fecha_publicacion: true,
            animal: {
              select: {
                id: true,
                nombre: true,
                especie: true,
                foto_principal: true,
                foto_2: true,
                foto_3: true
              }
            }
          },
          orderBy: { fecha_publicacion: 'desc' }
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

    res.json({
      success: true,
      data: { organizacion }
    });

  } catch (error) {
    console.error('Error en getCasosExitoByOrg:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener casos de éxito'
      }
    });
  }
};

/**
 * POST /api/casos-exito
 * Crear un nuevo caso de éxito (requiere auth)
 */
const createCasoExito = async (req, res) => {
  try {
    const {
      animal_id,
      titulo,
      historia,
      foto_actual_1,
      foto_actual_2,
      foto_actual_3,
      fecha_adopcion
    } = req.body;

    // Validaciones básicas
    if (!animal_id || !titulo || !historia || !fecha_adopcion) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Animal, título, historia y fecha de adopción son obligatorios'
        }
      });
    }

    // Verificar que el animal existe y pertenece a la organización del admin
    const animal = await prisma.animal.findUnique({
      where: { id: parseInt(animal_id) }
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Animal no encontrado'
        }
      });
    }

    if (animal.organizacion_id !== req.admin.organizacion_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tenés permiso para crear un caso de éxito de este animal'
        }
      });
    }

    // Verificar que no exista ya un caso de éxito para este animal
    const existingCaso = await prisma.casoExito.findUnique({
      where: { animal_id: parseInt(animal_id) }
    });

    if (existingCaso) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Ya existe un caso de éxito para este animal'
        }
      });
    }

    // Crear el caso de éxito
    const casoExito = await prisma.casoExito.create({
      data: {
        animal_id: parseInt(animal_id),
        organizacion_id: req.admin.organizacion_id,
        titulo,
        historia,
        foto_actual_1: foto_actual_1 || null,
        foto_actual_2: foto_actual_2 || null,
        foto_actual_3: foto_actual_3 || null,
        fecha_adopcion: new Date(fecha_adopcion)
      },
      include: {
        animal: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        casoExito,
        message: 'Caso de éxito creado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en createCasoExito:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al crear el caso de éxito'
      }
    });
  }
};

/**
 * PUT /api/casos-exito/:id
 * Actualizar un caso de éxito existente (requiere auth)
 */
const updateCasoExito = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      historia,
      foto_actual_1,
      foto_actual_2,
      foto_actual_3,
      fecha_adopcion
    } = req.body;

    // Verificar que el caso existe y pertenece a la organización
    const existingCaso = await prisma.casoExito.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCaso) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Caso de éxito no encontrado'
        }
      });
    }

    if (existingCaso.organizacion_id !== req.admin.organizacion_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tenés permiso para modificar este caso de éxito'
        }
      });
    }

    // Actualizar
    const casoExito = await prisma.casoExito.update({
      where: { id: parseInt(id) },
      data: {
        titulo: titulo || existingCaso.titulo,
        historia: historia || existingCaso.historia,
        foto_actual_1: foto_actual_1 !== undefined ? foto_actual_1 : existingCaso.foto_actual_1,
        foto_actual_2: foto_actual_2 !== undefined ? foto_actual_2 : existingCaso.foto_actual_2,
        foto_actual_3: foto_actual_3 !== undefined ? foto_actual_3 : existingCaso.foto_actual_3,
        fecha_adopcion: fecha_adopcion ? new Date(fecha_adopcion) : existingCaso.fecha_adopcion
      }
    });

    res.json({
      success: true,
      data: {
        casoExito,
        message: 'Caso de éxito actualizado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en updateCasoExito:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al actualizar el caso de éxito'
      }
    });
  }
};

module.exports = {
  getCasosExito,
  getCasosExitoByOrg,
  createCasoExito,
  updateCasoExito
};
