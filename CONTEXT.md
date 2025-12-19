# CONTEXT.md - Guía de Aprendizaje y Contexto del Proyecto

## Sobre Este Documento

Este documento explica el **por qué** de cada decisión técnica. No es solo una lista de qué hacer, sino una guía para que entiendas los fundamentos mientras construís.

---

## ¿Qué es un Backend?

Imaginá un restaurante:
- El **Frontend** es el salón: lo que el cliente ve, el menú, las mesas
- El **Backend** es la cocina: donde se procesa todo, se guardan los ingredientes, se preparan los platos

El cliente (usuario) no ve la cocina, solo interactúa con el mozo (el navegador) que lleva pedidos a la cocina y trae los platos.

**Tu backend va a:**
1. Recibir pedidos (requests HTTP)
2. Procesar esos pedidos (lógica de negocio)
3. Guardar/buscar datos (base de datos)
4. Devolver respuestas (JSON)

---

## ¿Por qué Node.js?

**Node.js** permite ejecutar JavaScript fuera del navegador, en un servidor.

**Ventajas para vos:**
- Un solo lenguaje para todo (si mañana tocás frontend, ya sabés JS)
- Comunidad gigante, mucha documentación
- Muy usado en startups y empresas tech argentinas
- Perfecto para APIs REST (lo que vas a hacer)

**El modelo de Node:**
Node usa un "event loop" - no bloquea mientras espera respuestas de la base de datos o de servicios externos. Esto lo hace muy eficiente para APIs.

---

## ¿Por qué Express.js?

**Express** es un framework minimalista para Node. "Minimalista" significa que te da solo lo esencial y vos agregás lo que necesitás.

**¿Por qué no algo más completo como NestJS?**
- Express te obliga a entender cada pieza
- NestJS hace "magia" que oculta cómo funcionan las cosas
- Para aprender, menos magia = más aprendizaje

**Conceptos clave de Express:**

### 1. Rutas
```javascript
app.get('/api/animals', (req, res) => {
  // Esta función se ejecuta cuando alguien hace GET a /api/animals
});
```

### 2. Middleware
Son funciones que se ejecutan ANTES de tu ruta. Como guardias de seguridad.
```javascript
// Este middleware verifica el token en CADA request a rutas protegidas
app.use('/api/admin', verificarToken);
```

### 3. Request y Response
- `req` (request): Lo que te manda el cliente (datos, headers, parámetros)
- `res` (response): Lo que vos le devolvés (JSON, status codes)

---

## ¿Por qué PostgreSQL?

Es una base de datos **relacional** (tablas con filas y columnas, relacionadas entre sí).

**¿Por qué no MongoDB (NoSQL)?**
- Tu datos tienen relaciones claras: Animal pertenece a Admin, Solicitud pertenece a Animal
- Las bases relacionales garantizan integridad (no podés tener una solicitud para un animal que no existe)
- PostgreSQL es gratis, robusto y muy usado en producción

**¿Por qué Supabase?**
- Te da PostgreSQL gratis en la nube
- Tiene panel visual para ver tus datos
- Fácil de configurar

---

## ¿Por qué Prisma?

**Prisma** es un ORM (Object-Relational Mapping). Traduce entre tu código JavaScript y la base de datos.

**Sin Prisma:**
```javascript
const result = await db.query(
  'SELECT * FROM animals WHERE estado = $1',
  ['Disponible']
);
```

**Con Prisma:**
```javascript
const animals = await prisma.animal.findMany({
  where: { estado: 'Disponible' }
});
```

**Ventajas:**
- Código más legible
- Autocompletado (tu editor te sugiere campos)
- Migraciones automáticas (cambios en la BD controlados)
- Previene SQL injection automáticamente

---

## ¿Qué es JWT y por qué lo usamos?

**JWT (JSON Web Token)** es la forma moderna de manejar autenticación en APIs.

**El flujo:**
1. Usuario manda email + contraseña a `/api/auth/login`
2. Si son correctos, el servidor genera un TOKEN (string largo cifrado)
3. El servidor devuelve ese token al usuario
4. Para cada request siguiente, el usuario manda el token en el header
5. El servidor verifica que el token sea válido

