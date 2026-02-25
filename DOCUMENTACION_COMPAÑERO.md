# Documentación para Frontend - API de Adopción de Animales

> Documentación técnica del backend para integración con el frontend. Todo lo que necesitás para conectar tu aplicación.

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Stack del Backend](#2-stack-del-backend)
3. [Cómo Levantar el Proyecto en Local](#3-cómo-levantar-el-proyecto-en-local)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Contrato de API Completo](#5-contrato-de-api-completo)
6. [Autenticación - Guía para Frontend](#6-autenticación---guía-para-frontend)
7. [Subida de Imágenes](#7-subida-de-imágenes)
8. [Paginación, Filtros y Búsqueda](#8-paginación-filtros-y-búsqueda)
9. [Manejo de Errores desde el Front](#9-manejo-de-errores-desde-el-front)
10. [Documentación Swagger](#10-documentación-swagger)
11. [Notas Importantes](#11-notas-importantes)

---

## 1. Resumen del Proyecto

Plataforma web de adopción de animales desarrollada como Trabajo Final Integrador (TFI) para UTN Paraná.

**Funcionalidades principales:**
- Publicación de animales para adopción (perros y gatos)
- Recepción de solicitudes de adopción
- Gestión multi-organización (cada refugio tiene sus propios datos)
- Panel de administración con estadísticas
- Casos de éxito (historias de adopciones completadas)

---

## 2. Stack del Backend

| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime |
| Express.js | Framework web |
| Prisma | ORM para PostgreSQL |
| PostgreSQL | Base de datos (Supabase en producción) |
| JWT | Autenticación |
| Cloudinary | Almacenamiento de imágenes |
| Nodemailer | Envío de emails |
| Render | Hosting del API |

---

## 3. Cómo Levantar el Proyecto en Local

### Requisitos

- Node.js v18+ (recomendado v20)
- npm o yarn
- PostgreSQL (opcional si usás Supabase)

### Paso a Paso

```bash
# 1. Clonar repositorio
git clone <url-del-repo>
cd adopcion-api

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (copiar de ejemplo)
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar cliente Prisma y sincronizar BD
npm run build

# 5. Cargar datos de prueba (opcional)
npm run db:seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno (.env)

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos (Supabase o local)
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres

# JWT (string largo aleatorio)
JWT_SECRET=string_de_al_menos_32_caracteres_aleatorios

# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=contraseña_de_aplicacion
ADMIN_EMAIL=email_notificaciones@email.com

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

### Comandos Útiles

```bash
npm run dev          # Servidor con hot reload
npm run build        # Generar Prisma + push schema
npm run db:push      # Solo push schema a BD
npm run db:seed      # Cargar datos de prueba
npm run db:studio    # GUI para ver la BD
```

### Usuario de Prueba (después del seed)

```
Email: admin@adopcion.com
Password: admin123
```

---

## 4. Modelo de Datos

### Diagrama de Entidades

```
Organizacion (1) ─────┬───── (N) Administrador
                      │
                      ├───── (N) Animal ────── (N) SolicitudAdopcion
                      │            │
                      │            └───── (1) CasoExito (opcional)
                      │
                      └───── (N) CasoExito

SolicitudContacto (independiente)
AuditLog (independiente)
```

### Entidades Principales

#### Organizacion
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | Int | Auto | ID único |
| nombre | String(100) | Sí | Nombre del refugio |
| slug | String(50) | Sí, único | URL-friendly identifier |
| email | String(100) | No | Email de contacto |
| telefono | String(20) | No | Teléfono |
| whatsapp | String(20) | No | WhatsApp |
| direccion | String(200) | No | Dirección física |
| logo_url | String(255) | No | URL del logo |
| descripcion | Text | No | Descripción |
| instagram | String(100) | No | @handle |
| facebook | String(100) | No | URL/handle |
| donacion_alias | String(100) | No | Alias MP |
| donacion_cbu | String(30) | No | CBU/CVU |
| donacion_info | Text | No | Info adicional |
| activa | Boolean | Default: true | Estado |

#### Animal
| Campo | Tipo | Requerido | Valores Posibles |
|-------|------|-----------|------------------|
| id | Int | Auto | - |
| nombre | String(100) | Sí | - |
| especie | String(20) | Sí | `"Perro"`, `"Gato"` |
| sexo | String(10) | Sí | `"Macho"`, `"Hembra"` |
| edad_aproximada | String(50) | Sí | "2 años", "6 meses" |
| tamanio | String(20) | Sí | `"Pequeño"`, `"Mediano"`, `"Grande"` |
| raza_mezcla | String(100) | No | - |
| descripcion_historia | Text | Sí (min 50 chars) | - |
| estado_castracion | Boolean | Default: false | - |
| estado_vacunacion | String(200) | No | - |
| estado_desparasitacion | Boolean | Default: false | - |
| socializa_perros | Boolean | Nullable | null = no se sabe |
| socializa_gatos | Boolean | Nullable | null = no se sabe |
| socializa_ninos | Boolean | Nullable | null = no se sabe |
| necesidades_especiales | Text | No | - |
| tipo_hogar_ideal | String(200) | No | - |
| estado | String(20) | Default | `"Disponible"`, `"En proceso"`, `"Adoptado"`, `"En transito"` |
| publicado_por | String(100) | Sí | - |
| contacto_rescatista | String(200) | Sí | - |
| foto_principal | String(255) | Sí | URL |
| foto_2 - foto_5 | String(255) | No | URLs |

#### SolicitudAdopcion
| Campo | Tipo | Requerido | Valores Posibles |
|-------|------|-----------|------------------|
| id | Int | Auto | - |
| animal_id | Int | Sí | FK |
| nombre_completo | String(100) | Sí | - |
| edad | Int | Sí | 18-120 |
| email | String(100) | Sí | - |
| telefono_whatsapp | String(20) | Sí | - |
| instagram | String(100) | No | - |
| ciudad_zona | String(100) | Sí | - |
| tipo_vivienda | String(50) | Sí | `"Casa con patio"`, `"Casa sin patio"`, `"Departamento"`, `"Otro"` |
| vive_solo_acompanado | String(100) | Sí | - |
| todos_de_acuerdo | Boolean | Sí | DEBE ser true |
| tiene_otros_animales | Boolean | Default: false | - |
| otros_animales_castrados | String(50) | Nullable | `"Sí"`, `"No"`, `"Algunos"`, null |
| experiencia_previa | Text | Sí | - |
| puede_cubrir_gastos | Boolean | Sí | - |
| veterinaria_que_usa | String(200) | No | - |
| motivacion | Text | Sí (min 20 chars) | - |
| compromiso_castracion | Boolean | Sí | DEBE ser true |
| acepta_contacto | Boolean | Default: true | - |
| estado_solicitud | String(20) | Default | `"Nueva"`, `"Revisada"`, `"En evaluación"`, `"Aprobada"`, `"Rechazada"` |

---

## 5. Contrato de API Completo

### Base URLs

- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://adopcion-api.onrender.com`

### Formato de Respuestas

```typescript
// Éxito
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Array<{ field: string, message: string }>  // Solo en validación
  }
}
```

---

### AUTH - Autenticación

#### POST /api/auth/login

Iniciar sesión.

**Request:**
```json
{
  "email": "admin@adopcion.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@adopcion.com",
      "es_super_admin": false
    },
    "organizacion": {
      "id": 1,
      "nombre": "Refugio Patitas Felices",
      "slug": "refugio-patitas",
      "logo_url": null
    }
  }
}
```

**Errores:**
- `401` - Credenciales incorrectas
- `403` - Organización desactivada
- `429` - Rate limit (5 intentos/15 min)

---

#### GET /api/auth/me

Obtener datos del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@adopcion.com",
    "es_super_admin": false,
    "organizacion": {
      "id": 1,
      "nombre": "Refugio Patitas Felices",
      "slug": "refugio-patitas"
    }
  }
}
```

---

#### POST /api/auth/logout

Cerrar sesión (informativo).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

### ANIMALS - Animales

#### GET /api/animals

Listar animales con paginación y filtros.

**Query Params:**
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| page | Int | 1 | Página actual |
| limit | Int | 20 | Items por página (max 100) |
| estado | String | - | Filtrar por estado |
| especie | String | - | "Perro" o "Gato" |
| tamanio | String | - | "Pequeño", "Mediano", "Grande" |
| busqueda | String | - | Buscar por nombre |

**Sin autenticación:** Solo devuelve animales con estado "Disponible", "En proceso" o "En transito".

**Con autenticación:** Devuelve todos los animales de la organización del admin.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "animales": [
      {
        "id": 1,
        "nombre": "Luna",
        "especie": "Perro",
        "sexo": "Hembra",
        "edad_aproximada": "2 años",
        "tamanio": "Grande",
        "raza_mezcla": "Labrador Mix",
        "descripcion_historia": "Luna fue rescatada de la calle...",
        "estado_castracion": true,
        "estado_vacunacion": "Al día",
        "estado_desparasitacion": true,
        "socializa_perros": true,
        "socializa_gatos": false,
        "socializa_ninos": true,
        "necesidades_especiales": null,
        "tipo_hogar_ideal": "Casa con patio",
        "estado": "Disponible",
        "publicado_por": "Refugio Patitas",
        "contacto_rescatista": "@refugio_patitas",
        "foto_principal": "https://res.cloudinary.com/...",
        "foto_2": "https://res.cloudinary.com/...",
        "foto_3": null,
        "foto_4": null,
        "foto_5": null,
        "fecha_publicacion": "2024-01-15T10:30:00.000Z",
        "organizacion": {
          "nombre": "Refugio Patitas Felices",
          "slug": "refugio-patitas"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

#### GET /api/animals/:id

Obtener detalle de un animal.

**Sin autenticación:** No devuelve animales con estado "Adoptado".

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Luna",
    "especie": "Perro",
    "sexo": "Hembra",
    "edad_aproximada": "2 años",
    "tamanio": "Grande",
    "raza_mezcla": "Labrador Mix",
    "descripcion_historia": "Luna fue rescatada de la calle cuando tenía apenas 3 meses...",
    "estado_castracion": true,
    "estado_vacunacion": "Al día",
    "estado_desparasitacion": true,
    "socializa_perros": true,
    "socializa_gatos": false,
    "socializa_ninos": true,
    "necesidades_especiales": null,
    "tipo_hogar_ideal": "Casa con patio, familia activa",
    "estado": "Disponible",
    "publicado_por": "Refugio Patitas",
    "contacto_rescatista": "@refugio_patitas",
    "foto_principal": "https://res.cloudinary.com/...",
    "foto_2": "https://res.cloudinary.com/...",
    "foto_3": null,
    "foto_4": null,
    "foto_5": null,
    "fecha_publicacion": "2024-01-15T10:30:00.000Z",
    "organizacion": {
      "nombre": "Refugio Patitas Felices",
      "slug": "refugio-patitas",
      "instagram": "@refugio_patitas",
      "facebook": "facebook.com/refugiopatitas",
      "whatsapp": "1145678900",
      "donacion_alias": "patitas.refugio",
      "donacion_info": "Podés colaborar con alimento o dinero"
    }
  }
}
```

**Errores:**
- `404` - Animal no encontrado (o adoptado si no hay auth)

---

#### POST /api/animals

Crear un animal. **Requiere autenticación.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "nombre": "Firulais",
  "especie": "Perro",
  "sexo": "Macho",
  "edad_aproximada": "3 años",
  "tamanio": "Mediano",
  "raza_mezcla": "Mestizo",
  "descripcion_historia": "Firulais fue encontrado abandonado en un parque. Es muy cariñoso y le encanta jugar. Está buscando una familia que le dé mucho amor.",
  "estado_castracion": true,
  "estado_vacunacion": "Vacunas al día",
  "estado_desparasitacion": true,
  "socializa_perros": true,
  "socializa_gatos": null,
  "socializa_ninos": true,
  "necesidades_especiales": null,
  "tipo_hogar_ideal": "Casa o departamento con paseos diarios",
  "publicado_por": "María García",
  "contacto_rescatista": "@maria_rescata",
  "foto_principal": "https://res.cloudinary.com/xxx/image/upload/v123/adopcion/abc123.jpg",
  "foto_2": "https://res.cloudinary.com/xxx/image/upload/v123/adopcion/def456.jpg"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "nombre": "Firulais",
    "estado": "Disponible",
    "fecha_publicacion": "2024-02-17T15:30:00.000Z"
  }
}
```

**Errores:**
- `400` - Errores de validación
- `401` - No autenticado

---

#### PUT /api/animals/:id

Actualizar un animal. **Requiere autenticación.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:** (campos opcionales, solo enviar los que cambian)
```json
{
  "nombre": "Firulais",
  "descripcion_historia": "Historia actualizada con más de 50 caracteres para cumplir validación..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "nombre": "Firulais",
    "...": "..."
  }
}
```

**Errores:**
- `403` - No pertenece a tu organización
- `404` - Animal no encontrado

---

#### PATCH /api/animals/:id/status

Cambiar estado de un animal. **Requiere autenticación.**

**Request:**
```json
{
  "estado": "En proceso"
}
```

**Estados válidos:** `"Disponible"`, `"En proceso"`, `"Adoptado"`, `"En transito"`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "nombre": "Firulais",
    "estado": "En proceso"
  }
}
```

---

#### DELETE /api/animals/:id

Eliminar animal (soft delete). **Requiere autenticación.**

**Response 200:**
```json
{
  "success": true,
  "message": "Animal eliminado correctamente"
}
```

---

### ADOPTION REQUESTS - Solicitudes de Adopción

#### POST /api/adoption-requests

Enviar solicitud de adopción. **Público.**

**Rate Limit:** 10 solicitudes por hora por IP.

**Request:**
```json
{
  "animal_id": 1,
  "nombre_completo": "Juan Pérez",
  "edad": 28,
  "email": "juan.perez@email.com",
  "telefono_whatsapp": "+54 9 11 1234-5678",
  "instagram": "@juanperez",
  "ciudad_zona": "Palermo, CABA",
  "tipo_vivienda": "Departamento",
  "vive_solo_acompanado": "Con mi pareja",
  "todos_de_acuerdo": true,
  "tiene_otros_animales": false,
  "otros_animales_castrados": null,
  "experiencia_previa": "Tuve perros toda mi vida, el último falleció hace 2 años.",
  "puede_cubrir_gastos": true,
  "veterinaria_que_usa": "Veterinaria San Martín",
  "motivacion": "Estamos buscando un compañero peludo para nuestra familia. Tenemos tiempo, espacio y mucho amor para dar.",
  "compromiso_castracion": true,
  "acepta_contacto": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "animal_id": 1,
    "nombre_completo": "Juan Pérez",
    "fecha_solicitud": "2024-02-17T16:00:00.000Z",
    "estado_solicitud": "Nueva",
    "message": "Tu solicitud fue enviada correctamente. El refugio se pondrá en contacto contigo pronto."
  }
}
```

**Errores:**
- `400` - Errores de validación
- `404` - Animal no encontrado o no disponible
- `409` - Ya existe una solicitud reciente (últimos 7 días) con este email para este animal
- `429` - Rate limit excedido

---

#### GET /api/adoption-requests

Listar solicitudes. **Requiere autenticación.**

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| page | Int | Página |
| limit | Int | Items por página |
| estado_solicitud | String | Filtrar por estado |
| animal_id | Int | Filtrar por animal |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "solicitudes": [
      {
        "id": 15,
        "nombre_completo": "Juan Pérez",
        "email": "juan.perez@email.com",
        "telefono_whatsapp": "+54 9 11 1234-5678",
        "ciudad_zona": "Palermo, CABA",
        "fecha_solicitud": "2024-02-17T16:00:00.000Z",
        "estado_solicitud": "Nueva",
        "animal": {
          "id": 1,
          "nombre": "Luna",
          "especie": "Perro",
          "foto_principal": "https://...",
          "estado": "Disponible"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

---

#### GET /api/adoption-requests/:id

Detalle de una solicitud. **Requiere autenticación.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "nombre_completo": "Juan Pérez",
    "edad": 28,
    "email": "juan.perez@email.com",
    "telefono_whatsapp": "+54 9 11 1234-5678",
    "instagram": "@juanperez",
    "ciudad_zona": "Palermo, CABA",
    "tipo_vivienda": "Departamento",
    "vive_solo_acompanado": "Con mi pareja",
    "todos_de_acuerdo": true,
    "tiene_otros_animales": false,
    "otros_animales_castrados": null,
    "experiencia_previa": "Tuve perros toda mi vida...",
    "puede_cubrir_gastos": true,
    "veterinaria_que_usa": "Veterinaria San Martín",
    "motivacion": "Estamos buscando un compañero peludo...",
    "compromiso_castracion": true,
    "acepta_contacto": true,
    "fecha_solicitud": "2024-02-17T16:00:00.000Z",
    "estado_solicitud": "Nueva",
    "animal": {
      "id": 1,
      "nombre": "Luna",
      "especie": "Perro",
      "foto_principal": "https://..."
    }
  }
}
```

---

#### PATCH /api/adoption-requests/:id

Actualizar estado de solicitud. **Requiere autenticación.**

**Request:**
```json
{
  "estado_solicitud": "En evaluación"
}
```

**Estados válidos:** `"Nueva"`, `"Revisada"`, `"En evaluación"`, `"Aprobada"`, `"Rechazada"`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "estado_solicitud": "En evaluación"
  }
}
```

---

#### GET /api/adoption-requests/stats

Estadísticas de solicitudes. **Requiere autenticación.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "ultimos_7_dias": 8,
    "por_estado": {
      "Nueva": 12,
      "Revisada": 8,
      "En evaluación": 5,
      "Aprobada": 15,
      "Rechazada": 5
    }
  }
}
```

---

### UPLOAD - Subida de Imágenes

#### POST /api/upload

Subir imagen a Cloudinary. **Requiere autenticación.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
| Key | Tipo | Descripción |
|-----|------|-------------|
| image | File | Archivo de imagen |

**Restricciones:**
- Máximo 5 MB
- Formatos: JPEG, JPG, PNG, WEBP
- Se redimensiona automáticamente a máximo 1200px de ancho

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/v1234567890/adopcion/abc123def456.jpg",
    "public_id": "adopcion/abc123def456"
  }
}
```

**Errores:**
- `400 FILE_TOO_LARGE` - Archivo mayor a 5MB
- `400 INVALID_FILE` - Formato no permitido
- `400 NO_FILE` - No se envió archivo

---

#### DELETE /api/upload/:publicId

Eliminar imagen de Cloudinary. **Requiere autenticación.**

**Nota:** El publicId viene con "/" reemplazado por "-". Ejemplo: `adopcion-abc123` en vez de `adopcion/abc123`.

**Response 200:**
```json
{
  "success": true,
  "message": "Imagen eliminada correctamente"
}
```

---

### DASHBOARD - Panel de Control

#### GET /api/dashboard/stats

Estadísticas del dashboard. **Requiere autenticación.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_animales": 45,
      "total_solicitudes": 120,
      "solicitudes_ultimos_7_dias": 15,
      "animales_ultimos_30_dias": 8,
      "tasa_adopcion": 33.3
    },
    "animales_por_estado": {
      "disponible": 30,
      "en_proceso": 5,
      "adoptado": 15,
      "en_transito": 2
    },
    "solicitudes_por_estado": {
      "nueva": 20,
      "revisada": 15,
      "en_evaluacion": 10,
      "aprobada": 65,
      "rechazada": 10
    },
    "fecha_consulta": "2024-02-17T17:00:00.000Z"
  }
}
```

---

### ORGANIZATION - Organización

#### GET /api/organization

Datos de MI organización. **Requiere autenticación.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Refugio Patitas Felices",
    "slug": "refugio-patitas",
    "email": "contacto@patitasfelices.org",
    "telefono": "11-4567-8900",
    "whatsapp": "1145678900",
    "direccion": "Av. San Martín 1234, Buenos Aires",
    "logo_url": null,
    "descripcion": "Somos un refugio dedicado al rescate de perros y gatos...",
    "instagram": "@refugio_patitas",
    "facebook": "facebook.com/refugiopatitas",
    "donacion_alias": "patitas.refugio",
    "donacion_cbu": "0000000000000000000000",
    "donacion_info": "Podés colaborar con alimento, mantas o dinero",
    "activa": true,
    "fecha_creacion": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT /api/organization

Actualizar MI organización. **Requiere autenticación.**

**Request:** (campos opcionales)
```json
{
  "nombre": "Refugio Patitas Felices",
  "email": "nuevo_email@patitas.org",
  "instagram": "@nuevo_instagram",
  "donacion_alias": "nuevo.alias"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Refugio Patitas Felices",
    "...": "..."
  }
}
```

---

#### GET /api/organization/:slug

Datos públicos de una organización por slug. **Público.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Refugio Patitas Felices",
    "slug": "refugio-patitas",
    "telefono": "11-4567-8900",
    "whatsapp": "1145678900",
    "direccion": "Av. San Martín 1234, Buenos Aires",
    "logo_url": null,
    "descripcion": "Somos un refugio dedicado al rescate...",
    "instagram": "@refugio_patitas",
    "facebook": "facebook.com/refugiopatitas",
    "donacion_alias": "patitas.refugio",
    "donacion_info": "Podés colaborar con alimento..."
  }
}
```

