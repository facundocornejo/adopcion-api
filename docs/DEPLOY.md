# Guía de Deploy - Adopción API

## Requisitos Previos

1. **Cuenta en GitHub** - Para subir el código
2. **Cuenta en Render** - https://render.com (plan gratuito disponible)
3. **Cuenta en Supabase** - https://supabase.com (ya la tenés)
4. **Cuenta en Cloudinary** - https://cloudinary.com (ya la tenés)

---

## Paso 1: Subir el código a GitHub

### 1.1 Crear repositorio en GitHub
1. Ir a https://github.com/new
2. Nombre: `adopcion-api`
3. Privado o público según prefieras
4. NO inicializar con README (ya tenemos archivos)

### 1.2 Subir el código
```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "feat: backend completo de adopción de animales"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/adopcion-api.git
git push -u origin main
```

---

## Paso 2: Configurar Supabase (Base de Datos)

### 2.1 Obtener la URL de conexión
1. Ir a tu proyecto en Supabase
2. Settings > Database
3. Copiar la **Connection string** (URI)
4. Reemplazar `[YOUR-PASSWORD]` con tu contraseña

La URL se verá así:
```
postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

### 2.2 Ejecutar migraciones (si no lo hiciste)
```bash
npx prisma db push
```

---

## Paso 3: Deploy en Render

### 3.1 Crear el servicio
1. Ir a https://dashboard.render.com
2. Click en **"New +"** > **"Web Service"**
3. Conectar con GitHub y seleccionar el repositorio `adopcion-api`

### 3.2 Configurar el servicio
| Campo | Valor |
|-------|-------|
| Name | `adopcion-api` |
| Region | Oregon (US West) |
| Branch | `main` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Plan | Free |

### 3.3 Configurar variables de entorno
En la sección **Environment Variables**, agregar:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres:...` (de Supabase) |
| `JWT_SECRET` | (Click "Generate" para generar uno seguro) |
| `JWT_EXPIRES_IN` | `24h` |
| `CLOUDINARY_CLOUD_NAME` | (tu cloud name) |
| `CLOUDINARY_API_KEY` | (tu api key) |
| `CLOUDINARY_API_SECRET` | (tu api secret) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | (tu email de Gmail) |
| `SMTP_PASS` | (tu App Password de Gmail) |
| `ADMIN_EMAIL` | (email donde recibir notificaciones) |
| `FRONTEND_URL` | (URL de tu frontend, ej: `https://tu-app.vercel.app`) |

### 3.4 Deploy
1. Click en **"Create Web Service"**
2. Esperar a que termine el build (puede tardar unos minutos)
3. Una vez terminado, tu API estará en: `https://adopcion-api.onrender.com`

---

## Paso 4: Verificar el Deploy

### 4.1 Probar el health check
```bash
curl https://adopcion-api.onrender.com/api/health
```

Deberías ver:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### 4.2 Probar el login
```bash
curl -X POST https://adopcion-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@adopcion.com", "password": "admin123"}'
```

---

## Notas Importantes

### Plan Gratuito de Render
- El servicio se "duerme" después de 15 minutos de inactividad
- La primera request después de dormir tarda ~30 segundos
- Para producción real, considera el plan Starter ($7/mes)

### Actualizar el Deploy
Cada vez que hagas push a `main`, Render desplegará automáticamente:
```bash
git add .
git commit -m "fix: descripción del cambio"
git push
```

### Logs y Debugging
- Ver logs en tiempo real en Render Dashboard > tu servicio > "Logs"
- Los errores aparecen en rojo

---

## Checklist Final

- [ ] Código subido a GitHub
- [ ] Servicio creado en Render
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada (Supabase)
- [ ] Health check responde OK
- [ ] Login funciona correctamente
- [ ] Frontend actualizado con la nueva URL de la API

---

## URLs de Producción

Una vez desplegado, tu API estará disponible en:
- **Base URL:** `https://adopcion-api.onrender.com`
- **Health:** `https://adopcion-api.onrender.com/api/health`
- **Animales:** `https://adopcion-api.onrender.com/api/animals`

Recordá actualizar `FRONTEND_URL` en las variables de entorno de Render con la URL de tu frontend.
