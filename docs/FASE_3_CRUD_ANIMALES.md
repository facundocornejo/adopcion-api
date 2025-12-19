# FASE 3: CRUD de Animales - Explicación Completa

## Resumen de la Fase

En esta fase implementamos todas las operaciones CRUD (Create, Read, Update, Delete) para los animales. También agregamos validaciones de datos usando express-validator.

**Fecha:** 19 de Diciembre 2025
**Estado:** Completada

---

## ¿Qué es CRUD?

CRUD son las 4 operaciones básicas que podés hacer con datos:

| Operación | HTTP | SQL | Descripción |
|-----------|------|-----|-------------|
| **C**reate | POST | INSERT | Crear nuevo registro |
| **R**ead | GET | SELECT | Leer/obtener registros |
| **U**pdate | PUT/PATCH | UPDATE | Modificar registro existente |
| **D**elete | DELETE | DELETE | Eliminar registro |

---

## Archivos creados

```
src/
├── middlewares/
│   └── validators.js           # Validaciones con express-validator
├── controllers/
│   └── animals.controller.js   # Lógica de CRUD
└── routes/
    └── animals.routes.js       # Definición de endpoints
```

---

## Endpoints implementados

| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| GET | /api/animals | No | Listar todos los animales |
| GET | /api/animals/:id | No | Ver detalle de un animal |
| POST | /api/animals | Sí | Crear nuevo animal |
| PUT | /api/animals/:id | Sí | Actualizar animal completo |
| PATCH | /api/animals/:id/status | Sí | Cambiar solo el estado |
| DELETE | /api/animals/:id | Sí | Eliminar animal |

---

## Explicación de cada archivo

### 1. `validators.js` - Validaciones de datos

**¿Por qué validar en el backend?**
Nunca confíes en los datos que vienen del frontend. Cualquiera puede:
- Abrir DevTools y modificar el JavaScript
- Usar Postman/curl para enviar datos directo a la API
- Saltear todas las validaciones del frontend

**¿Cómo funciona express-validator?**

```javascript
// 1. Importamos las funciones que necesitamos
const { body, validationResult } = require('express-validator');

// 2. Definimos las reglas de validación
const validaciones = [
  body('nombre')
    .trim()                    // Quita espacios al inicio/fin
    .notEmpty()                // No puede estar vacío
    .withMessage('El nombre es obligatorio'),  // Mensaje si falla

  body('especie')
    .isIn(['Perro', 'Gato'])   // Solo estos valores
    .withMessage('Debe ser Perro o Gato'),
];

// 3. Middleware que chequea los errores
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);  // Obtiene errores

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }

  next();  // Sin errores, continúa
};
```

**Validadores más usados:**

| Validador | Qué hace |
|-----------|----------|
| `.notEmpty()` | No puede estar vacío |
| `.isIn([...])` | Debe ser uno de los valores del array |
| `.isLength({ min, max })` | Longitud mínima/máxima |
| `.isURL()` | Debe ser una URL válida |
| `.isBoolean()` | Debe ser true o false |
| `.isInt({ min })` | Debe ser un entero |
| `.optional()` | Campo opcional (no falla si no viene) |
| `.trim()` | Quita espacios antes de validar |

---

### 2. `animals.controller.js` - Lógica del CRUD

#### `getAnimals` - Listar animales

```javascript
const getAnimals = async (req, res) => {
  // 1. Obtener filtros de la query string (?estado=Disponible)
  const { estado, especie } = req.query;

  // 2. Construir objeto de filtros
  const where = {};

  // 3. Si NO está autenticado, solo mostrar ciertos estados
  if (!req.admin) {
    where.estado = { in: ['Disponible', 'En proceso', 'En transito'] };
  }

  // 4. Buscar en la base de datos
  const animals = await prisma.animal.findMany({
    where,
    select: { ... },  // Solo los campos que necesitamos
    orderBy: { fecha_publicacion: 'desc' }  // Más nuevos primero
  });

  // 5. Responder
  res.json({ success: true, data: { animals, total: animals.length } });
};
```

**¿Qué es `req.query`?**
Son los parámetros de la URL después del `?`:
```
GET /api/animals?estado=Disponible&especie=Perro
                 ↑_______________↑
                    req.query = { estado: 'Disponible', especie: 'Perro' }
```

**¿Qué es `select` en Prisma?**
Define qué campos traer de la base de datos. Si no lo ponés, trae todos.

```javascript
// Trae SOLO estos campos (más rápido, menos datos)
select: {
  id: true,
  nombre: true,
  foto_principal: true
}
```

---

#### `getAnimalById` - Ver detalle

