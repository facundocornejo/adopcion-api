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
- Nodemailer para emails
- Hosting en Render

**Repositorio:** Este directorio (`B:\TFI\adopcion-api`)

---

## Lo que hicimos en la última sesión (22 Feb 2026)

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

*Última actualización: 22 Feb 2026*
