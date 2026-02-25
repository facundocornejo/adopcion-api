# Contexto de Sesión - Proyecto Adopción API

> Leé este archivo al inicio de cada sesión para retomar el contexto.

---

## Resumen del Proyecto

**Qué es:** Backend API para plataforma de adopción de animales (TFI - UTN Paraná)

**Stack:**
- Node.js + Express
- Prisma ORM + PostgreSQL (Supabase)
- JWT para autenticación
- Cloudinary para imágenes
- Resend para emails (antes Nodemailer, pero Render bloquea SMTP)
- Hosting en Render

**Repositorio:** Este directorio (`B:\TFI\adopcion-api`)

---

## Lo que hicimos en la última sesión (25 Feb 2026 - Noche continuación)

### 1. Endpoint Animal con Datos de Donación y Redes Sociales

**Requerimiento:** Al mostrar un animal, incluir datos de donación y redes sociales de la organización para que el frontend pueda mostrar todo junto.

**Endpoint modificado:** `GET /api/animals/:id`

**Campos agregados en `organizacion`:**
- `instagram` - Red social
- `facebook` - Red social
- `donacion_alias` - Alias de Mercado Pago
- `donacion_cbu` - CBU/CVU para transferencias
- `donacion_info` - Texto libre con info adicional

**Campo removido:** `whatsapp` (por privacidad, no se expone públicamente)

**Archivos modificados:**
- `src/controllers/animals.controller.js` - Agregados campos en el select
- `src/config/swagger.js` - Documentación actualizada

**Documentación para frontend:** `DOCS_ANIMAL_DONACIONES.md`

**Commits:**
- `2275860` - feat: Agregar datos de donación y redes sociales en GET /api/animals/:id
- `74c1a82` - docs: Actualizar Swagger con campos de donación y redes en Animal
- `5d9778d` - docs: Agregar documentación de campos de donación para frontend

---

### 2. Limpieza de Base de Datos para Testing

**Objetivo:** Limpiar la BD para empezar a testear desde cero, manteniendo solo los super admins principales.

**Eliminado:**
- 19 animales
- 5 solicitudes de adopción
- 7 casos de éxito
- 1 solicitud de contacto
- 4 administradores (todos excepto facu y guille)
- 3 organizaciones

**Mantenido:**
| Usuario | Email | Super Admin | Organización |
|---------|-------|-------------|--------------|
| facu | facundocornejodediego@hotmail.com | ✅ | refugio india (id: 4) |
| guille | guillelondero@gmail.com | ✅ | Organización Huellas de Amore (id: 1) |

**Organizaciones ocultas:** Las organizaciones de facu y guille fueron marcadas como `activa: false` para que no aparezcan en listados públicos pero sigan existiendo para el funcionamiento del super admin.

---

## Lo que hicimos antes en esta sesión (25 Feb 2026 - Noche)

### 1. Migración del Sistema de Emails: Nodemailer → Resend

**Problema reportado:** El compañero usó el endpoint `POST /api/auth/forgot-password` y recibió 200 OK, pero el email nunca llegó.

**Investigación:**
1. Revisamos los logs de Render → Error: `Connection timeout` (ETIMEDOUT)
2. Probamos con Gmail (SMTP) → Mismo error de timeout
3. Probamos con puerto 465 (SSL) → Mismo error

**Causa raíz:** Render en el **free tier bloquea conexiones SMTP salientes** en todos los puertos (25, 465, 587) para prevenir spam. Es una restricción a nivel de infraestructura.

**Solución implementada:** Migrar de Nodemailer (SMTP) a **Resend** (API HTTP).

Resend es un servicio de email transaccional que usa API HTTP en lugar de SMTP, por lo que no está bloqueado.

**Cambios realizados:**

1. **Instalamos Resend:**
   ```bash
   npm install resend
   ```