**Nota:** No expone email ni CBU completo por seguridad.

---

### CASOS DE ÉXITO

#### GET /api/casos-exito

Listar todos los casos de éxito. **Público.**

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "organizacion": {
        "id": 1,
        "nombre": "Refugio Patitas Felices",
        "slug": "refugio-patitas"
      },
      "casos": [
        {
          "id": 1,
          "titulo": "Luna encontró su hogar",
          "historia": "Luna fue adoptada por la familia García...",
          "fecha_adopcion": "2024-01-20T00:00:00.000Z",
          "fecha_publicacion": "2024-01-25T00:00:00.000Z",
          "foto_actual_1": "https://...",
          "animal": {
            "id": 1,
            "nombre": "Luna",
            "especie": "Perro",
            "foto_principal": "https://..."
          }
        }
      ]
    }
  ]
}
```

---

#### GET /api/casos-exito/:orgSlug

Casos de éxito de una organización. **Público.**

---

#### POST /api/casos-exito

Crear caso de éxito. **Requiere autenticación.**

**Request:**
```json
{
  "animal_id": 1,
  "titulo": "Luna encontró su hogar",
  "historia": "Después de 3 meses en el refugio, Luna fue adoptada por la familia García...",
  "fecha_adopcion": "2024-01-20",
  "foto_actual_1": "https://res.cloudinary.com/..."
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "titulo": "Luna encontró su hogar",
    "fecha_publicacion": "2024-02-17T18:00:00.000Z"
  }
}
```

**Errores:**
- `400` - Ya existe un caso de éxito para este animal
- `404` - Animal no encontrado
- `403` - Animal no pertenece a tu organización

---

### CONTACT REQUESTS - Solicitudes de Contacto (Rescatistas)

#### POST /api/contact-requests

Rescatista solicita unirse a la plataforma. **Público.**

**Rate Limit:** 5 solicitudes por día por IP.

**Request:**
```json
{
  "nombre_refugio": "Patitas al Rescate",
  "nombre_contacto": "María García",
  "email": "maria@patitasalrescate.org",
  "telefono": "11-9876-5432",
  "ciudad": "Córdoba",
  "descripcion": "Somos un grupo de rescatistas que trabaja desde hace 5 años...",
  "instagram": "@patitas_rescate",
  "facebook": "facebook.com/patitasalrescate",
  "cantidad_animales": "Aproximadamente 30 animales"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "message": "Tu solicitud fue enviada. Nos pondremos en contacto pronto."
  }
}
```

---

### SUPER ADMIN - Administración Global

> Estos endpoints requieren autenticación + rol `es_super_admin: true`

#### GET /api/super-admin/organizations

Listar todas las organizaciones.

#### POST /api/super-admin/organizations

Crear nueva organización + admin.

**Request:**
```json
{
  "nombre": "Nuevo Refugio",
  "admin_username": "nuevo_admin",
  "admin_email": "admin@nuevorefugio.org",
  "admin_password": "Password123",
  "email": "contacto@nuevorefugio.org",
  "telefono": "11-1111-1111"
}
```

**Política de contraseña:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número

#### PUT /api/super-admin/organizations/:id/toggle

Activar/desactivar organización.

#### DELETE /api/super-admin/organizations/:id

Eliminar organización y todos sus datos (cascada).

#### GET /api/super-admin/contact-requests

Listar solicitudes de contacto.

#### PUT /api/super-admin/contact-requests/:id

Actualizar solicitud de contacto.

---

## 6. Autenticación - Guía para Frontend

### Flujo de Login

```typescript
// 1. Hacer login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.success) {
  // 2. Guardar token en localStorage (o donde prefieras)
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('admin', JSON.stringify(data.data.admin));
  localStorage.setItem('organizacion', JSON.stringify(data.data.organizacion));
}
```

### Enviar Token en Requests Autenticados

```typescript
// Usar el token en cada request que requiera autenticación
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/animals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // <-- Así se envía el token
  },
  body: JSON.stringify(animalData)
});
```

### Manejar Expiración del Token

El token expira en 24 horas. Cuando expire, recibirás un error 401:

```typescript
// En tu fetch wrapper o interceptor
if (response.status === 401) {
  // Token expirado o inválido
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  localStorage.removeItem('organizacion');

  // Redirigir a login
  window.location.href = '/login';
}
```

### Verificar Rol de Usuario

```typescript
const admin = JSON.parse(localStorage.getItem('admin'));

