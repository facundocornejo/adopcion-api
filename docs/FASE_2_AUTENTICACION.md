# FASE 2: Autenticación - Explicación Completa

## Resumen de la Fase

En esta fase implementamos el sistema de autenticación usando JWT (JSON Web Tokens). Esto permite que los administradores inicien sesión y accedan a las rutas protegidas de la API.

**Fecha:** 19 de Diciembre 2025
**Estado:** Completada

---

## ¿Qué se hizo?

### Archivos creados:

```
src/
├── middlewares/
│   └── auth.middleware.js    # Verificador de tokens JWT
├── controllers/
│   └── auth.controller.js    # Lógica de login/logout
└── routes/
    └── auth.routes.js        # Definición de endpoints
```

### Archivos modificados:

```
src/app.js                    # Se conectaron las rutas de auth
```

---

## Endpoints implementados

| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| POST | /api/auth/login | No | Iniciar sesión |
| POST | /api/auth/logout | Sí | Cerrar sesión |
| GET | /api/auth/me | Sí | Obtener datos del admin autenticado |

---

## Explicación de cada archivo

### 1. `auth.middleware.js` - El guardián de las rutas

**¿Qué hace?**
Es una función que se ejecuta ANTES de que la request llegue al controller. Verifica si el usuario tiene un token válido.

**¿Cómo funciona?**

```javascript
// 1. Obtiene el header "Authorization"
const authHeader = req.headers['authorization'];

// 2. Extrae el token (formato: "Bearer eyJhbG...")
const token = authHeader && authHeader.split(' ')[1];

// 3. Si no hay token → Error 401
if (!token) {
  return res.status(401).json({ error: 'NO_TOKEN' });
}

// 4. Verifica que el token sea válido y no esté expirado
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 5. Agrega los datos del admin al request
req.admin = decoded;

// 6. Continúa al siguiente paso
next();
```

**El flujo visual:**
```
Request → [auth.middleware] → ¿Token válido?
                                   ↓
                        Sí → Controller → Response
                        No → Error 401
```

**¿Por qué `next()`?**
En Express, los middlewares son una cadena. Llamar `next()` le dice a Express "todo bien, seguí con el siguiente paso". Si no llamás `next()`, la request se queda colgada.

---

### 2. `auth.controller.js` - La lógica de autenticación

**Función `login`:**

```javascript
// 1. Recibe email y password del body
const { email, password } = req.body;

// 2. Busca el admin en la base de datos
const admin = await prisma.administrador.findUnique({
  where: { email }
});

// 3. Compara la contraseña con bcrypt
const passwordValido = await bcrypt.compare(password, admin.password_hash);

// 4. Si todo está bien, genera un token JWT
const token = jwt.sign(
  { id: admin.id, email: admin.email, username: admin.username },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// 5. Devuelve el token y datos del admin
res.json({ success: true, data: { token, admin } });
```

**¿Qué es `jwt.sign()`?**
Crea un token JWT con los datos que le pasás. El token contiene:
- **Payload:** Los datos (id, email, username)
- **Firma:** Una firma criptográfica usando JWT_SECRET

**¿Qué es `bcrypt.compare()`?**
Compara una contraseña en texto plano con su versión hasheada. Devuelve `true` si coinciden, `false` si no.

**Función `logout`:**
En JWT stateless, el logout se maneja en el frontend eliminando el token del storage. El endpoint existe por conveniencia.

**Función `me`:**
Devuelve los datos del admin autenticado. Usa `req.admin` que fue agregado por el middleware.

---

### 3. `auth.routes.js` - Definición de rutas

```javascript
const router = express.Router();

// Ruta pública (cualquiera puede acceder)
router.post('/login', login);

// Rutas protegidas (requieren token)
router.post('/logout', verificarToken, logout);
router.get('/me', verificarToken, me);
```

**¿Qué hace `router.post('/login', login)`?**
- Cuando alguien hace POST a `/api/auth/login`
- Ejecuta la función `login` del controller

**¿Qué hace `router.get('/me', verificarToken, me)`?**
- Cuando alguien hace GET a `/api/auth/me`
- PRIMERO ejecuta `verificarToken` (middleware)
- Si el token es válido, DESPUÉS ejecuta `me` (controller)

---

## Flujo completo de autenticación

### Login exitoso:

