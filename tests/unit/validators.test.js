const { validationResult } = require('express-validator');

// Helper para ejecutar validaciones
const runValidation = async (validations, body) => {
  const req = { body, params: {}, query: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };

  for (const validation of validations) {
    if (typeof validation === 'function' && validation.name !== 'handleValidationErrors') {
      await validation.run(req);
    }
  }

  return validationResult(req);
};

describe('Validators', () => {
  let validators;

  beforeAll(() => {
    validators = require('../../src/middlewares/validators');
  });

  describe('adoptionRequestValidation', () => {
    const validAdoptionRequest = {
      animal_id: 1,
      nombre_completo: 'Juan Pérez',
      edad: 25,
      email: 'juan@email.com',
      telefono_whatsapp: '1234567890',
      ciudad_zona: 'Buenos Aires',
      tipo_vivienda: 'Casa con patio',
      vive_solo_acompanado: 'Con familia',
      todos_de_acuerdo: true,
      tiene_otros_animales: false,
      experiencia_previa: 'He tenido perros toda mi vida, el último falleció hace 2 años.',
      puede_cubrir_gastos: true,
      motivacion: 'Quiero darle un hogar a un animal necesitado porque tengo mucho amor para dar.',
      compromiso_castracion: true
    };

    test('debe pasar con datos válidos', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, validAdoptionRequest);
      expect(result.isEmpty()).toBe(true);
    });

    test('debe fallar si la edad es menor a 18', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        edad: 17
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'edad')).toBe(true);
    });

    test('debe fallar si la edad es mayor a 120', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        edad: 121
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'edad')).toBe(true);
    });

    test('debe pasar con edad válida (18-120)', async () => {
      const result18 = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        edad: 18
      });
      expect(result18.isEmpty()).toBe(true);

      const result120 = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        edad: 120
      });
      expect(result120.isEmpty()).toBe(true);
    });

    test('debe fallar si el email es inválido', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        email: 'email-invalido'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'email')).toBe(true);
    });

    test('debe fallar si tipo_vivienda es inválido', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        tipo_vivienda: 'Mansión'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'tipo_vivienda')).toBe(true);
    });

    test('debe fallar si todos_de_acuerdo es false', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        todos_de_acuerdo: false
      });
      expect(result.isEmpty()).toBe(false);
    });

    test('debe fallar si compromiso_castracion es false', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        compromiso_castracion: false
      });
      expect(result.isEmpty()).toBe(false);
    });

    test('debe fallar si la motivación tiene menos de 20 caracteres', async () => {
      const result = await runValidation(validators.adoptionRequestValidation, {
        ...validAdoptionRequest,
        motivacion: 'Corta'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'motivacion')).toBe(true);
    });
  });

  describe('animalValidation', () => {
    const validAnimal = {
      nombre: 'Firulais',
      especie: 'Perro',
      sexo: 'Macho',
      edad_aproximada: '2 años',
      tamanio: 'Mediano',
      descripcion_historia: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.',
      publicado_por: 'Refugio Test',
      contacto_rescatista: 'contacto@refugio.com',
      foto_principal: 'https://cloudinary.com/foto.jpg'
    };

    test('debe pasar con datos válidos', async () => {
      const result = await runValidation(validators.animalValidation, validAnimal);
      expect(result.isEmpty()).toBe(true);
    });

    test('debe fallar si especie es inválida', async () => {
      const result = await runValidation(validators.animalValidation, {
        ...validAnimal,
        especie: 'Conejo'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'especie')).toBe(true);
    });

    test('debe fallar si sexo es inválido', async () => {
      const result = await runValidation(validators.animalValidation, {
        ...validAnimal,
        sexo: 'Indefinido'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'sexo')).toBe(true);
    });

    test('debe fallar si tamaño es inválido', async () => {
      const result = await runValidation(validators.animalValidation, {
        ...validAnimal,
        tamanio: 'Gigante'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'tamanio')).toBe(true);
    });

    test('debe aceptar solo Perro o Gato como especie', async () => {
      const resultPerro = await runValidation(validators.animalValidation, {
        ...validAnimal,
        especie: 'Perro'
      });
      expect(resultPerro.isEmpty()).toBe(true);

      const resultGato = await runValidation(validators.animalValidation, {
        ...validAnimal,
        especie: 'Gato'
      });
      expect(resultGato.isEmpty()).toBe(true);
    });

    test('debe fallar si la descripción tiene menos de 50 caracteres', async () => {
      const result = await runValidation(validators.animalValidation, {
        ...validAnimal,
        descripcion_historia: 'Muy corta'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'descripcion_historia')).toBe(true);
    });

    test('debe fallar si foto_principal no es URL válida', async () => {
      const result = await runValidation(validators.animalValidation, {
        ...validAnimal,
        foto_principal: 'no-es-url'
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'foto_principal')).toBe(true);
    });
  });

  describe('statusValidation', () => {
    test('debe aceptar estados válidos de animal', async () => {
      const estadosValidos = ['Disponible', 'En proceso', 'Adoptado', 'En transito'];

      for (const estado of estadosValidos) {
        const result = await runValidation(validators.statusValidation, { estado });
        expect(result.isEmpty()).toBe(true);
      }
    });

    test('debe rechazar estados inválidos', async () => {
      const result = await runValidation(validators.statusValidation, { estado: 'Perdido' });
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('adoptionStatusValidation', () => {
    test('debe aceptar estados válidos de solicitud', async () => {
      const estadosValidos = ['Nueva', 'Revisada', 'En evaluación', 'Aprobada', 'Rechazada'];

      for (const estado_solicitud of estadosValidos) {
        const result = await runValidation(validators.adoptionStatusValidation, { estado_solicitud });
        expect(result.isEmpty()).toBe(true);
      }
    });

    test('debe rechazar estados inválidos', async () => {
      const result = await runValidation(validators.adoptionStatusValidation, { estado_solicitud: 'Pendiente' });
      expect(result.isEmpty()).toBe(false);
    });
  });
});