if (admin.es_super_admin) {
  // Mostrar opciones de super admin
} else {
  // Mostrar opciones normales
}
```

### Datos del Token (payload JWT)

```typescript
// El token contiene estos datos (decodificados):
{
  "id": 1,
  "email": "admin@adopcion.com",
  "username": "admin",
  "organizacion_id": 1,
  "es_super_admin": false,
  "iat": 1709300000,  // Timestamp de creación
  "exp": 1709386400   // Timestamp de expiración
}
```

---

## 7. Subida de Imágenes

### Flujo Completo

```typescript
// 1. Crear FormData con la imagen
const formData = new FormData();
formData.append('image', file);  // 'file' es un objeto File del input

// 2. Subir a través del endpoint
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // NO poner Content-Type, el browser lo maneja con FormData
  },
  body: formData
});

const data = await response.json();

if (data.success) {
  // 3. Usar la URL retornada para crear el animal
  const imageUrl = data.data.url;
  // Guardar también el public_id por si necesitás eliminar después
  const publicId = data.data.public_id;
}
```

### Ejemplo con Input File

```html
<input type="file" id="imageInput" accept="image/jpeg,image/png,image/webp" />
```

```typescript
const input = document.getElementById('imageInput');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];

  // Validar tamaño antes de subir
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no puede superar 5MB');
    return;
  }

  // Subir...
});
```

### Restricciones

| Restricción | Valor |
|-------------|-------|
| Tamaño máximo | 5 MB |
| Formatos | JPEG, JPG, PNG, WEBP |
| Transformación | Máx 1200px ancho, calidad auto |

---

## 8. Paginación, Filtros y Búsqueda

### Paginación

Todos los endpoints de listado soportan paginación:

```
GET /api/animals?page=2&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "animales": [...],
    "pagination": {
      "total": 45,
      "page": 2,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### Filtros Disponibles

**GET /api/animals**
| Filtro | Tipo | Valores |
|--------|------|---------|
| estado | String | Disponible, En proceso, Adoptado, En transito |
| especie | String | Perro, Gato |
| tamanio | String | Pequeño, Mediano, Grande |
| busqueda | String | Búsqueda por nombre (case-insensitive) |

**GET /api/adoption-requests**
| Filtro | Tipo | Valores |
|--------|------|---------|
| estado_solicitud | String | Nueva, Revisada, En evaluación, Aprobada, Rechazada |
| animal_id | Int | ID del animal |

### Ejemplo de Uso

```typescript
// Buscar perros grandes disponibles
const params = new URLSearchParams({
  especie: 'Perro',
  tamanio: 'Grande',
  estado: 'Disponible',
  page: '1',
  limit: '20'
});

const response = await fetch(`http://localhost:3000/api/animals?${params}`);
```

---

## 9. Manejo de Errores desde el Front

### Formato de Errores

```typescript
// Error genérico
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Animal no encontrado"
  }
}

