const prisma = require('../config/database');

// GET /api/animals - Listar animales
const getAnimals = async (req, res) => {
  try {
    const { estado, especie, tamanio, busqueda, page, limit } = req.query;

    // Paginación con valores por defecto
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {};

    // Si está autenticado, filtrar por su organización
    if (req.admin) {
      where.organizacion_id = req.admin.organizacion_id;
    } else {
      // Si NO está autenticado (público), solo mostrar ciertos estados
      where.estado = { in: ['Disponible', 'En proceso', 'En transito'] };
    }

    // Filtros opcionales con validación
    const ESTADOS_VALIDOS = ['Disponible', 'En proceso', 'Adoptado', 'En transito'];
    if (estado) {
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(', ')}`
          }
        });
      }
      where.estado = estado;
    }
    if (especie) {
      where.especie = especie;
    }
    if (tamanio) {
      where.tamanio = tamanio;
    }
    if (busqueda) {
      where.nombre = { contains: busqueda, mode: 'insensitive' };
    }

    // Ejecutar consulta y conteo en paralelo
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          especie: true,
          sexo: true,
          edad_aproximada: true,
          tamanio: true,
          estado: true,
          foto_principal: true,
          fecha_publicacion: true,
          organizacion: { select: { id: true, nombre: true, slug: true } }
        },
        orderBy: { fecha_publicacion: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.animal.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        animals,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error en getAnimals:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener los animales'
      }
    });
  }
};

// GET /api/animals/:id - Obtener detalle de un animal
const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizacion: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            whatsapp: true,
            instagram: true,
            facebook: true,
            donacion_alias: true,
            donacion_info: true
          }
        }
      }
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

    // Si es público y el animal está adoptado, no mostrarlo
    if (!req.admin && animal.estado === 'Adoptado') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Animal no encontrado'
        }
      });
    }

    res.json({
      success: true,
      data: { animal }
    });

  } catch (error) {
    console.error('Error en getAnimalById:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al obtener el animal'
      }
    });
  }
};

// POST /api/animals - Crear animal (protegido)
const createAnimal = async (req, res) => {
  try {
    const {
      nombre,
      especie,
      sexo,
      edad_aproximada,
      tamanio,
      raza_mezcla,
      descripcion_historia,
      estado_castracion,
      estado_vacunacion,
      estado_desparasitacion,
      socializa_perros,
      socializa_gatos,
      socializa_ninos,
      necesidades_especiales,
      tipo_hogar_ideal,
      publicado_por,
      contacto_rescatista,
      foto_principal,
      foto_2,
      foto_3,
      foto_4,
      foto_5
    } = req.body;

    const animal = await prisma.animal.create({
      data: {
        organizacion_id: req.admin.organizacion_id,
        administrador_id: req.admin.id,
        nombre,
        especie,
        sexo,
        edad_aproximada,
        tamanio,
        raza_mezcla: raza_mezcla || null,
        descripcion_historia,
        estado_castracion: estado_castracion || false,
        estado_vacunacion: estado_vacunacion || null,
        estado_desparasitacion: estado_desparasitacion || false,
        socializa_perros: socializa_perros || false,
        socializa_gatos: socializa_gatos || false,
        socializa_ninos: socializa_ninos || false,
        necesidades_especiales: necesidades_especiales || null,
        tipo_hogar_ideal: tipo_hogar_ideal || null,
        estado: 'Disponible',
        publicado_por,
        contacto_rescatista,
        foto_principal,
        foto_2: foto_2 || null,
        foto_3: foto_3 || null,
        foto_4: foto_4 || null,
        foto_5: foto_5 || null
      }
    });

    res.status(201).json({
      success: true,
      data: {
        animal: {
          id: animal.id,
          nombre: animal.nombre,
          estado: animal.estado,
          fecha_publicacion: animal.fecha_publicacion
        },
        message: 'Animal creado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en createAnimal:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al crear el animal'
      }
    });
  }
};

// PUT /api/animals/:id - Actualizar animal (protegido)
const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const animalId = parseInt(id, 10);

    if (!Number.isInteger(animalId) || animalId < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El ID debe ser un número entero positivo'
        }
      });
    }

    const {
      nombre,
      especie,
      sexo,
      edad_aproximada,
      tamanio,
      raza_mezcla,
      descripcion_historia,
      estado,
      estado_castracion,
      estado_vacunacion,
      estado_desparasitacion,
      socializa_perros,
      socializa_gatos,
      socializa_ninos,
      necesidades_especiales,
      tipo_hogar_ideal,
      publicado_por,
      contacto_rescatista,
      foto_principal,
      foto_2,
      foto_3,
      foto_4,
      foto_5
    } = req.body;

    // Usar transacción para evitar race conditions
    const animal = await prisma.$transaction(async (tx) => {
      const existingAnimal = await tx.animal.findUnique({
        where: { id: animalId }
      });

      if (!existingAnimal) {
        const error = new Error('Animal no encontrado');
        error.code = 'NOT_FOUND';
        throw error;
      }

      if (existingAnimal.organizacion_id !== req.admin.organizacion_id) {
        const error = new Error('No tienes permiso para modificar este animal');
        error.code = 'FORBIDDEN';
        throw error;
      }

      return tx.animal.update({
        where: { id: animalId },
        data: {
          nombre,
          especie,
          sexo,
          edad_aproximada,
          tamanio,
          raza_mezcla: raza_mezcla !== undefined ? raza_mezcla : existingAnimal.raza_mezcla,
          descripcion_historia,
          estado: estado !== undefined ? estado : existingAnimal.estado,
          estado_castracion: estado_castracion !== undefined ? estado_castracion : existingAnimal.estado_castracion,
          estado_vacunacion: estado_vacunacion !== undefined ? estado_vacunacion : existingAnimal.estado_vacunacion,
          estado_desparasitacion: estado_desparasitacion !== undefined ? estado_desparasitacion : existingAnimal.estado_desparasitacion,
          socializa_perros: socializa_perros !== undefined ? socializa_perros : existingAnimal.socializa_perros,
          socializa_gatos: socializa_gatos !== undefined ? socializa_gatos : existingAnimal.socializa_gatos,
          socializa_ninos: socializa_ninos !== undefined ? socializa_ninos : existingAnimal.socializa_ninos,
          necesidades_especiales: necesidades_especiales !== undefined ? necesidades_especiales : existingAnimal.necesidades_especiales,
          tipo_hogar_ideal: tipo_hogar_ideal !== undefined ? tipo_hogar_ideal : existingAnimal.tipo_hogar_ideal,
          publicado_por,
          contacto_rescatista,
          foto_principal,
          foto_2: foto_2 !== undefined ? foto_2 : existingAnimal.foto_2,
          foto_3: foto_3 !== undefined ? foto_3 : existingAnimal.foto_3,
          foto_4: foto_4 !== undefined ? foto_4 : existingAnimal.foto_4,
          foto_5: foto_5 !== undefined ? foto_5 : existingAnimal.foto_5
        }
      });
    });

    res.json({
      success: true,
      data: {
        animal,
        message: 'Animal actualizado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en updateAnimal:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al actualizar el animal'
      }
    });
  }
};

// PATCH /api/animals/:id/status - Cambiar estado (protegido)
const updateAnimalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Verificar que el animal existe
    const existingAnimal = await prisma.animal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnimal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Animal no encontrado'
        }
      });
    }

    if (existingAnimal.organizacion_id !== req.admin.organizacion_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para modificar este animal'
        }
      });
    }

    const animal = await prisma.animal.update({
      where: { id: parseInt(id) },
      data: { estado },
      select: {
        id: true,
        nombre: true,
        estado: true
      }
    });

    res.json({
      success: true,
      data: {
        animal,
        message: 'Estado actualizado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en updateAnimalStatus:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al actualizar el estado'
      }
    });
  }
};

// DELETE /api/animals/:id - Eliminar animal (protegido)
const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const animalId = parseInt(id, 10);

    if (!Number.isInteger(animalId) || animalId < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El ID debe ser un número entero positivo'
        }
      });
    }

    // Usar transacción para evitar race conditions
    await prisma.$transaction(async (tx) => {
      const existingAnimal = await tx.animal.findUnique({
        where: { id: animalId }
      });

      if (!existingAnimal) {
        const error = new Error('Animal no encontrado');
        error.code = 'NOT_FOUND';
        throw error;
      }

      if (existingAnimal.organizacion_id !== req.admin.organizacion_id) {
        const error = new Error('No tienes permiso para eliminar este animal');
        error.code = 'FORBIDDEN';
        throw error;
      }

      await tx.animal.delete({
        where: { id: animalId }
      });
    });

    res.json({
      success: true,
      data: {
        message: 'Animal eliminado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en deleteAnimal:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: error.message
        }
      });
    }

    // Error de foreign key (tiene solicitudes asociadas)
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HAS_DEPENDENCIES',
          message: 'No se puede eliminar el animal porque tiene solicitudes de adopción asociadas'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error al eliminar el animal'
      }
    });
  }
};

module.exports = {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  updateAnimalStatus,
  deleteAnimal
};
