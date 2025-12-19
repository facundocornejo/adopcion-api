# REQUIREMENTS.md - Backend Plataforma de Adopción de Animales

## Información del Proyecto

- **Proyecto:** Plataforma Web de Adopción de Animales
- **Tipo:** Trabajo Final Integrador (TFI) - UTN Paraná
- **Desarrollador Backend:** Facundo Cornejo
- **Fecha:** Diciembre 2025

---

## Stack Tecnológico Definido

```
Runtime:        Node.js (v18 o superior)
Framework:      Express.js
Base de Datos:  PostgreSQL (Supabase en producción)
ORM:            Prisma
Autenticación:  JWT (jsonwebtoken) + bcrypt
Validación:     express-validator
Imágenes:       Cloudinary
Emails:         Nodemailer
```

---

## Requerimientos Funcionales

### RF-1: Autenticación y Seguridad

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-1.1 | Login con email y contraseña | POST /api/auth/login |
| RF-1.2 | Generar y validar tokens JWT | Expiración: 24 horas |
| RF-1.3 | Logout (invalidar sesión) | POST /api/auth/logout |
| RF-1.4 | Proteger rutas del panel admin | Middleware de verificación JWT |
| RF-1.5 | Hashear contraseñas con bcrypt | Factor de costo ≥ 10 |

### RF-2: Gestión de Animales

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-2.1 | Crear animal con 19 campos | POST /api/animals |
| RF-2.2 | Cargar 1-5 fotos por animal | Integración con Cloudinary |
| RF-2.3 | Marcar foto como principal | Campo `foto_principal` obligatorio |
| RF-2.4 | Editar información de animales | PUT /api/animals/:id |
| RF-2.5 | Cambiar estado del animal | PATCH /api/animals/:id/status |
| RF-2.6 | Eliminar animales (con confirmación) | DELETE /api/animals/:id |
| RF-2.7 | Listar animales (admin ve todos) | GET /api/animals |
| RF-2.8 | Validar campos obligatorios | Antes de guardar |
| RF-2.9 | Validar mínimo 1 foto | Antes de crear |

**Estados válidos para animales:**
- `Disponible` - Buscando adoptante
- `En proceso` - Evaluando candidatos
- `Adoptado` - Ya tiene hogar
- `En transito` - En hogar temporal

### RF-3: Catálogo Público

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-3.1 | Mostrar animales públicamente | Solo Disponible/En proceso/En transito |
| RF-3.2 | Cards con info resumida | foto, nombre, edad, especie, estado |
| RF-3.3 | Detalle individual completo | GET /api/animals/:id |
| RF-3.4 | Galería completa de fotos | Hasta 5 fotos |
| RF-3.5 | Historia de rescate destacada | Campo `descripcion_historia` |
| RF-3.6 | Info de socialización | Con perros/gatos/niños |
| RF-3.7 | Necesidades especiales visibles | Campo destacado |
| RF-3.8 | Contacto del rescatista | Instagram/WhatsApp |

### RF-4: Formulario de Adopción

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-4.1 | Formulario con 17 campos | POST /api/adoption-requests |
| RF-4.2 | Validar edad ≥ 18 años | Rechazar menores |
| RF-4.3 | Validar formato email y teléfono | Regex de validación |
| RF-4.4 | Validar campos obligatorios | Antes de guardar |
| RF-4.5 | Vincular solicitud al animal | FK animal_id |
| RF-4.6 | Mensaje de confirmación | Response con success |
| RF-4.7 | Requerir compromiso castración | Checkbox obligatorio |

### RF-5: Gestión de Solicitudes

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-5.1 | Bandeja de solicitudes | GET /api/adoption-requests |
| RF-5.2 | Ver detalle de solicitud | GET /api/adoption-requests/:id |
| RF-5.3 | Mostrar 17 campos completos | En vista de detalle |
| RF-5.4 | Destacar datos de contacto | En response |
| RF-5.5 | Marcar como "vista" | PATCH /api/adoption-requests/:id |

### RF-6: Notificaciones

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-6.1 | Email al admin por nueva solicitud | Trigger automático |
| RF-6.2 | Email incluye datos clave | Nombre adoptante, animal, contacto |
| RF-6.3 | Envío en menos de 1 minuto | Async, no bloquear response |