2. **Modificamos `src/services/email.service.js`:**
   - Eliminamos dependencia de `nodemailer` y `transporter`
   - Importamos SDK de Resend
   - Cambiamos las funciones para usar `resend.emails.send()`
   - El remitente es `onboarding@resend.dev` (dominio gratuito de Resend)

3. **Modificamos `src/config/email.js`:**
   - Agregamos soporte para puerto 465 con SSL (aunque finalmente no se usa)
   - Agregamos timeouts de conexión

**Variables de entorno en Render:**

| Variable | Valor | Nota |
|----------|-------|------|
| `RESEND_API_KEY` | `re_caGqhE4H_...` | API key de Resend |
| `ADMIN_EMAIL` | `animalitosproyecto@gmail.com` | Donde llegan las notificaciones |

**Variables eliminadas** (ya no se usan):
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

**Cuenta de Resend:**
- Email: `animalitosproyecto@gmail.com`
- Free tier: 3000 emails/mes

**Cuenta de Gmail creada** (no se usa para SMTP pero quedó):
- Email: `animalitosproyecto@gmail.com`
- Password: `Facuyguille`
- App Password: `mkbyxdfkgtanfxxq` (no se usa)

**Commits:**
- `df47d60` - fix: Usar puerto 465 SSL y agregar timeouts para SMTP
- `772bf91` - feat: Migrar de nodemailer SMTP a Resend API para envío de emails

**Archivos modificados:**
- `src/services/email.service.js` - Reescrito para usar Resend
- `src/config/email.js` - Actualizado (aunque ya no se importa)
- `package.json` - Nueva dependencia `resend`

**Resultado:** Los emails ahora se envían correctamente desde Render.

---

## Lo que hicimos en sesión anterior (25 Feb 2026 - Tarde)

### 1. Nuevo Endpoint: Actualizar Organización

**Problema reportado:** El frontend intentaba hacer `PUT /api/super-admin/organizations/6` pero la ruta no existía (404).

**Solución:** Creamos el endpoint completo para editar organizaciones desde Super Admin.

**Endpoint:** `PUT /api/super-admin/organizations/:id`

**Campos que acepta:**
- Datos org: `nombre`, `email`, `telefono`, `whatsapp`, `direccion`, `descripcion`, `instagram`, `facebook`, `donacion_alias`, `donacion_cbu`, `donacion_info`
- Datos admin principal: `admin_username`, `admin_email`, `admin_password`

**Comportamiento:**
- Si se envía `nombre`, actualiza también el `slug` automáticamente
- Si se envía `admin_password`, valida política (8+ chars, mayúscula, minúscula, número) y actualiza
- Campos vacíos o no enviados no se modifican

**Archivos modificados:**
- `src/controllers/superadmin.controller.js` - Nueva función `updateOrganization`
- `src/routes/superadmin.routes.js` - Nueva ruta + documentación Swagger

**Commits:**
- `82b173b` - feat: Agregar endpoint PUT para actualizar organizaciones
- `16f568b` - feat: Permitir actualizar contraseña del admin en PUT organizations

### 2. Resumen de Endpoints de Contraseña

| Endpoint | ¿Quién lo usa? | ¿Qué hace? |
|----------|----------------|------------|
| `POST /api/auth/forgot-password` | Usuario público | Envía email a super admins pidiendo reseteo |
| `PUT /api/super-admin/admins/:id/reset-password` | Super Admin | Resetea contraseña de cualquier admin por ID (`new_password`) |
| `PUT /api/super-admin/organizations/:id` | Super Admin | Edita org + opcionalmente contraseña del admin principal (`admin_password`) |

---

## Lo que hicimos en sesión anterior (25 Feb 2026 - Mañana)

### 1. Fix CORS Preflight Timeout

**Problema reportado:** Los endpoints de contraseña (`/api/auth/forgot-password` y `/api/super-admin/admins/:id/reset-password`) se "colgaban" - el preflight OPTIONS no respondía a tiempo.

