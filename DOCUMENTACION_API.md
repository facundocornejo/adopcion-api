# API Adopción de Animales - Documentación Completa

## Información General

| Campo | Valor |
|-------|-------|
| **URL Base Producción** | `https://adopcion-api.onrender.com` |
| **Swagger UI** | https://adopcion-api.onrender.com/api-docs |
| **Versión** | 1.0.0 |
| **Autenticación** | JWT Bearer Token (24h) |

---

## Arquitectura

### Multi-tenant
Cada organización/refugio tiene sus propios:
- Administradores
- Animales
- Solicitudes de adopción
- Casos de éxito

### Roles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Público** | Cualquier visitante | Ver animales, enviar solicitudes de adopción |
| **Admin** | Administrador de una organización | Gestionar animales y solicitudes de SU organización |
| **Super Admin** | Administrador global | Gestionar TODAS las organizaciones |

---

## Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@refugio.com",
  "password": "miPassword123"
}
```

### Respuesta exitosa
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": 1,
      "username": "admin_patitas",
      "email": "admin@patitas.org",
      "es_super_admin": false,
      "organizacion": {
        "id": 1,
        "nombre": "Refugio Patitas Felices",
        "slug": "patitas-felices"
      }
    }
  }
}
```

### Usar el token
Para endpoints protegidos, incluir el header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/me` | Datos del admin autenticado | Sí |

---

### Animales
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/animals` | Listar animales | No* |
| GET | `/api/animals/:id` | Obtener un animal | No* |
| POST | `/api/animals` | Crear animal | Sí |
| PUT | `/api/animals/:id` | Actualizar animal | Sí |
| PATCH | `/api/animals/:id/status` | Cambiar estado | Sí |
| DELETE | `/api/animals/:id` | Eliminar (soft delete) | Sí |

*Sin auth: solo ve Disponible, En proceso, En transito. Con auth: ve todos los de su org.

#### Filtros GET /api/animals
| Parámetro | Tipo | Valores | Descripción |
|-----------|------|---------|-------------|
| `estado` | string | Disponible, En proceso, Adoptado, En transito | Filtrar por estado |
| `especie` | string | Perro, Gato | Filtrar por especie |
| `tamanio` | string | Pequeño, Mediano, Grande | Filtrar por tamaño |
| `busqueda` | string | cualquier texto | Buscar por nombre |
| `page` | integer | 1+ | Página (default: 1) |
| `limit` | integer | 1-100 | Por página (default: 20) |

#### Ejemplo con filtros
```bash
GET /api/animals?especie=Perro&estado=Disponible&tamanio=Mediano&page=1&limit=10
```

#### Respuesta paginada
```json
{
  "success": true,
  "data": {
    "animals": [...],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Solicitudes de Adopción
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/adoption-requests` | Crear solicitud (formulario público) | No |
| GET | `/api/adoption-requests` | Listar solicitudes | Sí |
| GET | `/api/adoption-requests/stats` | Estadísticas | Sí |
| GET | `/api/adoption-requests/:id` | Obtener una solicitud | Sí |
| PATCH | `/api/adoption-requests/:id` | Cambiar estado | Sí |
| DELETE | `/api/adoption-requests/:id` | Eliminar | Sí |

#### Estados de solicitud
- `Nueva` - Recién enviada
- `Revisada` - Admin la vio
- `En evaluación` - En proceso de evaluación
- `Aprobada` - Adopción aprobada
- `Rechazada` - Adopción rechazada

---

### Organización
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/organization` | Mi organización | Sí |
| PUT | `/api/organization` | Actualizar mi org | Sí |
| GET | `/api/organization/:slug` | Org pública por slug | No |

---

### Dashboard
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/stats` | Estadísticas del admin | Sí |

#### Respuesta
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_animales": 25,
      "total_solicitudes": 48,
      "adopciones_completadas": 12
    },
    "animales_por_estado": {
      "Disponible": 15,
      "En proceso": 5,
      "Adoptado": 12,
      "En transito": 3
    },
    "solicitudes_por_estado": {
      "Nueva": 10,
      "Revisada": 8,
      "En evaluación": 5,
      "Aprobada": 20,
      "Rechazada": 5
    }
  }
}
```

---

### Casos de Éxito
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/casos-exito` | Todos los casos agrupados | No |
| GET | `/api/casos-exito/:orgSlug` | Casos de una org | No |
| POST | `/api/casos-exito` | Crear caso | Sí |
| PUT | `/api/casos-exito/:id` | Actualizar caso | Sí |
| DELETE | `/api/casos-exito/:id` | Eliminar caso | Sí |

---

### Upload (Imágenes)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Subir imagen | Sí |
| DELETE | `/api/upload/:publicId` | Eliminar imagen | Sí |

#### Subir imagen
```bash
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <archivo de imagen>
```

**Formatos permitidos:** JPG, JPEG, PNG, WEBP
**Tamaño máximo:** 5MB

#### Respuesta
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/v123/animals/abc123.jpg",
    "public_id": "animals/abc123"
  }
}
```

---

### Contacto (Solicitudes de rescatistas)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/contact-requests` | Enviar solicitud | No |

---

### Super Admin
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/super-admin/organizations` | Listar todas las orgs | Super Admin |
| POST | `/api/super-admin/organizations` | Crear org + admin | Super Admin |
| PUT | `/api/super-admin/organizations/:id/toggle` | Activar/desactivar org | Super Admin |
| DELETE | `/api/super-admin/organizations/:id` | Eliminar org | Super Admin |
| GET | `/api/super-admin/contact-requests` | Listar solicitudes contacto | Super Admin |
| PUT | `/api/super-admin/contact-requests/:id` | Actualizar solicitud | Super Admin |

---

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error interno |

### Formato de error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email es requerido"
  }
}
```

