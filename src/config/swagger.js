const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Adopción de Animales',
      version: '1.0.0',
      description: 'Backend para plataforma de adopción de animales - TFI UTN Paraná',
      contact: {
        name: 'Facundo Cornejo'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Desarrollo local'
      },
      {
        url: 'https://adopcion-api.onrender.com',
        description: 'Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Animal: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Firulais' },
            especie: { type: 'string', enum: ['Perro', 'Gato'] },
            sexo: { type: 'string', enum: ['Macho', 'Hembra'] },
            edad_aproximada: { type: 'string', example: '2 años' },
            tamanio: { type: 'string', enum: ['Pequeño', 'Mediano', 'Grande'] },
            raza_mezcla: { type: 'string', example: 'Mestizo' },
            descripcion_historia: { type: 'string', example: 'Rescatado de la calle...' },
            estado_castracion: { type: 'boolean' },
            estado_vacunacion: { type: 'string' },
            estado_desparasitacion: { type: 'boolean' },
            socializa_perros: { type: 'boolean' },
            socializa_gatos: { type: 'boolean' },
            socializa_ninos: { type: 'boolean' },
            necesidades_especiales: { type: 'string' },
            tipo_hogar_ideal: { type: 'string' },
            estado: { type: 'string', enum: ['Disponible', 'En proceso', 'Adoptado', 'En transito'] },
            publicado_por: { type: 'string' },
            contacto_rescatista: { type: 'string' },
            foto_principal: { type: 'string', format: 'uri' },
            foto_2: { type: 'string', format: 'uri' },
            foto_3: { type: 'string', format: 'uri' },
            foto_4: { type: 'string', format: 'uri' },
            foto_5: { type: 'string', format: 'uri' },
            fecha_publicacion: { type: 'string', format: 'date-time' }
          }
        },
        AnimalInput: {
          type: 'object',
          required: ['nombre', 'especie', 'sexo', 'edad_aproximada', 'tamanio', 'descripcion_historia', 'publicado_por', 'contacto_rescatista', 'foto_principal'],
          properties: {
            nombre: { type: 'string', example: 'Firulais' },
            especie: { type: 'string', enum: ['Perro', 'Gato'] },
            sexo: { type: 'string', enum: ['Macho', 'Hembra'] },
            edad_aproximada: { type: 'string', example: '2 años' },
            tamanio: { type: 'string', enum: ['Pequeño', 'Mediano', 'Grande'] },
            raza_mezcla: { type: 'string', example: 'Mestizo' },
            descripcion_historia: { type: 'string', minLength: 50, example: 'Historia del rescate del animal, debe tener al menos 50 caracteres para ser válida.' },
            estado_castracion: { type: 'boolean', default: false },
            estado_vacunacion: { type: 'string' },
            estado_desparasitacion: { type: 'boolean', default: false },
            socializa_perros: { type: 'boolean', default: false },
            socializa_gatos: { type: 'boolean', default: false },
            socializa_ninos: { type: 'boolean', default: false },
            necesidades_especiales: { type: 'string' },
            tipo_hogar_ideal: { type: 'string' },
            publicado_por: { type: 'string', example: 'Refugio Patitas' },
            contacto_rescatista: { type: 'string', example: '@refugio_patitas' },
            foto_principal: { type: 'string', format: 'uri' },
            foto_2: { type: 'string', format: 'uri' },
            foto_3: { type: 'string', format: 'uri' },
            foto_4: { type: 'string', format: 'uri' },
            foto_5: { type: 'string', format: 'uri' }
          }
        },
        SolicitudAdopcion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            animal_id: { type: 'integer' },
            nombre_completo: { type: 'string' },
            edad: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            telefono_whatsapp: { type: 'string' },
            instagram: { type: 'string' },
            ciudad_zona: { type: 'string' },
            tipo_vivienda: { type: 'string' },
            vive_solo_acompanado: { type: 'string' },
            todos_de_acuerdo: { type: 'boolean' },
            tiene_otros_animales: { type: 'boolean' },
            otros_animales_castrados: { type: 'string' },
            experiencia_previa: { type: 'string' },
            puede_cubrir_gastos: { type: 'boolean' },
            veterinaria_que_usa: { type: 'string' },
            motivacion: { type: 'string' },
            compromiso_castracion: { type: 'boolean' },
            acepta_contacto: { type: 'boolean' },
            fecha_solicitud: { type: 'string', format: 'date-time' },
            estado_solicitud: { type: 'string' }
          }
        },
        SolicitudInput: {
          type: 'object',
          required: ['animal_id', 'nombre_completo', 'edad', 'email', 'telefono_whatsapp', 'ciudad_zona', 'tipo_vivienda', 'vive_solo_acompanado', 'todos_de_acuerdo', 'tiene_otros_animales', 'experiencia_previa', 'puede_cubrir_gastos', 'motivacion', 'compromiso_castracion'],
          properties: {
            animal_id: { type: 'integer', example: 1 },
            nombre_completo: { type: 'string', example: 'Juan Pérez' },
            edad: { type: 'integer', minimum: 18, example: 25 },
            email: { type: 'string', format: 'email', example: 'juan@email.com' },
            telefono_whatsapp: { type: 'string', example: '+54 9 343 555-1234' },
            instagram: { type: 'string', example: '@juanperez' },
            ciudad_zona: { type: 'string', example: 'Paraná, Entre Ríos' },
            tipo_vivienda: { type: 'string', enum: ['Casa con patio', 'Casa sin patio', 'Departamento', 'Otro'] },
            vive_solo_acompanado: { type: 'string', example: 'Con familia' },
            todos_de_acuerdo: { type: 'boolean', example: true },
            tiene_otros_animales: { type: 'boolean', example: false },
            otros_animales_castrados: { type: 'string', enum: ['Sí', 'No', 'Algunos'] },
            experiencia_previa: { type: 'string', example: 'Tuve perros toda mi vida' },
            puede_cubrir_gastos: { type: 'boolean', example: true },
            veterinaria_que_usa: { type: 'string', example: 'Veterinaria Centro' },
            motivacion: { type: 'string', minLength: 20, example: 'Quiero darle un hogar a un animalito' },
            compromiso_castracion: { type: 'boolean', example: true },
            acepta_contacto: { type: 'boolean', default: true }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@adopcion.com' },
            password: { type: 'string', example: 'admin123' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