**Causa:** El preflight pasaba por toda la cadena de middlewares (rate limiter, etc.) lo que causaba delays.

**Solución aplicada en `src/app.js`:**
- Movimos la configuración de CORS al inicio de los middlewares
- Agregamos `app.options('*', cors(corsOptions))` para responder inmediatamente a preflight
- Excluimos requests OPTIONS del rate limiter general
- Agregamos configuración explícita de métodos y headers permitidos

**Commits:**
- `e8aae86` - fix: Mejorar manejo de CORS preflight para evitar timeouts
- `6f00c5a` - fix: Enviar email de recuperación en background sin bloquear respuesta

### 2. Fix Email Bloqueando Respuesta

**Problema:** El endpoint `forgotPassword` usaba `await` para enviar email, bloqueando la respuesta HTTP si el SMTP tardaba.

**Solución en `src/controllers/auth.controller.js`:**
```javascript
// Antes (bloqueaba):
await notificarSolicitudRecuperacion(admin);

// Después (no bloquea):
notificarSolicitudRecuperacion(admin).catch(err => {
  console.error('Error enviando email de recuperación (background):', err);
});
```

### 3. Nota sobre el incidente

El compañero reportó que "se colgaba" al apretar el botón, pero después se descubrió que **el botón del frontend no estaba mandando ningún request**. Los fixes del backend igual son válidos y mejoran el rendimiento.

---

## Lo que hicimos en sesión anterior (22 Feb 2026)

### 1. Creamos usuario administrador para compañero
- **Usuario:** `companero`
- **Email:** `companero@test.com`
- **Password:** `NuevaPass2024!` (fue reseteada durante las pruebas)
- **Organización:** Organización Test Compañero

### 2. Implementamos Recuperación de Contraseña
Flujo manual: usuario pide reset → nos llega email → reseteamos desde super admin

**Endpoints creados:**
- `POST /api/auth/forgot-password` - Usuario solicita recuperación (envía email a ADMIN_EMAIL)
- `GET /api/super-admin/admins` - Listar todos los administradores
- `PUT /api/super-admin/admins/:id/reset-password` - Super admin resetea contraseña

**Archivos modificados:**
- `src/services/email.service.js` - Nueva función `notificarSolicitudRecuperacion`
- `src/controllers/auth.controller.js` - Endpoint `forgotPassword`
- `src/controllers/superadmin.controller.js` - Endpoints `resetAdminPassword` y `getAdmins`
- `src/routes/auth.routes.js` y `src/routes/superadmin.routes.js`

**Doc para frontend:** `DOCS_RECUPERAR_PASSWORD.md`

### 3. Fix Upload de Imágenes
- Error 413 Content Too Large
- Cambié campo `file` → `image` en multer (el frontend enviaba `name="image"`)
- Aumenté límite body Express: 100kb → 10mb

### 4. Filtro por Organización para Super Admin
Ahora el super admin puede filtrar animales y stats por organización.

**Cambios:**
- `GET /api/animals?organizacion_id=X` - Super admin ve todos, o filtra por org
- `GET /api/dashboard/stats?organizacion_id=X` - Stats globales o por org

**Comportamiento:**
| Sin filtro | Con filtro |
|------------|------------|
| Super Admin ve TODOS los animales | Ve solo los de la org especificada |
| Stats globales | Stats de esa org |

**Archivos modificados:**
- `src/controllers/animals.controller.js`
- `src/controllers/dashboard.controller.js`
- Swagger docs actualizados

**Doc para frontend:** `DOCS_FILTRO_SUPERADMIN.md`

### 5. Credenciales actualizadas

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| admin | proyectoperritos@hotmail.com | Admin2024! | Super Admin |
| companero | companero@test.com | NuevaPass2024! | Admin normal |

---

## Lo que hicimos en sesión anterior (17 Feb 2026)