### RF-7: Almacenamiento de Imágenes

| ID | Requerimiento | Detalles |
|----|---------------|----------|
| RF-7.1 | Carga múltiple (hasta 5) | POST /api/upload |
| RF-7.2 | Validar tamaño máximo | 5MB por imagen |
| RF-7.3 | Validar formatos | JPG, JPEG, PNG, WEBP |
| RF-7.4 | Eliminar imágenes | Desde admin, borrar de Cloudinary |

---

## Requerimientos No Funcionales

### RNF-1: Rendimiento
- Lazy loading de imágenes (responsabilidad del frontend)
- Queries a BD < 500ms promedio
- Soportar 50 usuarios concurrentes

### RNF-2: Seguridad
- Contraseñas hasheadas con bcrypt (costo ≥ 10)
- Tokens JWT con expiración 24h
- Validación de token en cada request protegida
- Sanitización de inputs (prevenir SQL injection, XSS)
- HTTPS en producción

### RNF-3: Código
- Estructura de carpetas organizada
- Manejo centralizado de errores
- Variables de entorno para configuración sensible
- Código comentado en partes complejas

---

## Modelo de Datos

### Tabla: administrador
```
id              INTEGER     PK, AUTO_INCREMENT
username        VARCHAR(50) UNIQUE, NOT NULL
password_hash   VARCHAR(255) NOT NULL
email           VARCHAR(100) UNIQUE, NOT NULL
fecha_creacion  TIMESTAMP   DEFAULT NOW()
ultimo_acceso   TIMESTAMP   NULL
```

### Tabla: animal
```
id                      INTEGER     PK, AUTO_INCREMENT
administrador_id        INTEGER     FK -> administrador, NOT NULL
nombre                  VARCHAR(100) NOT NULL
especie                 VARCHAR(20) NOT NULL ('Perro' | 'Gato')
sexo                    VARCHAR(10) NOT NULL ('Macho' | 'Hembra')
edad_aproximada         VARCHAR(50) NOT NULL
tamanio                 VARCHAR(20) NOT NULL ('Pequeño' | 'Mediano' | 'Grande')
raza_mezcla             VARCHAR(100) NULL
descripcion_historia    TEXT        NOT NULL
estado_castracion       BOOLEAN     NOT NULL, DEFAULT FALSE
estado_vacunacion       VARCHAR(200) NULL
estado_desparasitacion  BOOLEAN     NOT NULL, DEFAULT FALSE
socializa_perros        BOOLEAN     NOT NULL, DEFAULT FALSE
socializa_gatos         BOOLEAN     NOT NULL, DEFAULT FALSE
socializa_ninos         BOOLEAN     NOT NULL, DEFAULT FALSE
necesidades_especiales  TEXT        NULL
tipo_hogar_ideal        VARCHAR(200) NULL
estado                  VARCHAR(20) NOT NULL, DEFAULT 'Disponible'
publicado_por           VARCHAR(100) NOT NULL
contacto_rescatista     VARCHAR(200) NOT NULL
foto_principal          VARCHAR(255) NOT NULL
foto_2                  VARCHAR(255) NULL
foto_3                  VARCHAR(255) NULL
foto_4                  VARCHAR(255) NULL
foto_5                  VARCHAR(255) NULL
fecha_publicacion       TIMESTAMP   DEFAULT NOW()
fecha_actualizacion     TIMESTAMP   ON UPDATE NOW()
```

### Tabla: solicitud_adopcion
```
id                      INTEGER     PK, AUTO_INCREMENT
animal_id               INTEGER     FK -> animal, NOT NULL
nombre_completo         VARCHAR(100) NOT NULL
edad                    INTEGER     NOT NULL, CHECK >= 18
email                   VARCHAR(100) NOT NULL
telefono_whatsapp       VARCHAR(20) NOT NULL
instagram               VARCHAR(100) NULL
ciudad_zona             VARCHAR(100) NOT NULL
tipo_vivienda           VARCHAR(50) NOT NULL
vive_solo_acompanado    VARCHAR(100) NOT NULL
todos_de_acuerdo        BOOLEAN     NOT NULL
tiene_otros_animales    BOOLEAN     NOT NULL, DEFAULT FALSE
otros_animales_castrados VARCHAR(50) NULL
experiencia_previa      TEXT        NOT NULL
puede_cubrir_gastos     BOOLEAN     NOT NULL
veterinaria_que_usa     VARCHAR(200) NULL
motivacion              TEXT        NOT NULL
compromiso_castracion   BOOLEAN     NOT NULL
acepta_contacto         BOOLEAN     NOT NULL, DEFAULT TRUE
fecha_solicitud         TIMESTAMP   DEFAULT NOW()
estado_solicitud        VARCHAR(20) DEFAULT 'Nueva'
```

