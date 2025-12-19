# STANDARDS.md - Estándares y Buenas Prácticas

## Objetivo
Este documento define los estándares que DEBEN aplicarse en todo el código del proyecto.
Claude Code debe seguir estas reglas en cada archivo que cree o modifique.

---

## 1. SEGURIDAD (OWASP)

### 1.1 Autenticación (OWASP A07:2021)
```javascript
// ✅ CORRECTO: bcrypt con costo >= 10
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);

// ❌ INCORRECTO: costo bajo
const hash = await bcrypt.hash(password, 5);
```

### 1.2 Inyección SQL (OWASP A03:2021)
```javascript
// ✅ CORRECTO: Usar Prisma (queries parametrizadas automáticas)
const animal = await prisma.animal.findUnique({
  where: { id: parseInt(req.params.id) }
});

// ❌ INCORRECTO: Concatenar strings en queries
const query = `SELECT * FROM animals WHERE id = ${req.params.id}`;
```

### 1.3 XSS - Cross Site Scripting (OWASP A03:2021)
```javascript
// ✅ CORRECTO: Sanitizar inputs antes de guardar
const sanitizedInput = validator.escape(req.body.nombre);

// ❌ INCORRECTO: Guardar input directo
const nombre = req.body.nombre;
```

### 1.4 JWT Seguro (RFC 7519)
```javascript
// ✅ CORRECTO: Token con expiración y secret fuerte
const token = jwt.sign(
  { id: admin.id },           // Payload mínimo, sin datos sensibles
  process.env.JWT_SECRET,     // Secret desde variable de entorno
  { expiresIn: '24h' }        // Expiración obligatoria
);

// ❌ INCORRECTO: Sin expiración o secret hardcodeado
const token = jwt.sign({ id: admin.id }, 'secreto123');
```

### 1.5 Variables de Entorno
```javascript
// ✅ CORRECTO: Secretos en .env
const secret = process.env.JWT_SECRET;

// ❌ INCORRECTO: Secretos en código
const secret = 'mi_super_secreto';
```

### 1.6 Validación de Inputs
- SIEMPRE validar en backend, nunca confiar en frontend
- Validar tipo, longitud, formato
- Usar express-validator para validaciones

```javascript
// ✅ CORRECTO: Validación explícita
body('email').isEmail().normalizeEmail(),
body('edad').isInt({ min: 18, max: 120 }),
body('nombre').trim().isLength({ min: 2, max: 100 }).escape()
```

---

## 2. ESTILO DE CÓDIGO (Airbnb Style Guide)

### 2.1 Variables y Funciones
```javascript
// ✅ CORRECTO: camelCase para variables y funciones
const animalId = req.params.id;
const getAnimalById = async (id) => { ... };

// ❌ INCORRECTO: snake_case o PascalCase para variables
const animal_id = req.params.id;
const GetAnimalById = async (id) => { ... };
```

### 2.2 Constantes
```javascript
// ✅ CORRECTO: UPPER_SNAKE_CASE para constantes globales
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

// ❌ INCORRECTO
const maxFileSize = 5 * 1024 * 1024;
```

### 2.3 Clases y Modelos
```javascript
// ✅ CORRECTO: PascalCase para clases
class AnimalController { ... }

// ❌ INCORRECTO
class animalController { ... }
```

### 2.4 Archivos
```
✅ CORRECTO: kebab-case o camelCase
animal.controller.js
animalController.js
adoption-request.routes.js

❌ INCORRECTO
Animal_Controller.js
AnimalController.js (para archivos que no son clases)
```

### 2.5 Comillas y Punto y Coma
```javascript
// ✅ CORRECTO: Comillas simples, punto y coma
const mensaje = 'Hola mundo';

// ❌ INCORRECTO (según Airbnb)
const mensaje = "Hola mundo"
```

### 2.6 Arrow Functions
```javascript
// ✅ CORRECTO: Arrow functions para callbacks
const animals = await prisma.animal.findMany();
animals.map((animal) => animal.nombre);

// ✅ CORRECTO: Arrow functions para funciones cortas
const isAdult = (edad) => edad >= 18;
```

### 2.7 Async/Await
```javascript
// ✅ CORRECTO: async/await con try-catch
const getAnimals = async (req, res) => {
  try {
    const animals = await prisma.animal.findMany();
    res.json({ success: true, data: animals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ❌ INCORRECTO: Promesas sin manejo de error
const getAnimals = (req, res) => {
  prisma.animal.findMany().then(animals => res.json(animals));
};
```

---

## 3. API REST (RESTful Design)

### 3.1 Verbos HTTP
| Acción | Verbo | Ejemplo |
|--------|-------|---------|
| Obtener lista | GET | `GET /api/animals` |
| Obtener uno | GET | `GET /api/animals/:id` |
| Crear | POST | `POST /api/animals` |
| Actualizar completo | PUT | `PUT /api/animals/:id` |
| Actualizar parcial | PATCH | `PATCH /api/animals/:id` |
| Eliminar | DELETE | `DELETE /api/animals/:id` |