### 1. Revisamos el estado del proyecto
- Confirmamos que Swagger está configurado y funcionando
- URLs de Swagger:
  - Local: `http://localhost:3000/api-docs`
  - Producción: `https://adopcion-api.onrender.com/api-docs`

### 2. Creamos documentación completa

Analizamos TODO el código y generamos dos archivos:

**`DOCUMENTACION_PERSONAL.md`** (~2000 líneas)
- Para Facundo (el dueño del proyecto)
- Tono pedagógico, español argentino informal
- Explica cada parte del sistema en detalle
- Incluye diagramas, ejemplos de código, glosario técnico

**`DOCUMENTACION_COMPAÑERO.md`** (~1500 líneas)
- Para Guillermo (compañero que hace el frontend)
- Tono técnico y directo
- Contrato de API completo con ejemplos JSON
- Guía de autenticación, subida de imágenes, manejo de errores

---

## Estructura del Proyecto

```
src/
├── app.js                 # Entry point
├── config/                # Configuraciones (DB, Cloudinary, Email, Swagger)
├── constants/enums.js     # Constantes centralizadas
├── middlewares/           # Auth y validadores
├── routes/                # 8 archivos de rutas
├── controllers/           # 8 controladores
└── services/              # Email y Audit

prisma/
├── schema.prisma          # 7 modelos
└── seed.js                # Datos iniciales
```

---

## Modelos de Datos

1. **Organizacion** - Refugios/ONGs (multi-tenant)
2. **Administrador** - Usuarios del sistema
3. **Animal** - Perros y gatos para adopción
4. **SolicitudAdopcion** - Formularios de adoptantes
5. **SolicitudContacto** - Rescatistas que quieren unirse
6. **CasoExito** - Historias de adopciones exitosas
7. **AuditLog** - Registro de auditoría

---

## Endpoints Principales

- `/api/auth/*` - Login, logout, me
- `/api/animals/*` - CRUD de animales
- `/api/adoption-requests/*` - Solicitudes de adopción
- `/api/upload` - Subida de imágenes
- `/api/dashboard/stats` - Estadísticas
- `/api/organization/*` - Perfil de organización
- `/api/super-admin/*` - Gestión global
- `/api/casos-exito/*` - Historias de éxito

---

## Usuario de Prueba

```
Email: admin@adopcion.com
Password: admin123
Organización: Refugio Patitas Felices
```

---

## Comandos Útiles

```bash
npm run dev          # Servidor desarrollo
npm run build        # Generar Prisma + push schema
npm run db:seed      # Cargar datos de prueba
npm run db:studio    # GUI de base de datos
```

---

## Pendientes / Ideas Futuras

(Agregar acá lo que vaya surgiendo)

- [ ] Implementar refresh token
- [ ] Notificación email al adoptante

### Recuperar Contraseña (Opción 2 - Recomendada para MVP)

**Flujo:**
```
Usuario clickea "Olvidé mi contraseña" → Pone su email →
Les llega email a ustedes (superadmins) → Resetean manualmente → Le avisan
```

**Requiere:**
1. **1 endpoint nuevo:** `POST /api/auth/forgot-password`
   ```javascript
   // Recibe: { email: "usuario@ejemplo.com" }
   // Envía email a ADMIN_EMAIL con el pedido
   // Responde: { success: true, message: "Si el email existe, recibirás instrucciones" }
   ```

2. **Usar servicio de email existente** (`src/services/email.service.js`)

3. **En el frontend:** Formulario simple con campo email + botón

**Implementación estimada:** ~30 líneas de código en el back

**Script para resetear contraseña manualmente:**
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function reset(email, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.administrador.update({
    where: { email },
    data: { password_hash: hash }
  });
  console.log('Contraseña actualizada para:', email);
}

reset('EMAIL_AQUI', 'NUEVA_PASSWORD');
"
```

---

## Notas para Próxima Sesión

(Escribir acá antes de cerrar la sesión)

-

---

*Última actualización: 25 Feb 2026 - Noche (continuación)*
