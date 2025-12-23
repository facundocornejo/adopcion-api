const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Errores de validación',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      }
    });
  }

  next();
};

// Validaciones para crear/actualizar animal
const animalValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres')
    .escape(), // Sanitizar XSS

  body('especie')
    .trim()
    .notEmpty().withMessage('La especie es obligatoria')
    .isIn(['Perro', 'Gato']).withMessage('La especie debe ser "Perro" o "Gato"'),

  body('sexo')
    .trim()
    .notEmpty().withMessage('El sexo es obligatorio')
    .isIn(['Macho', 'Hembra']).withMessage('El sexo debe ser "Macho" o "Hembra"'),

  body('edad_aproximada')
    .trim()
    .notEmpty().withMessage('La edad aproximada es obligatoria')
    .isLength({ max: 50 }).withMessage('La edad no puede superar 50 caracteres')
    .escape(), // Sanitizar XSS

  body('tamanio')
    .trim()
    .notEmpty().withMessage('El tamaño es obligatorio')
    .isIn(['Pequeño', 'Mediano', 'Grande']).withMessage('El tamaño debe ser "Pequeño", "Mediano" o "Grande"'),

  body('descripcion_historia')
    .trim()
    .notEmpty().withMessage('La descripción/historia es obligatoria')
    .isLength({ min: 50 }).withMessage('La descripción debe tener al menos 50 caracteres')
    .escape(), // Sanitizar XSS

  body('publicado_por')
    .trim()
    .notEmpty().withMessage('El campo "publicado por" es obligatorio')
    .isLength({ max: 100 }).withMessage('No puede superar 100 caracteres')
    .escape(), // Sanitizar XSS

  body('contacto_rescatista')
    .trim()
    .notEmpty().withMessage('El contacto del rescatista es obligatorio')
    .isLength({ max: 200 }).withMessage('No puede superar 200 caracteres')
    .escape(), // Sanitizar XSS

  body('foto_principal')
    .trim()
    .notEmpty().withMessage('La foto principal es obligatoria')
    .isURL().withMessage('La foto principal debe ser una URL válida'),

  // Campos opcionales con validación
  body('raza_mezcla')
    .optional({ nullable: true })
    .isLength({ max: 100 }).withMessage('La raza no puede superar 100 caracteres'),

  body('estado_vacunacion')
    .optional({ nullable: true })
    .isLength({ max: 200 }).withMessage('El estado de vacunación no puede superar 200 caracteres'),

  body('necesidades_especiales')
    .optional({ nullable: true }),

  body('tipo_hogar_ideal')
    .optional({ nullable: true })
    .isLength({ max: 200 }).withMessage('El tipo de hogar no puede superar 200 caracteres'),

  body('foto_2')
    .optional({ nullable: true })
    .isURL().withMessage('La foto 2 debe ser una URL válida'),

  body('foto_3')
    .optional({ nullable: true })
    .isURL().withMessage('La foto 3 debe ser una URL válida'),

  body('foto_4')
    .optional({ nullable: true })
    .isURL().withMessage('La foto 4 debe ser una URL válida'),

  body('foto_5')
    .optional({ nullable: true })
    .isURL().withMessage('La foto 5 debe ser una URL válida'),

  // Booleanos
  body('estado_castracion')
    .optional()
    .isBoolean().withMessage('estado_castracion debe ser true o false'),

  body('estado_desparasitacion')
    .optional()
    .isBoolean().withMessage('estado_desparasitacion debe ser true o false'),

  body('socializa_perros')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true
      if (typeof value === 'boolean') return true
      throw new Error('socializa_perros debe ser true, false o null')
    }),

  body('socializa_gatos')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true
      if (typeof value === 'boolean') return true
      throw new Error('socializa_gatos debe ser true, false o null')
    }),

  body('socializa_ninos')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true
      if (typeof value === 'boolean') return true
      throw new Error('socializa_ninos debe ser true, false o null')
    }),

  handleValidationErrors
];

// Validación para cambiar estado
const statusValidation = [
  body('estado')
    .trim()
    .notEmpty().withMessage('El estado es obligatorio')
    .isIn(['Disponible', 'En proceso', 'Adoptado', 'En transito'])
    .withMessage('Estado inválido. Debe ser: Disponible, En proceso, Adoptado o En transito'),

  handleValidationErrors
];

// Validación de ID en parámetros
const idParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  handleValidationErrors
];