```javascript
const getAnimalById = async (req, res) => {
  // 1. Obtener ID de los parámetros de ruta
  const { id } = req.params;

  // 2. Buscar por ID único
  const animal = await prisma.animal.findUnique({
    where: { id: parseInt(id) }  // parseInt porque viene como string
  });

  // 3. Si no existe, error 404
  if (!animal) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Animal no encontrado' }
    });
  }

  // 4. Responder con todos los datos
  res.json({ success: true, data: { animal } });
};
```

**¿Qué es `req.params`?**
Son los parámetros definidos en la ruta con `:`:
```
GET /api/animals/:id
GET /api/animals/5     → req.params = { id: '5' }
```

---

#### `createAnimal` - Crear animal

```javascript
const createAnimal = async (req, res) => {
  // 1. Extraer datos del body
  const { nombre, especie, sexo, ... } = req.body;

  // 2. Crear en la base de datos
  const animal = await prisma.animal.create({
    data: {
      administrador_id: req.admin.id,  // ID del admin autenticado
      nombre,
      especie,
      // ... todos los campos
    }
  });

  // 3. Responder con status 201 (Created)
  res.status(201).json({
    success: true,
    data: { animal, message: 'Animal creado correctamente' }
  });
};
```

**¿De dónde sale `req.admin.id`?**
Del middleware de autenticación. Cuando verificamos el token, guardamos los datos del admin en `req.admin`.

---

#### `updateAnimal` - Actualizar completo

```javascript
const updateAnimal = async (req, res) => {
  const { id } = req.params;

  // 1. Verificar que existe
  const existingAnimal = await prisma.animal.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingAnimal) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }

  // 2. Actualizar
  const animal = await prisma.animal.update({
    where: { id: parseInt(id) },
    data: { ... }
  });

  res.json({ success: true, data: { animal } });
};
```

**¿Por qué verificar que existe primero?**
Si intentás actualizar algo que no existe, Prisma tira un error feo. Es mejor verificar y devolver un 404 limpio.

---

#### `updateAnimalStatus` - Cambiar solo estado

```javascript
const updateAnimalStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const animal = await prisma.animal.update({
    where: { id: parseInt(id) },
    data: { estado },  // Solo actualiza el estado
    select: { id: true, nombre: true, estado: true }
  });

  res.json({ success: true, data: { animal } });
};
```

**¿Por qué PATCH y no PUT?**
- **PUT:** Reemplaza TODO el recurso (mandás todos los campos)
- **PATCH:** Actualiza PARTE del recurso (mandás solo lo que cambia)

---

#### `deleteAnimal` - Eliminar

```javascript
const deleteAnimal = async (req, res) => {
  const { id } = req.params;

  // 1. Verificar que existe
  const existingAnimal = await prisma.animal.findUnique({ ... });
  if (!existingAnimal) return res.status(404)...

  // 2. Eliminar
  await prisma.animal.delete({
    where: { id: parseInt(id) }
  });

  // 3. Responder
  res.json({ success: true, data: { message: 'Animal eliminado' } });
};
```

**¿Qué pasa si tiene solicitudes de adopción?**
La base de datos tiene una restricción de "foreign key". Si intentás eliminar un animal que tiene solicitudes, falla. Capturamos ese error:

```javascript
if (error.code === 'P2003') {
  return res.status(400).json({
    error: { code: 'HAS_DEPENDENCIES', message: 'Tiene solicitudes asociadas' }
  });
}
```

---

### 3. `animals.routes.js` - Definición de rutas

```javascript
const router = express.Router();

// Rutas públicas
router.get('/', optionalAuth, getAnimals);
router.get('/:id', idParamValidation, optionalAuth, getAnimalById);

// Rutas protegidas
router.post('/', verificarToken, animalValidation, createAnimal);
router.put('/:id', verificarToken, idParamValidation, animalValidation, updateAnimal);
router.patch('/:id/status', verificarToken, idParamValidation, statusValidation, updateAnimalStatus);
router.delete('/:id', verificarToken, idParamValidation, deleteAnimal);
```

**¿Qué es `optionalAuth`?**
Un middleware que intenta leer el token pero NO bloquea si no hay. Sirve para que el admin vea todos los animales (incluso adoptados) pero el público solo vea los disponibles.

```javascript
const optionalAuth = (req, res, next) => {
  const token = ...;

  if (token) {
    try {
      req.admin = jwt.verify(token, SECRET);
    } catch (error) {
      // Token inválido, pero NO bloqueamos
    }
  }

  next();  // Siempre continúa
};
```

**Flujo de middlewares:**

