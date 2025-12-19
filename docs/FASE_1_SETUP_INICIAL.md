# FASE 1: Setup Inicial - Explicación Completa

## Resumen de la Fase

En esta fase configuramos toda la base del proyecto. Es como preparar los cimientos de una casa: sin esto, no podemos construir nada encima.

**Fecha:** 19 de Diciembre 2025
**Estado:** Completada

---

## ¿Qué se hizo?

### 1. Estructura de Carpetas

```
adopcion-api/
├── src/                      # Código fuente
│   ├── config/               # Configuraciones
│   │   ├── database.js       # Conexión a PostgreSQL via Prisma
│   │   ├── cloudinary.js     # Configuración de Cloudinary
│   │   └── email.js          # Configuración de Nodemailer
│   ├── controllers/          # (vacío por ahora) Lógica de endpoints
│   ├── middlewares/          # (vacío por ahora) Funciones intermedias
│   ├── routes/               # (vacío por ahora) Definición de rutas
│   ├── services/             # (vacío por ahora) Lógica de negocio
│   └── app.js                # Punto de entrada principal
├── prisma/
│   ├── schema.prisma         # Definición de la base de datos
│   └── seed.js               # Datos iniciales (admin)
├── .env                      # Variables de entorno (NO SUBIR A GIT)
├── .env.example              # Ejemplo de variables (SÍ se sube a Git)
├── .gitignore                # Archivos que Git debe ignorar
└── package.json              # Dependencias del proyecto
```

---

## Explicación de Cada Archivo

### `package.json` - El DNI del proyecto

**¿Qué es?**
Es el archivo que describe tu proyecto Node.js. Contiene:
- Nombre y versión del proyecto
- Scripts para ejecutar comandos
- Lista de dependencias

**Secciones importantes:**

```json
"scripts": {
  "start": "node src/app.js",       // Ejecuta en producción
  "dev": "nodemon src/app.js",      // Ejecuta en desarrollo (auto-reinicia)
  "db:migrate": "npx prisma migrate dev",  // Aplica cambios a la BD
  "db:push": "npx prisma db push",         // Push directo (sin migración)
  "db:seed": "node prisma/seed.js",        // Crea datos iniciales
  "db:studio": "npx prisma studio"         // Abre panel visual de BD
}
```

**Dependencias instaladas:**
| Paquete | Para qué sirve |
|---------|----------------|
| express | Framework web para crear la API |
| @prisma/client | Cliente para comunicarse con la BD |
| bcrypt | Hashear (encriptar) contraseñas |
| jsonwebtoken | Crear y verificar tokens JWT |
| cors | Permitir requests desde el frontend |
| dotenv | Cargar variables de entorno |
| express-validator | Validar datos de entrada |
| cloudinary | Subir imágenes a la nube |
| multer | Procesar archivos subidos |
| nodemailer | Enviar emails |

---

### `.env` y `.env.example` - Variables de entorno

**¿Por qué existen?**
Nunca ponés contraseñas o datos sensibles directo en el código. Si lo hacés y subís a GitHub, cualquiera puede ver tus credenciales.

**`.env`** - Contiene los valores REALES. NUNCA se sube a Git.
**`.env.example`** - Plantilla con valores falsos. SÍ se sube a Git para que otros sepan qué configurar.

**Variables que necesitás configurar:**

| Variable | Dónde conseguirla |
|----------|-------------------|
| DATABASE_URL | Panel de Supabase → Settings → Database → Connection string |
| JWT_SECRET | Inventá un string largo y aleatorio |
| CLOUDINARY_* | Panel de Cloudinary → Dashboard |
| SMTP_* | Gmail → Configuración → Contraseñas de aplicación |

---

### `.gitignore` - Lo que Git ignora

**¿Por qué importa?**
Evita subir archivos que no deberían estar en el repositorio:
- `node_modules/` - Muy pesado, se regenera con `npm install`
- `.env` - Contiene secretos
- Archivos del sistema operativo

---

### `prisma/schema.prisma` - La estructura de tu base de datos

**¿Qué es Prisma?**
Es un ORM (Object-Relational Mapping). Traduce entre JavaScript y PostgreSQL.

**Sin Prisma tendrías que escribir:**
```sql
SELECT * FROM animals WHERE estado = 'Disponible';
```

**Con Prisma escribís:**
```javascript
const animals = await prisma.animal.findMany({
  where: { estado: 'Disponible' }
});
```

**Las 3 tablas definidas:**

1. **administrador** - Los usuarios admin del sistema
   - id, username, email, password_hash, fechas

2. **animal** - Los animales publicados
   - 19 campos: nombre, especie, fotos, estados, etc.
   - Tiene relación con administrador (quién lo publicó)

3. **solicitud_adopcion** - Formularios de adopción
   - 17 campos del formulario
   - Tiene relación con animal (para qué animal es)

**Decoradores importantes en el schema:**
```prisma
@id                    // Es la clave primaria
@default(autoincrement())  // Se genera automáticamente
@unique                // No puede repetirse
@db.VarChar(100)       // Tipo VARCHAR de 100 caracteres
@db.Text               // Texto largo
@default(now())        // Fecha actual automática
@updatedAt             // Se actualiza automáticamente
@relation              // Define relación con otra tabla
@@map("nombre_tabla")  // Nombre real en PostgreSQL
```

---

### `prisma/seed.js` - Datos iniciales