// Validaciones para solicitud de adopción
const adoptionRequestValidation = [
  body('animal_id')
    .notEmpty().withMessage('El ID del animal es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del animal debe ser un número válido'),

  body('nombre_completo')
    .trim()
    .notEmpty().withMessage('El nombre completo es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres')
    .escape(), // Sanitizar XSS

  body('edad')
    .notEmpty().withMessage('La edad es obligatoria')
    .isInt({ min: 18 }).withMessage('Debes ser mayor de 18 años para adoptar'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail() // Normalizar email (OWASP)
    .isLength({ max: 100 }).withMessage('El email no puede superar 100 caracteres'),

  body('telefono_whatsapp')
    .trim()
    .notEmpty().withMessage('El teléfono/WhatsApp es obligatorio')
    .isLength({ max: 20 }).withMessage('El teléfono no puede superar 20 caracteres')
    .escape(), // Sanitizar XSS

  body('instagram')
    .optional({ nullable: true })
    .isLength({ max: 100 }).withMessage('El Instagram no puede superar 100 caracteres')
    .escape(), // Sanitizar XSS

  body('ciudad_zona')
    .trim()
    .notEmpty().withMessage('La ciudad/zona es obligatoria')
    .isLength({ max: 100 }).withMessage('La ciudad/zona no puede superar 100 caracteres')
    .escape(), // Sanitizar XSS

  body('tipo_vivienda')
    .trim()
    .notEmpty().withMessage('El tipo de vivienda es obligatorio')
    .isIn(['Casa con patio', 'Casa sin patio', 'Departamento', 'Otro'])
    .withMessage('Tipo de vivienda no válido'),

  body('vive_solo_acompanado')
    .trim()
    .notEmpty().withMessage('Este campo es obligatorio')
    .isLength({ max: 100 }).withMessage('No puede superar 100 caracteres')
    .escape(), // Sanitizar XSS

  body('todos_de_acuerdo')
    .notEmpty().withMessage('Debes indicar si todos están de acuerdo')
    .isBoolean().withMessage('Debe ser true o false')
    .custom((value) => {
      if (value !== true && value !== 'true') {
        throw new Error('Todos los miembros del hogar deben estar de acuerdo');
      }
      return true;
    }),

  body('tiene_otros_animales')
    .notEmpty().withMessage('Debes indicar si tienes otros animales')
    .isBoolean().withMessage('Debe ser true o false'),

  body('otros_animales_castrados')
    .optional({ nullable: true })
    .isIn(['Sí', 'No', 'Algunos', null]).withMessage('Valor no válido'),

  body('experiencia_previa')
    .trim()
    .notEmpty().withMessage('La experiencia previa es obligatoria')
    .escape(), // Sanitizar XSS

  body('puede_cubrir_gastos')
    .notEmpty().withMessage('Debes indicar si puedes cubrir gastos')
    .isBoolean().withMessage('Debe ser true o false'),

  body('veterinaria_que_usa')
    .optional({ nullable: true })
    .isLength({ max: 200 }).withMessage('No puede superar 200 caracteres')
    .escape(), // Sanitizar XSS

  body('motivacion')
    .trim()
    .notEmpty().withMessage('La motivación es obligatoria')
    .isLength({ min: 20 }).withMessage('La motivación debe tener al menos 20 caracteres')
    .escape(), // Sanitizar XSS

  body('compromiso_castracion')
    .notEmpty().withMessage('Debes aceptar el compromiso de castración')
    .isBoolean().withMessage('Debe ser true o false')
    .custom((value) => {
      if (value !== true && value !== 'true') {
        throw new Error('Debes aceptar el compromiso de castración');
      }
      return true;
    }),

  body('acepta_contacto')
    .optional()
    .isBoolean().withMessage('Debe ser true o false'),

  handleValidationErrors
];

// Validación para cambiar estado de solicitud
const adoptionStatusValidation = [
  body('estado_solicitud')
    .trim()
    .notEmpty().withMessage('El estado es obligatorio')
    .isIn(['Nueva', 'Revisada', 'En evaluación', 'Aprobada', 'Rechazada'])
    .withMessage('Estado no válido'),

  handleValidationErrors
];

module.exports = {
  animalValidation,
  statusValidation,
  idParamValidation,
  handleValidationErrors,
  adoptionRequestValidation,
  adoptionStatusValidation
};