**¿Por qué no sesiones tradicionales?**
- Las APIs REST son "stateless" (sin estado) - el servidor no recuerda quién sos
- JWT permite que el servidor verifique tu identidad sin guardar nada
- Escala mejor (múltiples servidores pueden verificar el mismo token)

**Anatomía de un JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.signature
|_________HEADER_________|____PAYLOAD____|__FIRMA__|
```

- **Header:** Tipo de token y algoritmo
- **Payload:** Datos (ej: id del usuario, fecha de expiración)
- **Firma:** Garantiza que nadie modificó el token

---

## ¿Qué es bcrypt y por qué lo usamos?

**NUNCA** se guardan contraseñas en texto plano. Si alguien accede a tu BD, tendría todas las contraseñas.

**bcrypt** es un algoritmo de hashing:
- Convierte "password123" en "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
- Es IRREVERSIBLE - no se puede volver atrás
- El mismo texto genera hashes diferentes (por el "salt")

**¿Cómo verificás el login entonces?**
```javascript
// Al hacer login:
const esValida = await bcrypt.compare(passwordIngresada, hashGuardado);
// bcrypt sabe comparar aunque los hashes sean diferentes
```

---

## ¿Qué es CORS y por qué importa?

**CORS** (Cross-Origin Resource Sharing) es una medida de seguridad de los navegadores.

**El problema:**
- Tu frontend corre en `http://localhost:5173` (Vite)
- Tu backend corre en `http://localhost:3000` (Express)
- Son "orígenes diferentes" → el navegador bloquea la comunicación

**La solución:**
Tu backend debe decirle al navegador "está bien, dejá que este frontend me hable":
```javascript
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

---

## ¿Qué es Cloudinary y por qué no guardamos fotos en nuestra BD?

**Las imágenes son archivos binarios pesados.** Guardarlas en PostgreSQL:
- Hace la BD lenta
- Complica los backups
- No es para lo que están diseñadas las BD relacionales

**Cloudinary** es un servicio de almacenamiento de imágenes:
- Subís la imagen → te devuelve una URL
- Esa URL la guardás en tu BD (es solo texto)
- Cloudinary se encarga de servir la imagen rápido (CDN)
- Gratis hasta 25GB

---

## Estructura de Carpetas Explicada

```
adopcion-api/
├── src/                    # Todo tu código va acá
│   ├── config/             # Configuraciones (BD, Cloudinary, Email)
│   │   └── ¿Por qué separado? Para cambiar configs sin tocar lógica
│   │
│   ├── middlewares/        # Funciones que se ejecutan ANTES de las rutas
│   │   └── ¿Por qué separado? Se reutilizan en múltiples rutas
│   │
│   ├── routes/             # Definición de endpoints (URLs)
│   │   └── ¿Por qué separado? Organiza qué URLs existen
│   │
│   ├── controllers/        # Lógica de cada endpoint
│   │   └── ¿Por qué separado? Separa "qué URL" de "qué hace"
│   │
│   ├── services/           # Lógica de negocio compleja
│   │   └── ¿Por qué separado? Reutilizable, más fácil de testear
│   │
│   └── app.js              # Punto de entrada, une todo
│
├── prisma/
│   └── schema.prisma       # Definición de tu BD
│
└── .env                    # Variables secretas (NUNCA al repo de Git)
```

**El principio:** Cada archivo tiene UNA responsabilidad. Si algo cambia, sabés dónde buscarlo.

---

## Flujo de una Request

Cuando alguien hace `GET /api/animals`:

```
[Cliente/Frontend]
       ↓
    Request HTTP: GET /api/animals
       ↓
[Express recibe]
       ↓
[Middleware CORS] → ¿Tiene permiso? → Sí, continúa
       ↓
[Middleware Auth] → Esta ruta es pública, continúa
       ↓
[Router] → Ah, es /api/animals, va a animals.routes.js
       ↓
