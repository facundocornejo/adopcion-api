/**
 * Constantes y enums centralizados para la API de Adopción
 * Usar estas constantes en lugar de strings hardcodeados
 */

// Estados de animales
const ANIMAL_STATUS = {
  DISPONIBLE: 'Disponible',
  EN_PROCESO: 'En proceso',
  ADOPTADO: 'Adoptado',
  EN_TRANSITO: 'En transito'
};
const ANIMAL_STATUS_VALUES = Object.values(ANIMAL_STATUS);
const ANIMAL_STATUS_ADOPTABLE = [ANIMAL_STATUS.DISPONIBLE, ANIMAL_STATUS.EN_PROCESO, ANIMAL_STATUS.EN_TRANSITO];

// Especies
const ESPECIE = {
  PERRO: 'Perro',
  GATO: 'Gato'
};
const ESPECIE_VALUES = Object.values(ESPECIE);

// Sexo
const SEXO = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra'
};
const SEXO_VALUES = Object.values(SEXO);

// Tamaños
const TAMANIO = {
  PEQUENIO: 'Pequeño',
  MEDIANO: 'Mediano',
  GRANDE: 'Grande'
};
const TAMANIO_VALUES = Object.values(TAMANIO);

// Estados de solicitud de adopción
const ADOPTION_REQUEST_STATUS = {
  NUEVA: 'Nueva',
  REVISADA: 'Revisada',
  EN_EVALUACION: 'En evaluación',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada'
};
const ADOPTION_REQUEST_STATUS_VALUES = Object.values(ADOPTION_REQUEST_STATUS);

// Estados de solicitud de contacto (refugios)
const CONTACT_REQUEST_STATUS = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada'
};
const CONTACT_REQUEST_STATUS_VALUES = Object.values(CONTACT_REQUEST_STATUS);

// Tipos de vivienda
const TIPO_VIVIENDA = {
  CASA_CON_PATIO: 'Casa con patio',
  CASA_SIN_PATIO: 'Casa sin patio',
  DEPARTAMENTO: 'Departamento',
  OTRO: 'Otro'
};
const TIPO_VIVIENDA_VALUES = Object.values(TIPO_VIVIENDA);

// Otros animales castrados
const OTROS_ANIMALES_CASTRADOS = {
  SI: 'Sí',
  NO: 'No',
  ALGUNOS: 'Algunos'
};
const OTROS_ANIMALES_CASTRADOS_VALUES = Object.values(OTROS_ANIMALES_CASTRADOS);

// Validaciones
const VALIDATION = {
  MIN_AGE: 18,
  MAX_AGE: 120,
  MIN_DESCRIPTION_LENGTH: 50,
  MIN_MOTIVATION_LENGTH: 20,
  DUPLICATE_REQUEST_HOURS: 24
};

// Códigos de error
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  ANIMAL_NOT_AVAILABLE: 'ANIMAL_NOT_AVAILABLE'
};

module.exports = {
  ANIMAL_STATUS,
  ANIMAL_STATUS_VALUES,
  ANIMAL_STATUS_ADOPTABLE,
  ESPECIE,
  ESPECIE_VALUES,
  SEXO,
  SEXO_VALUES,
  TAMANIO,
  TAMANIO_VALUES,
  ADOPTION_REQUEST_STATUS,
  ADOPTION_REQUEST_STATUS_VALUES,
  CONTACT_REQUEST_STATUS,
  CONTACT_REQUEST_STATUS_VALUES,
  TIPO_VIVIENDA,
  TIPO_VIVIENDA_VALUES,
  OTROS_ANIMALES_CASTRADOS,
  OTROS_ANIMALES_CASTRADOS_VALUES,
  VALIDATION,
  ERROR_CODES
};