```
1. Frontend envía: POST /api/auth/login
   Body: { email: "admin@adopcion.com", password: "admin123" }
                    ↓
2. Controller busca admin en BD
                    ↓
3. bcrypt.compare() verifica contraseña
                    ↓
4. jwt.sign() genera token
                    ↓
5. Response: { token: "eyJhbG...", admin: {...} }
                    ↓
6. Frontend guarda el token en localStorage
```

### Request protegida:

```
1. Frontend envía: GET /api/auth/me
   Header: Authorization: Bearer eyJhbG...
                    ↓
2. auth.middleware extrae y verifica token
                    ↓
3. Si es válido → agrega req.admin y llama next()
   Si no → responde 401
                    ↓
4. Controller usa req.admin para responder
                    ↓
5. Response: { admin: { id, username, email } }
```

---

## Conceptos clave explicados

### JWT (JSON Web Token)

Un token JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.signature
|_________HEADER___________|__PAYLOAD__|__FIRMA__|
```

- **Header:** Algoritmo y tipo de token
- **Payload:** Los datos que guardás (id, email, etc.)
- **Firma:** Garantiza que nadie modificó el token

**Importante:** El payload NO está encriptado, solo codificado en Base64. Cualquiera puede leerlo. La firma solo garantiza que no fue alterado.

### ¿Por qué no guardar sesiones en el servidor?

**Con sesiones (tradicional):**
```
Login → Servidor guarda sesión en memoria → Devuelve ID de sesión
Request → Servidor busca sesión por ID → Válida
```
**Problema:** Si tenés múltiples servidores, la sesión solo existe en uno.

**Con JWT (stateless):**
```
Login → Servidor genera token firmado → Devuelve token
Request → Servidor verifica firma → Válida
```
**Ventaja:** Cualquier servidor puede verificar el token porque tiene el SECRET.

### bcrypt - Hashing de contraseñas

**¿Por qué no guardar contraseñas en texto plano?**
Si alguien accede a tu BD, tiene todas las contraseñas.

**¿Qué hace bcrypt?**
Convierte "admin123" en algo como:
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**¿Cómo verifica después?**
`bcrypt.compare("admin123", hash)` sabe comparar aunque el hash sea diferente cada vez (por el salt).

---

## Probando los endpoints

### Login correcto:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@adopcion.com","password":"admin123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@adopcion.com"
    }
  }
}
```

### Login incorrecto:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@adopcion.com","password":"wrongpassword"}'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email o contraseña incorrectos"
  }
}
```

### Ruta protegida sin token:
```bash
curl http://localhost:3000/api/auth/me
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "Token de autenticación no proporcionado"
  }
}
```

### Ruta protegida con token:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbG..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@adopcion.com"
    }
  }
}
```

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
│   │   └── auth.controller.js    ← NUEVO
│   ├── middlewares/
│   │   └── auth.middleware.js    ← NUEVO
│   ├── routes/
│   │   └── auth.routes.js        ← NUEVO
│   ├── services/
│   └── app.js                    ← MODIFICADO
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── docs/
│   ├── FASE_1_SETUP_INICIAL.md
│   └── FASE_2_AUTENTICACION.md   ← NUEVO
└── ...
```

---

## Resumen de la conversación

1. Creamos el middleware `verificarToken` que protege rutas
2. Creamos el controller con las funciones `login`, `logout` y `me`
3. Creamos el archivo de rutas conectando endpoints con controllers
4. Modificamos `app.js` para incluir las rutas de auth
5. Probamos todos los endpoints y funcionan correctamente

---

## Próximos pasos (Fase 3)

En la siguiente fase implementaremos el **CRUD de Animales**:
- GET /api/animals (público)
- GET /api/animals/:id (público)
- POST /api/animals (protegido)
- PUT /api/animals/:id (protegido)
- PATCH /api/animals/:id/status (protegido)
- DELETE /api/animals/:id (protegido)

---

## Glosario de términos nuevos

| Término | Significado |
|---------|-------------|
| JWT | JSON Web Token - formato de token para autenticación |
| Stateless | Sin estado - el servidor no guarda información de sesiones |
| Payload | Los datos contenidos dentro del token |
| Hash | Resultado de aplicar un algoritmo criptográfico |
| Salt | Valor aleatorio agregado antes de hashear |
| Bearer | Tipo de autenticación donde se envía el token en el header |
| Middleware | Función que intercepta la request antes del controller |