### Códigos de error comunes
| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Datos inválidos |
| `UNAUTHORIZED` | No autenticado |
| `FORBIDDEN` | Sin permisos |
| `NOT_FOUND` | No encontrado |
| `DUPLICATE_REQUEST` | Solicitud duplicada |
| `SERVER_ERROR` | Error del servidor |

---

## Modelos de Datos

### Animal
```typescript
{
  id: number;
  nombre: string;
  especie: "Perro" | "Gato";
  sexo: "Macho" | "Hembra";
  edad_aproximada: string;
  tamanio: "Pequeño" | "Mediano" | "Grande";
  raza_mezcla?: string;
  descripcion_historia: string;
  estado_castracion: boolean;
  estado_vacunacion?: string;
  estado_desparasitacion: boolean;
  socializa_perros: boolean;
  socializa_gatos: boolean;
  socializa_ninos: boolean;
  necesidades_especiales?: string;
  tipo_hogar_ideal?: string;
  estado: "Disponible" | "En proceso" | "Adoptado" | "En transito";
  publicado_por: string;
  contacto_rescatista: string;
  foto_principal: string;
  foto_2?: string;
  foto_3?: string;
  foto_4?: string;
  foto_5?: string;
  fecha_publicacion: Date;
  organizacion: {
    id: number;
    nombre: string;
    slug: string;
  }
}
```

### Solicitud de Adopción
```typescript
{
  id: number;
  animal_id: number;
  nombre_completo: string;
  edad: number; // mínimo 18
  email: string;
  telefono_whatsapp: string;
  instagram?: string;
  ciudad_zona: string;
  tipo_vivienda: "Casa con patio" | "Casa sin patio" | "Departamento" | "Otro";
  vive_solo_acompanado: string;
  todos_de_acuerdo: boolean;
  tiene_otros_animales: boolean;
  otros_animales_castrados?: "Sí" | "No" | "Algunos" | "No aplica";
  experiencia_previa: string;
  puede_cubrir_gastos: boolean;
  veterinaria_que_usa?: string;
  motivacion: string;
  compromiso_castracion: boolean;
  acepta_contacto: boolean;
  fecha_solicitud: Date;
  estado_solicitud: "Nueva" | "Revisada" | "En evaluación" | "Aprobada" | "Rechazada";
}
```

### Organización
```typescript
{
  id: number;
  nombre: string;
  slug: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
  descripcion?: string;
  logo_url?: string;
  instagram?: string;
  facebook?: string;
  donacion_alias?: string;
  donacion_cbu?: string;
  donacion_info?: string;
  activa: boolean;
  fecha_creacion: Date;
}
```

---

## Ejemplos de Uso

### 1. Flujo público: Ver animales y adoptar

```bash
# 1. Listar perros disponibles
GET /api/animals?especie=Perro&estado=Disponible

# 2. Ver detalle de un animal
GET /api/animals/5

# 3. Enviar solicitud de adopción
POST /api/adoption-requests
{
  "animal_id": 5,
  "nombre_completo": "Juan Pérez",
  "edad": 28,
  "email": "juan@email.com",
  "telefono_whatsapp": "+54 9 343 555-1234",
  "ciudad_zona": "Paraná, Entre Ríos",
  "tipo_vivienda": "Casa con patio",
  "vive_solo_acompanado": "Con familia",
  "todos_de_acuerdo": true,
  "tiene_otros_animales": false,
  "experiencia_previa": "Tuve perros toda mi vida",
  "puede_cubrir_gastos": true,
  "motivacion": "Quiero darle un hogar a un animalito",
  "compromiso_castracion": true
}
```

### 2. Flujo admin: Gestionar animales

```bash
# 1. Login
POST /api/auth/login
{ "email": "admin@refugio.com", "password": "123456" }
# Guardar el token de la respuesta

# 2. Subir foto
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
file: <imagen.jpg>
# Guardar la URL de la respuesta

# 3. Crear animal
POST /api/animals
Authorization: Bearer <token>
{
  "nombre": "Luna",
  "especie": "Perro",
  "sexo": "Hembra",
  "edad_aproximada": "2 años",
  "tamanio": "Mediano",
  "descripcion_historia": "Luna fue rescatada de la calle...",
  "publicado_por": "Refugio Patitas",
  "contacto_rescatista": "@patitas",
  "foto_principal": "<url de la imagen subida>"
}

# 4. Ver solicitudes
GET /api/adoption-requests
Authorization: Bearer <token>

# 5. Aprobar solicitud
PATCH /api/adoption-requests/10
Authorization: Bearer <token>
{ "estado_solicitud": "Aprobada" }

# 6. Cambiar estado del animal
PATCH /api/animals/5/status
Authorization: Bearer <token>
{ "estado": "Adoptado" }
```

---

## Notas Importantes

1. **Soft Delete**: Los animales no se eliminan realmente, se marcan con `deleted_at`
2. **Paginación**: Por defecto 20 items, máximo 100
3. **Imágenes**: Se guardan en Cloudinary
4. **Token JWT**: Expira en 24 horas, hacer login nuevamente
5. **Multi-tenant**: Cada admin solo ve datos de su organización

---

## Links Útiles

- **Swagger UI**: https://adopcion-api.onrender.com/api-docs
- **API Base**: https://adopcion-api.onrender.com