### 3.2 Códigos de Estado HTTP (RFC 7231)
```javascript
// ✅ CORRECTO: Códigos apropiados
res.status(200).json({ ... });  // OK
res.status(201).json({ ... });  // Created (POST exitoso)
res.status(400).json({ ... });  // Bad Request (validación falló)
res.status(401).json({ ... });  // Unauthorized (sin token)
res.status(403).json({ ... });  // Forbidden (sin permisos)
res.status(404).json({ ... });  // Not Found
res.status(500).json({ ... });  // Server Error

// ❌ INCORRECTO: 200 para todo
res.status(200).json({ error: 'No encontrado' });
```

### 3.3 Formato de Respuestas (Consistente)
```javascript
// ✅ CORRECTO: Estructura consistente
// Éxito
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción del error",
    "details": [...] // opcional
  }
}

// ❌ INCORRECTO: Estructuras inconsistentes
{ "animals": [...] }
{ "error": "algo falló" }
"Error en el servidor"
```

### 3.4 URLs (Sustantivos, Plural)
```
✅ CORRECTO
GET  /api/animals
GET  /api/animals/:id
POST /api/adoption-requests

❌ INCORRECTO (verbos, singular)
GET  /api/getAnimals
GET  /api/animal/:id
POST /api/createAdoptionRequest
```

---

## 4. BASE DE DATOS

### 4.1 Naming Conventions (PostgreSQL)
```sql
-- ✅ CORRECTO: snake_case para todo
nombre_completo
fecha_creacion
animal_id

-- ❌ INCORRECTO: camelCase o PascalCase
nombreCompleto
FechaCreacion
AnimalId
```

### 4.2 Nombres de Tablas (Singular, snake_case)
```sql
-- ✅ CORRECTO
administrador
animal
solicitud_adopcion

-- ❌ INCORRECTO
Administradores
Animals
SolicitudesAdopcion
```

### 4.3 Claves Foráneas
```sql
-- ✅ CORRECTO: tabla_id
animal_id
administrador_id

-- ❌ INCORRECTO
animalId
id_animal
fk_animal
```

---

## 5. GIT (Conventional Commits)

### 5.1 Formato de Commits
```
<tipo>: <descripción corta>

Tipos permitidos:
- feat:     Nueva funcionalidad
- fix:      Corrección de bug
- docs:     Documentación
- style:    Formato (no afecta lógica)
- refactor: Refactorización
- test:     Tests
- chore:    Tareas de mantenimiento
```

### 5.2 Ejemplos
```bash
# ✅ CORRECTO
git commit -m "feat: implementar login con JWT"
git commit -m "fix: corregir validación de edad en formulario"
git commit -m "docs: agregar documentación de API"
git commit -m "refactor: separar lógica de auth en service"

# ❌ INCORRECTO
git commit -m "cambios"
git commit -m "arreglé cosas"
git commit -m "WIP"
git commit -m "asdasd"
```

### 5.3 Archivos a Ignorar (.gitignore)
```
node_modules/
.env
*.log
.DS_Store
dist/
coverage/
```

---

## 6. DOCUMENTACIÓN

### 6.1 Comentarios en Código
```javascript
// ✅ CORRECTO: Comentar el POR QUÉ, no el QUÉ
// Usamos bcrypt con costo 10 porque es el balance entre seguridad y performance
const saltRounds = 10;

// ❌ INCORRECTO: Comentar lo obvio
// Incrementamos i en 1
i++;
```

### 6.2 JSDoc para Funciones Complejas
```javascript
/**
 * Crea un nuevo animal en la base de datos
 * @param {Object} animalData - Datos del animal
 * @param {string} animalData.nombre - Nombre del animal
 * @param {string} animalData.especie - 'Perro' o 'Gato'
 * @returns {Promise<Object>} Animal creado
 * @throws {ValidationError} Si los datos son inválidos
 */
const createAnimal = async (animalData) => {
  // ...
};
```

---

## 7. ESTRUCTURA DE CARPETAS

```
src/
├── config/         # Configuraciones (DB, Cloudinary, Email)
├── controllers/    # Lógica de endpoints (reciben req, devuelven res)
├── middlewares/    # Funciones intermedias (auth, validación, errores)
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio reutilizable
├── utils/          # Funciones utilitarias
└── app.js          # Entrada principal
```

**Principio:** Cada archivo tiene UNA responsabilidad (Single Responsibility Principle).

---

## 8. MANEJO DE ERRORES

### 8.1 Centralizado
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Error interno del servidor'
    }
  });
};
```

### 8.2 Errores Personalizados
```javascript
// ✅ CORRECTO: Errores descriptivos
throw new Error('El animal no fue encontrado');

// ❌ INCORRECTO: Errores genéricos
throw new Error('Error');
```

---

## RESUMEN: Reglas de Oro

1. **Seguridad:** Nunca confiar en inputs del usuario
2. **Consistencia:** Mismo estilo en todo el código
3. **Claridad:** Código legible > código corto
4. **Separación:** Cada archivo/función hace UNA cosa
5. **Documentación:** Comentar el POR QUÉ, no el QUÉ
6. **Git:** Commits pequeños y descriptivos
7. **Errores:** Manejar TODOS los casos de error
8. **Variables:** Nunca hardcodear secretos