```
POST /api/animals
        ↓
[verificarToken] → ¿Token válido? → No → 401
        ↓ Sí
[animalValidation] → ¿Datos válidos? → No → 400
        ↓ Sí
[createAnimal] → Crear en BD → 201
```

---

## Campos del animal

### Obligatorios:
| Campo | Tipo | Validación |
|-------|------|------------|
| nombre | string | max 100 chars |
| especie | string | 'Perro' o 'Gato' |
| sexo | string | 'Macho' o 'Hembra' |
| edad_aproximada | string | max 50 chars |
| tamanio | string | 'Pequeño', 'Mediano' o 'Grande' |
| descripcion_historia | text | min 50 chars |
| publicado_por | string | max 100 chars |
| contacto_rescatista | string | max 200 chars |
| foto_principal | string | URL válida |

### Opcionales:
| Campo | Tipo | Default |
|-------|------|---------|
| raza_mezcla | string | null |
| estado_castracion | boolean | false |
| estado_vacunacion | string | null |
| estado_desparasitacion | boolean | false |
| socializa_perros | boolean | false |
| socializa_gatos | boolean | false |
| socializa_ninos | boolean | false |
| necesidades_especiales | text | null |
| tipo_hogar_ideal | string | null |
| foto_2 a foto_5 | string | null |

### Automáticos:
| Campo | Descripción |
|-------|-------------|
| id | Auto-incrementado |
| administrador_id | ID del admin que lo crea |
| estado | Siempre empieza en 'Disponible' |
| fecha_publicacion | Fecha actual |
| fecha_actualizacion | Se actualiza automáticamente |

---

## Probando los endpoints

### Listar animales (público):
```bash
curl http://localhost:3000/api/animals
```

### Listar con filtros:
```bash
curl "http://localhost:3000/api/animals?especie=Perro&estado=Disponible"
```

### Ver detalle:
```bash
curl http://localhost:3000/api/animals/1
```

### Crear animal (necesita token):
```bash
curl -X POST http://localhost:3000/api/animals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{
    "nombre": "Luna",
    "especie": "Gato",
    "sexo": "Hembra",
    "edad_aproximada": "1 año",
    "tamanio": "Pequeño",
    "descripcion_historia": "Luna fue encontrada en una caja abandonada...",
    "publicado_por": "Rescate Felino",
    "contacto_rescatista": "@rescatefelino",
    "foto_principal": "https://example.com/luna.jpg"
  }'
```

### Cambiar estado:
```bash
curl -X PATCH http://localhost:3000/api/animals/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{"estado": "Adoptado"}'
```

### Eliminar:
```bash
curl -X DELETE http://localhost:3000/api/animals/1 \
  -H "Authorization: Bearer <tu_token>"
```

---

## Estados válidos de un animal

```
Disponible  →  En proceso  →  Adoptado
     ↓              ↓
  En transito  ←───┘
```

| Estado | Significado | Visible público |
|--------|-------------|-----------------|
| Disponible | Buscando adoptante | Sí |
| En proceso | Evaluando candidatos | Sí |
| Adoptado | Ya tiene hogar | No |
| En transito | En hogar temporal | Sí |

---

## Estructura actual del proyecto

```
adopcion-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── animals.controller.js    ← NUEVO
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── validators.js            ← NUEVO
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── animals.routes.js        ← NUEVO
│   ├── services/
│   └── app.js
├── prisma/
├── docs/
│   ├── FASE_1_SETUP_INICIAL.md
│   ├── FASE_2_AUTENTICACION.md
│   └── FASE_3_CRUD_ANIMALES.md      ← NUEVO
└── ...
```

---

## Resumen de la conversación

1. Creamos el archivo de validaciones con express-validator
2. Creamos el controller con las 6 funciones CRUD
3. Creamos las rutas separando públicas de protegidas
4. Implementamos `optionalAuth` para diferenciar público de admin
5. Conectamos las rutas en app.js
6. Probamos todos los endpoints correctamente

---

## Próximos pasos (Fase 4)

En la siguiente fase implementaremos la **subida de imágenes a Cloudinary**:
- Configurar Cloudinary
- POST /api/upload para subir imágenes
- Validar formato y tamaño de archivos

---

## Glosario de términos nuevos

| Término | Significado |
|---------|-------------|
| CRUD | Create, Read, Update, Delete |
| Query string | Parámetros en la URL después del `?` |
| Route params | Parámetros en la URL con `:` (ej: `:id`) |
| Foreign key | Relación entre tablas en la BD |
| Validador | Función que verifica si un dato es válido |
| Sanitizar | Limpiar datos (quitar espacios, etc.) |