// Error de validación
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Errores de validación",
    "details": [
      { "field": "nombre", "message": "El nombre es obligatorio" },
      { "field": "email", "message": "El email no es válido" }
    ]
  }
}
```

### Códigos HTTP

| Código | Significado | Acción Sugerida |
|--------|-------------|-----------------|
| 200 | OK | Mostrar datos |
| 201 | Creado | Mostrar mensaje de éxito, redirigir |
| 400 | Datos inválidos | Mostrar errores de validación |
| 401 | No autenticado | Redirigir a login |
| 403 | Sin permisos | Mostrar mensaje "acceso denegado" |
| 404 | No encontrado | Mostrar mensaje o redirigir |
| 409 | Conflicto | Mostrar mensaje específico |
| 429 | Rate limit | Mostrar "intenta más tarde" |
| 500 | Error servidor | Mostrar error genérico |

### Ejemplo de Manejo

```typescript
async function handleApiResponse(response) {
  const data = await response.json();

  if (!data.success) {
    switch (data.error.code) {
      case 'VALIDATION_ERROR':
        // Mostrar errores por campo
        data.error.details.forEach(err => {
          showFieldError(err.field, err.message);
        });
        break;

      case 'INVALID_TOKEN':
      case 'NO_TOKEN':
        // Redirigir a login
        logout();
        break;

      case 'RATE_LIMIT':
        showToast('Demasiados intentos. Esperá un momento.');
        break;

      default:
        showToast(data.error.message);
    }
    return null;
  }

  return data.data;
}
```

---

## 10. Documentación Swagger

### URLs

- **Local:** http://localhost:3000/api-docs
- **Producción:** https://adopcion-api.onrender.com/api-docs

### Cómo Usar

1. Abrí la URL en el navegador
2. Explorá los endpoints por categoría
3. Para probar endpoints protegidos:
   - Primero hacé login en `/api/auth/login`
   - Copiá el token de la respuesta
   - Clickeá "Authorize" (candado verde arriba a la derecha)
   - Pegá el token (sin "Bearer ")
   - Ahora podés probar endpoints protegidos

---

## 11. Notas Importantes

### Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| General | 100 requests | 15 minutos |
| POST /api/auth/login | 5 intentos | 15 minutos |
| POST /api/adoption-requests | 10 solicitudes | 1 hora |
| POST /api/contact-requests | 5 solicitudes | 1 día |

**Respuesta cuando excedés el límite:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Demasiadas solicitudes. Intenta de nuevo más tarde."
  }
}
```

