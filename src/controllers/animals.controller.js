const prisma = require('../config/database');

// GET /api/animals - Listar animales
const getAnimals = async (req, res) => {
  try {
    const { estado, especie, tamanio, busqueda } = req.query;

    // Construir filtros
    const where = {};

    // Si está autenticado, filtrar por su organización
    if (req.admin) {
      where.organizacion_id = req.admin.organizacion_id;
    } else {
      // Si NO está autenticado (público), solo mostrar ciertos estados
      where.estado = { in: ['Disponible', 'En proceso', 'En transito'] };
    }

    // Filtros opcionales
    if (estado) {
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

    const animals = await prisma.animal.findMany({
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
      orderBy: { fecha_publicacion: 'desc' }
    });

    res.json({
      success: true,
      data: {
        animals,
        total: animals.length
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
      where: { id: parseInt(id) }
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

    // Verificar que el animal existe y pertenece a la organización
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

    const animal = await prisma.animal.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        especie,
        sexo,
        edad_aproximada,
        tamanio,
        raza_mezcla: raza_mezcla || null,
        descripcion_historia,
        estado: estado || existingAnimal.estado,
        estado_castracion: estado_castracion ?? existingAnimal.estado_castracion,
        estado_vacunacion: estado_vacunacion || null,
        estado_desparasitacion: estado_desparasitacion ?? existingAnimal.estado_desparasitacion,
        socializa_perros: socializa_perros ?? existingAnimal.socializa_perros,
        socializa_gatos: socializa_gatos ?? existingAnimal.socializa_gatos,
        socializa_ninos: socializa_ninos ?? existingAnimal.socializa_ninos,
        necesidades_especiales: necesidades_especiales || null,
        tipo_hogar_ideal: tipo_hogar_ideal || null,
        publicado_por,
        contacto_rescatista,
        foto_principal,
        foto_2: foto_2 || null,
        foto_3: foto_3 || null,
        foto_4: foto_4 || null,
        foto_5: foto_5 || null
      }
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
          message: 'No tienes permiso para eliminar este animal'
        }
      });
    }

    // Eliminar el animal
    await prisma.animal.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      data: {
        message: 'Animal eliminado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en deleteAnimal:', error);

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