---

## Endpoints de la API

### Autenticación
```
POST /api/auth/login     → Iniciar sesión
POST /api/auth/logout    → Cerrar sesión
```

### Animales
```
GET    /api/animals          → Listar animales
GET    /api/animals/:id      → Obtener detalle
POST   /api/animals          → Crear animal (protegido)
PUT    /api/animals/:id      → Actualizar animal (protegido)
PATCH  /api/animals/:id/status → Cambiar estado (protegido)
DELETE /api/animals/:id      → Eliminar animal (protegido)
```

### Solicitudes de Adopción
```
POST   /api/adoption-requests      → Crear solicitud (público)
GET    /api/adoption-requests      → Listar solicitudes (protegido)
GET    /api/adoption-requests/:id  → Ver detalle (protegido)
PATCH  /api/adoption-requests/:id  → Marcar como vista (protegido)
```

### Utilidades
```
POST   /api/upload           → Subir imagen a Cloudinary (protegido)
GET    /api/dashboard/stats  → Estadísticas para dashboard (protegido)
```

---

## Validaciones Importantes

### Crear Animal - Campos Obligatorios
1. nombre
2. especie (solo 'Perro' o 'Gato')
3. sexo (solo 'Macho' o 'Hembra')
4. edad_aproximada
5. tamanio (solo 'Pequeño', 'Mediano', 'Grande')
6. descripcion_historia (mínimo 50 caracteres)
7. publicado_por
8. contacto_rescatista
9. foto_principal (URL válida)

### Crear Solicitud - Campos Obligatorios
1. nombre_completo
2. edad (número ≥ 18)
3. email (formato válido)
4. telefono_whatsapp
5. ciudad_zona
6. tipo_vivienda
7. vive_solo_acompanado
8. todos_de_acuerdo (debe ser true)
9. tiene_otros_animales
10. experiencia_previa
11. puede_cubrir_gastos
12. motivacion (mínimo 20 caracteres)
13. compromiso_castracion (debe ser true)
14. acepta_contacto

---

## Variables de Entorno Necesarias

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
ADMIN_EMAIL=email_del_admin@example.com
```

---

## Orden de Implementación Sugerido

### Fase 1: Setup Inicial
1. Inicializar proyecto Node.js
2. Instalar dependencias
3. Configurar estructura de carpetas
4. Configurar variables de entorno
5. Conectar a PostgreSQL con Prisma
6. Crear esquema y migrar

### Fase 2: Autenticación
7. Crear modelo Admin en Prisma
8. Ruta POST /api/auth/login
9. Middleware verificar JWT
10. Ruta POST /api/auth/logout
11. Seed de usuario admin inicial

### Fase 3: CRUD Animales
12. GET /api/animals (público)
13. GET /api/animals/:id (público)
14. POST /api/animals (protegido)
15. PUT /api/animals/:id (protegido)
16. PATCH /api/animals/:id/status (protegido)
17. DELETE /api/animals/:id (protegido)

### Fase 4: Imágenes
18. Configurar Cloudinary
19. POST /api/upload
20. Integrar con creación de animal

### Fase 5: Solicitudes
21. POST /api/adoption-requests (público)
22. Validar 17 campos
23. GET /api/adoption-requests (protegido)
24. GET /api/adoption-requests/:id (protegido)
25. PATCH marcar como vista

### Fase 6: Notificaciones
26. Configurar Nodemailer
27. Enviar email en nueva solicitud

### Fase 7: Dashboard
28. GET /api/dashboard/stats

### Fase 8: Deploy
29. Configurar para producción
30. Deploy en Render + Supabase