---

### CORS

El backend acepta requests desde:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000`
- `https://adopcion-responsable.vercel.app`
- Cualquier subdominio de Vercel que contenga "adopcion-responsable"
- La URL configurada en `FRONTEND_URL`

Si tenés problemas de CORS, verificá que tu origen esté permitido.

---

### Render - Tiempo de Arranque

El plan gratuito de Render "duerme" el servidor después de 15 minutos de inactividad. El primer request después de inactividad puede tardar ~30 segundos en responder mientras el servidor arranca.

**Sugerencia:** Implementar un loading spinner o skeleton para el primer request.

---

### Soft Delete de Animales

Cuando un animal se elimina, no desaparece de la base de datos. Se marca con `deleted_at`. Esto significa:
- Las solicitudes de adopción del animal siguen existiendo
- Los casos de éxito del animal siguen existiendo
- El animal no aparece en listados

---

### Duplicación de Solicitudes de Adopción

El sistema previene duplicados: si alguien ya envió una solicitud para el mismo animal con el mismo email en los últimos 7 días, recibe error 409.

Después de 7 días, la solicitud anterior se elimina automáticamente y puede enviar una nueva.

---

### Validaciones que DEBEN ser True

En el formulario de adopción, estos campos DEBEN ser `true`:
- `todos_de_acuerdo` - Todos en el hogar deben estar de acuerdo
- `compromiso_castracion` - Debe comprometerse a castrar si no está castrado