[Controller] → animals.controller.js → función getAnimals()
       ↓
[Prisma] → Consulta a PostgreSQL
       ↓
[PostgreSQL] → Devuelve datos
       ↓
[Controller] → Arma el JSON de respuesta
       ↓
[Express] → Envía response al cliente
       ↓
[Cliente recibe JSON]
```

---

## Códigos de Estado HTTP

Tu API va a devolver estos códigos:

| Código | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| **200** | OK | Todo salió bien |
| **201** | Created | Se creó algo nuevo (POST exitoso) |
| **400** | Bad Request | El cliente mandó datos incorrectos |
| **401** | Unauthorized | No está autenticado (sin token o token inválido) |
| **403** | Forbidden | Autenticado pero sin permiso |
| **404** | Not Found | El recurso no existe |
| **500** | Server Error | Algo falló en el servidor (tu culpa como dev) |

---

## Variables de Entorno - ¿Por qué?

**Nunca pongas secretos en el código:**
```javascript
// ❌ MAL - Si subís esto a GitHub, todos ven tu contraseña
const dbPassword = "mi_password_123";

// ✅ BIEN - El valor real está en un archivo .env que NO se sube
const dbPassword = process.env.DB_PASSWORD;
```

**El archivo `.env`:**
```
DB_PASSWORD=mi_password_123
JWT_SECRET=otro_secreto
```

**El archivo `.env.example`** (este SÍ se sube):
```
DB_PASSWORD=tu_password_aca
JWT_SECRET=tu_secreto_aca
```

---

## Validación - ¿Por qué en Backend si ya valido en Frontend?

**NUNCA confíes en el frontend.**

Cualquiera puede:
- Abrir las DevTools y modificar el JavaScript
- Usar Postman para mandar requests directo a tu API
- Saltear todas las validaciones del frontend

**El frontend valida para mejor UX** (feedback rápido al usuario).
**El backend valida por seguridad** (es la última barrera).

---

## Manejo de Errores

Siempre devolvé errores en formato consistente:

```javascript
// ✅ Formato consistente
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La edad debe ser mayor o igual a 18",
    "field": "edad"
  }
}

// ❌ Inconsistente (a veces string, a veces objeto)
"Error en el servidor"
```

---

## Async/Await - El patrón que vas a usar siempre

JavaScript es asíncrono. Cuando pedís datos a la BD, no se queda esperando bloqueado.

```javascript
// ❌ Esto NO espera - animals será undefined
const animals = prisma.animal.findMany();
console.log(animals); // Promise { <pending> }

// ✅ Esto SÍ espera
const animals = await prisma.animal.findMany();
console.log(animals); // [{ id: 1, nombre: 'Firulais' }, ...]
```

**Regla:** Si una función devuelve una Promise (operaciones de BD, requests HTTP, etc.), usá `await`.

---

## Próximos Pasos

1. **Verificá Node.js:** `node --version` en terminal
2. **Si no lo tenés:** Descargá de https://nodejs.org (versión LTS)
3. **Instalá un editor:** VS Code recomendado
4. **Creá cuenta en Supabase:** https://supabase.com
5. **Creá cuenta en Cloudinary:** https://cloudinary.com

Cuando tengas todo listo, pasamos a Claude Code para empezar a construir.

---

## Glosario Rápido

| Término | Significado |
|---------|-------------|
| **API** | Interfaz que permite que programas se comuniquen |
| **REST** | Estilo de diseño de APIs usando HTTP |
| **Endpoint** | Una URL específica de tu API |
| **Request** | Pedido del cliente al servidor |
| **Response** | Respuesta del servidor al cliente |
| **JSON** | Formato de texto para intercambiar datos |
| **Token** | String que prueba tu identidad |
| **Hash** | Texto cifrado irreversible |
| **Middleware** | Función que intercepta requests |
| **ORM** | Traductor entre código y base de datos |
| **Migration** | Cambio controlado en estructura de BD |
| **Seed** | Datos iniciales para la BD |
| **CRUD** | Create, Read, Update, Delete |
