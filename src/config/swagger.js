const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Adopción de Animales',
      version: '1.0.0',
      description: `
## Plataforma de Adopción de Animales - TFI UTN Paraná

API REST para gestionar adopciones de animales en refugios y organizaciones.

### Características principales:
- **Multi-tenant**: Cada organización gestiona sus propios animales
- **Autenticación JWT**: Tokens válidos por 24 horas
- **Roles**: Admin (por organización) y Super Admin (gestión global)

### Flujo típico:
1. El público puede ver animales y enviar solicitudes de adopción
2. Los admins gestionan animales y solicitudes de su organización
3. El super admin gestiona todas las organizaciones

### Autenticación:
Para endpoints protegidos, incluir el header:
\`\`\`
Authorization: Bearer <token>
\`\`\`
      `,
      contact: {
        name: 'Facundo Cornejo',
        email: 'contacto@adopcion.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'https://adopcion-api.onrender.com',
        description: 'Producción'
      },
      {
        url: 'http://localhost:3000',
        description: 'Desarrollo local'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación y sesión de administradores'
      },
      {
        name: 'Animales',
        description: 'Gestión de animales en adopción. GET público, resto requiere autenticación.'
      },
      {
        name: 'Solicitudes',
        description: 'Solicitudes de adopción. POST público, resto requiere autenticación.'
      },
      {
        name: 'Organización',
        description: 'Datos de la organización del admin autenticado'
      },
      {
        name: 'Dashboard',
        description: 'Estadísticas para el panel de administración'
      },
      {
        name: 'Casos de Éxito',
        description: 'Historias de adopciones exitosas'
      },
      {
        name: 'Upload',
        description: 'Subida de imágenes a Cloudinary'
      },
      {
        name: 'Contacto',
        description: 'Solicitudes de rescatistas para unirse a la plataforma'
      },
      {
        name: 'Super Admin',
        description: 'Gestión global de organizaciones (solo super admin)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del login. Válido por 24 horas.'
        }
      },
      schemas: {
        // ==================== ANIMAL ====================
        Animal: {
          type: 'object',
          description: 'Animal disponible para adopción',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Luna' },
            especie: {
              type: 'string',
              enum: ['Perro', 'Gato'],
              example: 'Perro'
            },
            sexo: {
              type: 'string',
              enum: ['Macho', 'Hembra'],
              example: 'Hembra'
            },
            edad_aproximada: { type: 'string', example: '2 años' },
            tamanio: {
              type: 'string',
              enum: ['Pequeño', 'Mediano', 'Grande'],
              example: 'Mediano'
            },
            raza_mezcla: { type: 'string', example: 'Labrador Mix', nullable: true },
            descripcion_historia: {
              type: 'string',
              example: 'Luna fue rescatada de la calle cuando era cachorra. Es muy cariñosa y le encanta jugar.'
            },
            estado_castracion: { type: 'boolean', example: true },
            estado_vacunacion: { type: 'string', example: 'Al día - Antirrábica y Séxtuple' },
            estado_desparasitacion: { type: 'boolean', example: true },
            socializa_perros: { type: 'boolean', example: true },
            socializa_gatos: { type: 'boolean', example: false },
            socializa_ninos: { type: 'boolean', example: true },
            necesidades_especiales: { type: 'string', nullable: true, example: 'Dieta especial' },
            tipo_hogar_ideal: { type: 'string', nullable: true, example: 'Casa con patio' },
            estado: {
              type: 'string',
              enum: ['Disponible', 'En proceso', 'Adoptado', 'En transito'],
              description: 'Estado actual del animal',
              example: 'Disponible'
            },
            publicado_por: { type: 'string', example: 'Refugio Patitas Felices' },
            contacto_rescatista: { type: 'string', example: '@patitas_felices' },
            foto_principal: { type: 'string', format: 'uri', example: 'https://res.cloudinary.com/xxx/image/upload/animal1.jpg' },
            foto_2: { type: 'string', format: 'uri', nullable: true },
            foto_3: { type: 'string', format: 'uri', nullable: true },
            foto_4: { type: 'string', format: 'uri', nullable: true },
            foto_5: { type: 'string', format: 'uri', nullable: true },
            fecha_publicacion: { type: 'string', format: 'date-time' },
            organizacion: {
              type: 'object',
              description: 'Datos públicos de la organización (sin teléfono/whatsapp por privacidad)',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
                slug: { type: 'string' },
                instagram: { type: 'string', example: '@patitas_felices', nullable: true },
                facebook: { type: 'string', example: 'patitasfelices', nullable: true },
                donacion_alias: { type: 'string', example: 'PATITAS.FELICES', nullable: true },
                donacion_cbu: { type: 'string', nullable: true },
                donacion_info: { type: 'string', example: 'También aceptamos alimento balanceado', nullable: true }
              }
            }
          }
        },
        AnimalInput: {
          type: 'object',
          description: 'Datos para crear/actualizar un animal',
          required: ['nombre', 'especie', 'sexo', 'edad_aproximada', 'tamanio', 'descripcion_historia', 'publicado_por', 'contacto_rescatista', 'foto_principal'],
          properties: {
            nombre: { type: 'string', example: 'Luna', minLength: 2, maxLength: 100 },
            especie: { type: 'string', enum: ['Perro', 'Gato'] },
            sexo: { type: 'string', enum: ['Macho', 'Hembra'] },
            edad_aproximada: { type: 'string', example: '2 años' },
            tamanio: { type: 'string', enum: ['Pequeño', 'Mediano', 'Grande'] },
            raza_mezcla: { type: 'string', example: 'Labrador Mix' },
            descripcion_historia: {
              type: 'string',
              minLength: 50,
              example: 'Luna fue rescatada de la calle cuando era cachorra. Es muy cariñosa, juguetona y le encanta correr.'
            },
            estado_castracion: { type: 'boolean', default: false },
            estado_vacunacion: { type: 'string', example: 'Al día' },
            estado_desparasitacion: { type: 'boolean', default: false },
            socializa_perros: { type: 'boolean', default: false },
            socializa_gatos: { type: 'boolean', default: false },
            socializa_ninos: { type: 'boolean', default: false },
            necesidades_especiales: { type: 'string' },
            tipo_hogar_ideal: { type: 'string' },
            publicado_por: { type: 'string', example: 'Refugio Patitas Felices' },
            contacto_rescatista: { type: 'string', example: '@patitas_felices' },
            foto_principal: { type: 'string', format: 'uri' },
            foto_2: { type: 'string', format: 'uri' },
            foto_3: { type: 'string', format: 'uri' },
            foto_4: { type: 'string', format: 'uri' },
            foto_5: { type: 'string', format: 'uri' }
          }
        },
        AnimalListResponse: {
          type: 'object',
          description: 'Respuesta paginada de lista de animales',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                animals: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AnimalSummary' }
                },
                total: { type: 'integer', example: 50, description: 'Total de animales' },
                page: { type: 'integer', example: 1, description: 'Página actual' },
                limit: { type: 'integer', example: 20, description: 'Items por página' },
                totalPages: { type: 'integer', example: 3, description: 'Total de páginas' }
              }
            }
          }
        },
        AnimalSummary: {
          type: 'object',
          description: 'Resumen de animal para listados',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            especie: { type: 'string' },
            sexo: { type: 'string' },
            edad_aproximada: { type: 'string' },
            tamanio: { type: 'string' },
            estado: { type: 'string' },
            foto_principal: { type: 'string' },
            fecha_publicacion: { type: 'string', format: 'date-time' },
            organizacion: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
                slug: { type: 'string' }
              }
            }
          }
        },

        // ==================== SOLICITUD ADOPCION ====================
        SolicitudAdopcion: {
          type: 'object',
          description: 'Solicitud de adopción enviada por un potencial adoptante',
          properties: {
            id: { type: 'integer' },
            animal_id: { type: 'integer' },
            nombre_completo: { type: 'string', example: 'Juan Pérez' },
            edad: { type: 'integer', example: 28 },
            email: { type: 'string', format: 'email' },
            telefono_whatsapp: { type: 'string', example: '+54 9 343 555-1234' },
            instagram: { type: 'string', nullable: true },
            ciudad_zona: { type: 'string', example: 'Paraná, Entre Ríos' },
            tipo_vivienda: { type: 'string', example: 'Casa con patio' },
            vive_solo_acompanado: { type: 'string', example: 'Con familia' },
            todos_de_acuerdo: { type: 'boolean' },
            tiene_otros_animales: { type: 'boolean' },
            otros_animales_castrados: { type: 'string', nullable: true },
            experiencia_previa: { type: 'string' },
            puede_cubrir_gastos: { type: 'boolean' },
            veterinaria_que_usa: { type: 'string', nullable: true },
            motivacion: { type: 'string' },
            compromiso_castracion: { type: 'boolean' },
            acepta_contacto: { type: 'boolean' },
            fecha_solicitud: { type: 'string', format: 'date-time' },
            estado_solicitud: {
              type: 'string',
              enum: ['Nueva', 'Revisada', 'En evaluación', 'Aprobada', 'Rechazada'],
              example: 'Nueva'
            },
            animal: { $ref: '#/components/schemas/AnimalSummary' }
          }
        },
        SolicitudInput: {
          type: 'object',
          description: 'Datos para crear una solicitud de adopción (formulario público)',
          required: ['animal_id', 'nombre_completo', 'edad', 'email', 'telefono_whatsapp', 'ciudad_zona', 'tipo_vivienda', 'vive_solo_acompanado', 'todos_de_acuerdo', 'tiene_otros_animales', 'experiencia_previa', 'puede_cubrir_gastos', 'motivacion', 'compromiso_castracion'],
          properties: {
            animal_id: { type: 'integer', example: 1, description: 'ID del animal a adoptar' },
            nombre_completo: { type: 'string', example: 'Juan Pérez', minLength: 3 },
            edad: { type: 'integer', minimum: 18, example: 28, description: 'Debe ser mayor de 18' },
            email: { type: 'string', format: 'email', example: 'juan@email.com' },
            telefono_whatsapp: { type: 'string', example: '+54 9 343 555-1234' },
            instagram: { type: 'string', example: '@juanperez' },
            ciudad_zona: { type: 'string', example: 'Paraná, Entre Ríos' },
            tipo_vivienda: {
              type: 'string',
              enum: ['Casa con patio', 'Casa sin patio', 'Departamento', 'Otro'],
              example: 'Casa con patio'
            },
            vive_solo_acompanado: { type: 'string', example: 'Con familia (2 adultos, 1 niño)' },
            todos_de_acuerdo: { type: 'boolean', example: true, description: '¿Todos en el hogar están de acuerdo?' },
            tiene_otros_animales: { type: 'boolean', example: false },
            otros_animales_castrados: { type: 'string', enum: ['Sí', 'No', 'Algunos', 'No aplica'] },
            experiencia_previa: { type: 'string', example: 'Tuve perros toda mi vida, el último falleció hace 1 año' },
            puede_cubrir_gastos: { type: 'boolean', example: true, description: '¿Puede cubrir gastos veterinarios?' },
            veterinaria_que_usa: { type: 'string', example: 'Veterinaria Centro - Dr. García' },
            motivacion: { type: 'string', minLength: 20, example: 'Quiero darle un hogar amoroso a un animalito que lo necesite' },
            compromiso_castracion: { type: 'boolean', example: true, description: '¿Se compromete a castrar si no está castrado?' },
            acepta_contacto: { type: 'boolean', default: true, description: '¿Acepta ser contactado?' }
          }
        },

        // ==================== AUTH ====================
        LoginInput: {
          type: 'object',
          description: 'Credenciales de login',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@refugio.com' },
            password: { type: 'string', example: 'miPassword123' }
          }
        },
        LoginResponse: {
          type: 'object',
          description: 'Respuesta exitosa de login',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT token válido por 24 horas',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                admin: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    username: { type: 'string', example: 'admin_patitas' },
                    email: { type: 'string', example: 'admin@patitas.org' },
                    es_super_admin: { type: 'boolean', example: false },
                    organizacion: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        nombre: { type: 'string', example: 'Refugio Patitas Felices' },
                        slug: { type: 'string', example: 'patitas-felices' }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // ==================== ORGANIZACION ====================
        Organizacion: {
          type: 'object',
          description: 'Organización/Refugio registrado en la plataforma',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string', example: 'Refugio Patitas Felices' },
            slug: { type: 'string', example: 'patitas-felices', description: 'Identificador URL-friendly' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            whatsapp: { type: 'string' },
            direccion: { type: 'string' },
            descripcion: { type: 'string' },
            logo_url: { type: 'string', format: 'uri' },
            instagram: { type: 'string', example: '@patitas_felices' },
            facebook: { type: 'string', example: 'patitasfelices' },
            donacion_alias: { type: 'string', example: 'PATITAS.FELICES' },
            donacion_cbu: { type: 'string' },
            donacion_info: { type: 'string' },
            activa: { type: 'boolean' },
            fecha_creacion: { type: 'string', format: 'date-time' }
          }
        },
        OrganizacionInput: {
          type: 'object',
          description: 'Datos para actualizar una organización',
          properties: {
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            whatsapp: { type: 'string' },
            direccion: { type: 'string' },
            descripcion: { type: 'string' },
            instagram: { type: 'string' },
            facebook: { type: 'string' },
            donacion_alias: { type: 'string' },
            donacion_cbu: { type: 'string' },
            donacion_info: { type: 'string' }
          }
        },

        // ==================== CASO DE EXITO ====================
        CasoExito: {
          type: 'object',
          description: 'Historia de una adopción exitosa',
          properties: {
            id: { type: 'integer' },
            animal_id: { type: 'integer' },
            organizacion_id: { type: 'integer' },
            titulo: { type: 'string', example: 'Luna encontró su hogar' },
            historia: { type: 'string', example: 'Después de 3 meses en el refugio, Luna fue adoptada por la familia García...' },
            foto_actual_1: { type: 'string', format: 'uri' },
            foto_actual_2: { type: 'string', format: 'uri' },
            foto_actual_3: { type: 'string', format: 'uri' },
            fecha_adopcion: { type: 'string', format: 'date' },
            fecha_publicacion: { type: 'string', format: 'date-time' },
            animal: { $ref: '#/components/schemas/AnimalSummary' }
          }
        },
        CasoExitoInput: {
          type: 'object',
          description: 'Datos para crear un caso de éxito',
          required: ['animal_id', 'titulo', 'historia', 'fecha_adopcion'],
          properties: {
            animal_id: { type: 'integer', description: 'ID del animal adoptado' },
            titulo: { type: 'string', example: 'Luna encontró su hogar' },
            historia: { type: 'string', minLength: 50, example: 'Después de 3 meses en el refugio, Luna fue adoptada por la familia García. Ahora vive feliz con sus dos hermanitos humanos.' },
            foto_actual_1: { type: 'string', format: 'uri' },
            foto_actual_2: { type: 'string', format: 'uri' },
            foto_actual_3: { type: 'string', format: 'uri' },
            fecha_adopcion: { type: 'string', format: 'date', example: '2024-01-15' }
          }
        },

        // ==================== SOLICITUD CONTACTO ====================
        SolicitudContacto: {
          type: 'object',
          description: 'Solicitud de un rescatista para unirse a la plataforma',
          properties: {
            id: { type: 'integer' },
            nombre_refugio: { type: 'string' },
            nombre_contacto: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            ciudad: { type: 'string' },
            descripcion: { type: 'string' },
            instagram: { type: 'string' },
            facebook: { type: 'string' },
            cantidad_animales: { type: 'string' },
            estado: {
              type: 'string',
              enum: ['Pendiente', 'Aprobada', 'Rechazada'],
              example: 'Pendiente'
            },
            notas_admin: { type: 'string', nullable: true },
            fecha_solicitud: { type: 'string', format: 'date-time' },
            fecha_respuesta: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        SolicitudContactoInput: {
          type: 'object',
          description: 'Datos para solicitar unirse como rescatista',
          required: ['nombre_refugio', 'nombre_contacto', 'email', 'telefono', 'ciudad', 'descripcion'],
          properties: {
            nombre_refugio: { type: 'string', example: 'Refugio Huellitas' },
            nombre_contacto: { type: 'string', example: 'María García' },
            email: { type: 'string', format: 'email', example: 'maria@huellitas.org' },
            telefono: { type: 'string', example: '+54 343 555-5678' },
            ciudad: { type: 'string', example: 'Paraná, Entre Ríos' },
            descripcion: { type: 'string', example: 'Somos un refugio con 5 años de experiencia rescatando animales de la calle' },
            instagram: { type: 'string', example: '@huellitas_parana' },
            facebook: { type: 'string', example: 'huellitasparana' },
            cantidad_animales: { type: 'string', example: 'Aproximadamente 30 animales' }
          }
        },

        // ==================== DASHBOARD ====================
        DashboardStats: {
          type: 'object',
          description: 'Estadísticas del dashboard de admin',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                resumen: {
                  type: 'object',
                  properties: {
                    total_animales: { type: 'integer', example: 25 },
                    total_solicitudes: { type: 'integer', example: 48 },
                    adopciones_completadas: { type: 'integer', example: 12 }
                  }
                },
                animales_por_estado: {
                  type: 'object',
                  properties: {
                    Disponible: { type: 'integer', example: 15 },
                    'En proceso': { type: 'integer', example: 5 },
                    Adoptado: { type: 'integer', example: 12 },
                    'En transito': { type: 'integer', example: 3 }
                  }
                },
                solicitudes_por_estado: {
                  type: 'object',
                  properties: {
                    Nueva: { type: 'integer', example: 10 },
                    Revisada: { type: 'integer', example: 8 },
                    'En evaluación': { type: 'integer', example: 5 },
                    Aprobada: { type: 'integer', example: 20 },
                    Rechazada: { type: 'integer', example: 5 }
                  }
                }
              }
            }
          }
        },

        // ==================== UPLOAD ====================
        UploadResponse: {
          type: 'object',
          description: 'Respuesta al subir una imagen',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://res.cloudinary.com/xxx/image/upload/v123/animals/abc123.jpg'
                },
                public_id: {
                  type: 'string',
                  example: 'animals/abc123',
                  description: 'ID para eliminar la imagen después'
                }
              }
            }
          }
        },

        // ==================== ERROR ====================
        Error: {
          type: 'object',
          description: 'Respuesta de error estándar',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                  description: 'Código de error para manejo programático'
                },
                message: {
                  type: 'string',
                  example: 'El email es requerido',
                  description: 'Mensaje legible para mostrar al usuario'
                }
              }
            }
          }
        },

        // ==================== SUCCESS ====================
        Success: {
          type: 'object',
          description: 'Respuesta exitosa genérica',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operación realizada correctamente' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