Si envías `false`, recibirás error de validación.

---

### Campos Nullable vs Optional

- **Nullable (`null`):** El campo puede ser explícitamente `null`. Ejemplo: `socializa_perros` puede ser `true`, `false` o `null` (no se sabe).
- **Optional:** El campo se puede omitir en el request. Si se omite, usa el valor por defecto.

---

### Timestamps

Todos los timestamps están en **UTC** (ISO 8601). Convertí a hora local en el frontend:

```typescript
const fecha = new Date(animal.fecha_publicacion);
const fechaLocal = fecha.toLocaleDateString('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

---

### Estados de Animales - Visibilidad Pública

| Estado | Visible sin auth | Visible con auth |
|--------|------------------|------------------|
| Disponible | ✅ | ✅ |
| En proceso | ✅ | ✅ |
| En transito | ✅ | ✅ |
| Adoptado | ❌ | ✅ |

---

### 📌 DECISIONES PENDIENTES

1. **Notificaciones al adoptante:** Actualmente solo se notifica a la organización. ¿El adoptante debería recibir email de confirmación?

2. **Reset de contraseña:** No hay endpoint para recuperar contraseña. ¿Se implementa?

3. **Refresh Token:** El token expira en 24h sin forma de renovarlo. ¿Se implementa refresh token o se extiende la duración?

4. **Eliminación de cuenta:** No hay forma de que un admin elimine su propia cuenta. ¿Se agrega?

---

## Contacto

Si tenés dudas sobre el backend, consultá con Facundo o revisá el código fuente.

Documentación Swagger siempre actualizada en: https://adopcion-api.onrender.com/api-docs