**¿Para qué sirve?**
Crea el primer usuario administrador en la base de datos.

**¿Qué hace?**
1. Hashea la contraseña "admin123" con bcrypt
2. Crea un admin con email "admin@adopcion.com"
3. Usa `upsert` - si ya existe, no hace nada

**Credenciales iniciales:**
```
Email: admin@adopcion.com
Password: admin123
```
⚠️ **IMPORTANTE:** Cambiar estas credenciales en producción.

---

### `src/app.js` - El corazón de la aplicación

**¿Qué hace paso a paso?**

```javascript
// 1. Carga variables de entorno PRIMERO
require('dotenv').config();

// 2. Importa Express y otros
const express = require('express');
const cors = require('cors');

// 3. Crea la "aplicación"
const app = express();

// 4. Configura MIDDLEWARES (se ejecutan en CADA request)
app.use(cors(...));      // Permite requests del frontend
app.use(express.json()); // Parsea JSON del body

// 5. Define RUTAS
app.get('/', ...);           // Ruta de prueba
app.get('/api/health', ...); // Verificar estado

// 6. Manejo de ERRORES
app.use((req, res) => { ... });     // 404 - ruta no existe
app.use((err, req, res, next) => { ... }); // Errores generales

// 7. Inicia el servidor
app.listen(PORT, () => { ... });
```

**Middlewares - ¿Qué son?**
Son funciones que se ejecutan ANTES de que llegue la request a tu ruta.

```
Request → [CORS] → [JSON Parser] → [Tu Ruta] → Response
```

Cada middleware puede:
- Modificar la request
- Responder directamente (cortando la cadena)
- Pasar al siguiente con `next()`

---

### `src/config/database.js` - Conexión a la BD

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

**¿Por qué una sola instancia?**
Cada `PrismaClient` abre conexiones a la BD. Si creás muchos, agotás las conexiones disponibles. Por eso creamos UNO y lo exportamos.

---

### `src/config/cloudinary.js` - Configuración de imágenes

Configura Cloudinary con las credenciales del `.env`. Cloudinary es donde se guardarán las fotos de los animales.

---

### `src/config/email.js` - Configuración de emails

Configura Nodemailer para enviar emails. Se usará para notificar al admin cuando lleguen solicitudes de adopción.

---

## Comandos que vas a necesitar

```bash
# Instalar dependencias (ya hecho)
npm install

# Generar cliente Prisma (EJECUTAR AHORA)
npx prisma generate

# Crear las tablas en Supabase
npx prisma db push

# Crear el admin inicial
npm run db:seed

# Iniciar en modo desarrollo
npm run dev

# Ver la BD visualmente
npm run db:studio
```

---

## Próximos pasos (Fase 2)

Antes de continuar, necesitás:

1. **Crear cuenta en Supabase** (https://supabase.com)
   - Crear proyecto nuevo
   - Copiar la URL de conexión
   - Pegarla en `.env` como `DATABASE_URL`

2. **Ejecutar estos comandos:**
   ```bash
   npx prisma generate    # Genera el cliente
   npx prisma db push     # Crea las tablas
   npm run db:seed        # Crea el admin
   npm run dev            # Inicia el servidor
   ```

3. **Verificar que funciona:**
   - Abrir http://localhost:3000 en el navegador
   - Debería mostrar el JSON de bienvenida

---

## Resumen de la Conversación

1. Retomamos el proyecto después de un reinicio
2. Ya tenías `package.json` y `node_modules` instalados
3. Creé la estructura de carpetas (`src/`, `prisma/`)
4. Creé los archivos de configuración (`.env`, `.gitignore`, configs)
5. Definí el schema de Prisma con las 3 tablas
6. Creé el `app.js` principal con Express configurado
7. Creé el seed para el administrador inicial
8. Documenté todo en este archivo

**Próxima fase:** Autenticación (login, JWT, proteger rutas)

---

## Problemas que tuvimos y cómo se resolvieron

### Problema 1: npx prisma no funcionaba
**Error:** `"prisma" no se reconoce como un comando`
**Causa:** Git Bash en Windows tiene problemas con npx
**Solución:** Usar `./node_modules/.bin/prisma` directamente

### Problema 2: No se podía conectar a Supabase (P1001)
**Error:** `Can't reach database server`
**Causa:** La conexión directa requiere IPv6, pero estábamos en IPv4
**Solución:** Usar Session Pooler en lugar de Direct Connection

### Problema 3: Error de autenticación (P1000)
**Error:** `Authentication failed`
**Causa:** El caracter `!` en la contraseña causaba problemas + había que esperar propagación
**Solución:**
1. Cambiar contraseña a una sin caracteres especiales
2. Esperar 2-3 minutos para que se propague
3. Usar puerto 5432 con el pooler

### URL de conexión final que funcionó:
```
postgresql://postgres.XXXX:PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

---

## Glosario de términos usados

| Término | Significado |
|---------|-------------|
| Middleware | Función que intercepta requests antes de llegar a tu ruta |
| ORM | Traductor entre código y base de datos |
| Schema | Definición de estructura de la BD |
| Seed | Datos iniciales para la BD |
| Hash | Texto encriptado de forma irreversible |
| Token | String que prueba tu identidad |
| CORS | Permiso para que el frontend hable con el backend |
| Environment Variables | Configuraciones sensibles fuera del código |
