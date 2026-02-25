# Implementación: Recuperación de Contraseña (Frontend)

## Contexto
El backend ya tiene implementados los endpoints para recuperación de contraseña. Tu tarea es implementar la UI en el frontend.

## Flujo de usuario

```
Usuario olvida contraseña
    → Click "Olvidé mi contraseña"
    → Ingresa email
    → Sistema envía notificación a admins
    → Admin resetea contraseña manualmente
    → Usuario recibe nueva contraseña por otro medio
```

---

## Endpoint 1: Solicitar recuperación (PÚBLICO)

**Usar en:** Pantalla de login, botón "Olvidé mi contraseña"

```
POST /api/auth/forgot-password
Content-Type: application/json
```

### Request
```json
{
  "email": "usuario@ejemplo.com"
}
```

### Response (siempre 200, por seguridad)
```json
{
  "success": true,
  "data": {
    "message": "Si el email está registrado, los administradores recibirán tu solicitud"
  }
}
```

### Validaciones
- Email requerido (400 si falta)

### UI sugerida
- Input de email
- Botón "Enviar solicitud"
- Mostrar mensaje de éxito genérico (no revelar si el email existe)
- Link para volver al login

---

## Endpoint 2: Listar administradores (SUPER ADMIN)

**Usar en:** Panel de super admin, sección "Administradores"

```
GET /api/super-admin/admins
Authorization: Bearer <token>
```

### Response
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": 5,
        "username": "companero",
        "email": "companero@test.com",
        "es_super_admin": false,
        "fecha_creacion": "2026-02-22T15:50:19.701Z",
        "ultimo_acceso": "2026-02-22T15:57:15.483Z",
        "organizacion": {
          "id": 5,
          "nombre": "Organización Test",
          "slug": "org-test"
        }
      }
    ]
  }
}
```

---

## Endpoint 3: Resetear contraseña (SUPER ADMIN)

**Usar en:** Panel de super admin, acción en lista de administradores

```
PUT /api/super-admin/admins/:id/reset-password
Authorization: Bearer <token>
Content-Type: application/json
```

### Request
```json
{
  "new_password": "NuevaPassword123"
}
```

### Validación de contraseña
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Caracteres permitidos: A-Za-z0-9@$!%*?&_-#

### Response exitosa (200)
```json
{
  "success": true,
  "data": {
    "message": "Contraseña reseteada correctamente para companero",
    "admin": {
      "id": 5,
      "username": "companero",
      "email": "companero@test.com",
      "organizacion": "Organización Test"
    }
  }
}
```

### Errores posibles
| Código | Error | Mensaje |
|--------|-------|---------|
| 400 | VALIDATION_ERROR | La nueva contraseña es requerida |
| 400 | WEAK_PASSWORD | La contraseña debe tener al menos 8 caracteres... |
| 404 | NOT_FOUND | Administrador no encontrado |
| 403 | FORBIDDEN | No tenés permisos de super administrador |

---

## Componentes a crear

### 1. ForgotPasswordForm (público)
```
Ubicación sugerida: /forgot-password o modal en /login

Campos:
- Input email (required)
- Botón submit

Estados:
- idle: formulario vacío
- loading: enviando solicitud
- success: mostrar mensaje genérico
- error: mostrar error de validación
```

### 2. AdminList (super admin)
```
Ubicación sugerida: /admin/usuarios o /super-admin/admins

Mostrar tabla con:
- Username
- Email
- Organización
- Es super admin (badge)
- Último acceso
- Acciones: [Resetear contraseña]
```

### 3. ResetPasswordModal (super admin)
```
Modal que aparece al hacer click en "Resetear contraseña"

Campos:
- Input new_password (required)
- Mostrar requisitos de contraseña
- Botón confirmar

Validar en frontend antes de enviar:
- regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_\-#]{8,}$/
```

---

## Credenciales de prueba

```
Super Admin:
  Email: proyectoperritos@hotmail.com
  Password: Admin2024!

Usuario normal (para probar forgot password):
  Email: companero@test.com
  Password: NuevaPass2024!
```

---

## Base URL
- Local: http://localhost:3000
- Producción: https://adopcion-api.onrender.com
