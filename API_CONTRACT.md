# API_CONTRACT.md - Contrato de la API

## Información General

- **Base URL desarrollo:** `http://localhost:3000/api`
- **Base URL producción:** `https://tu-app.onrender.com/api`
- **Formato:** JSON
- **Autenticación:** Bearer Token (JWT)

---

## Convenciones

### Headers Requeridos
```
Content-Type: application/json
```

### Headers para Rutas Protegidas
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Formato de Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... }
}
```

### Formato de Respuesta con Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error"
  }
}
```

### Formato de Fechas
ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
Ejemplo: `2025-12-15T14:30:00.000Z`

---

## AUTENTICACIÓN

### POST /api/auth/login
Iniciar sesión como administrador.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "tu_password"
}
```

**Response 200 (éxito):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

**Response 401 (credenciales inválidas):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email o contraseña incorrectos"
  }
}
```

---

### POST /api/auth/logout
Cerrar sesión (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

---

## ANIMALES

### GET /api/animals
Obtener lista de animales. Público ve solo Disponible/En proceso/En transito. Admin ve todos.

**Query Parameters (opcionales):**
| Param | Tipo | Descripción |
|-------|------|-------------|
| estado | string | Filtrar por estado |
| especie | string | Filtrar por 'Perro' o 'Gato' |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "animals": [
      {
        "id": 1,
        "nombre": "Firulais",
        "especie": "Perro",
        "sexo": "Macho",
        "edad_aproximada": "2 años",
        "tamanio": "Mediano",
        "estado": "Disponible",
        "foto_principal": "https://res.cloudinary.com/xxx/image/upload/v123/firulais_1.jpg",
        "fecha_publicacion": "2025-12-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "nombre": "Luna",
        "especie": "Gato",
        "sexo": "Hembra",
        "edad_aproximada": "6 meses",
        "tamanio": "Pequeño",
        "estado": "En proceso",
        "foto_principal": "https://res.cloudinary.com/xxx/image/upload/v123/luna_1.jpg",
        "fecha_publicacion": "2025-12-05T15:30:00.000Z"
      }
    ],
    "total": 2
  }
}
```

---

### GET /api/animals/:id
Obtener detalle completo de un animal.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": 1,
      "nombre": "Firulais",
      "especie": "Perro",
      "sexo": "Macho",
      "edad_aproximada": "2 años",
      "tamanio": "Mediano",
      "raza_mezcla": "Mestizo",
      "descripcion_historia": "Firulais fue rescatado de la calle en octubre de 2025. Lo encontramos en muy mal estado, desnutrido y con heridas. Después de 2 meses de recuperación, hoy es un perro alegre y juguetón que busca una familia que lo ame.",
      "estado_castracion": true,
      "estado_vacunacion": "Completo - Antirrábica y Séxtuple",
      "estado_desparasitacion": true,
      "socializa_perros": true,
      "socializa_gatos": false,
      "socializa_ninos": true,
      "necesidades_especiales": null,
      "tipo_hogar_ideal": "Casa con patio o departamento grande. Necesita espacio para jugar.",
      "estado": "Disponible",
      "publicado_por": "Salvando Patitas",
      "contacto_rescatista": "@salvandopatitas - 3434123456",
      "foto_principal": "https://res.cloudinary.com/xxx/image/upload/v123/firulais_1.jpg",
      "foto_2": "https://res.cloudinary.com/xxx/image/upload/v123/firulais_2.jpg",
      "foto_3": "https://res.cloudinary.com/xxx/image/upload/v123/firulais_3.jpg",
      "foto_4": null,
      "foto_5": null,
      "fecha_publicacion": "2025-12-01T10:00:00.000Z",
      "fecha_actualizacion": "2025-12-10T08:00:00.000Z"
    }
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Animal no encontrado"
  }
}
```

---

### POST /api/animals
Crear nuevo animal (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "nombre": "Rocky",
  "especie": "Perro",
  "sexo": "Macho",
  "edad_aproximada": "3 años",
  "tamanio": "Grande",
  "raza_mezcla": "Pitbull mestizo",
  "descripcion_historia": "Rocky fue rescatado de una situación de maltrato...",
  "estado_castracion": false,
  "estado_vacunacion": "Pendiente refuerzo antirrábica",
  "estado_desparasitacion": true,
  "socializa_perros": true,
  "socializa_gatos": false,
  "socializa_ninos": false,
  "necesidades_especiales": "Necesita un dueño con experiencia en la raza",
  "tipo_hogar_ideal": "Casa con patio cerrado, sin niños pequeños",
  "publicado_por": "Rock My Dogs",
  "contacto_rescatista": "@rockmydogs - 3434987654",
  "foto_principal": "https://res.cloudinary.com/xxx/image/upload/v123/rocky_1.jpg",
  "foto_2": "https://res.cloudinary.com/xxx/image/upload/v123/rocky_2.jpg",
  "foto_3": null,
  "foto_4": null,
  "foto_5": null
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": 3,
      "nombre": "Rocky",
      "estado": "Disponible",
      "fecha_publicacion": "2025-12-15T14:00:00.000Z"
    },
    "message": "Animal creado correctamente"
  }
}
```

**Response 400 (validación):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Errores de validación",
    "details": [
      { "field": "nombre", "message": "El nombre es obligatorio" },
      { "field": "foto_principal", "message": "Debe incluir al menos una foto" }
    ]
  }
}
```

---

### PUT /api/animals/:id
Actualizar animal completo (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** (mismo formato que POST, todos los campos)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "animal": { ... },
    "message": "Animal actualizado correctamente"
  }
}
```

---

### PATCH /api/animals/:id/status
Cambiar solo el estado del animal (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "estado": "Adoptado"
}
```

**Valores permitidos para estado:**
- `Disponible`
- `En proceso`
- `Adoptado`
- `En transito`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": 1,
      "nombre": "Firulais",
      "estado": "Adoptado"
    },
    "message": "Estado actualizado correctamente"
  }
}
```

---

### DELETE /api/animals/:id
Eliminar animal (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Animal eliminado correctamente"
  }
}
```

---

## SOLICITUDES DE ADOPCIÓN

### POST /api/adoption-requests
Enviar solicitud de adopción (público, sin autenticación).

**Request:**
```json
{
  "animal_id": 1,
  "nombre_completo": "Juan Pérez",
  "edad": 28,
  "email": "juan.perez@gmail.com",
  "telefono_whatsapp": "3434567890",
  "instagram": "@juanperez",
  "ciudad_zona": "Paraná Centro",
  "tipo_vivienda": "Casa con patio",
  "vive_solo_acompanado": "Con familia (4 personas)",
  "todos_de_acuerdo": true,
  "tiene_otros_animales": true,
  "otros_animales_castrados": "Sí",
  "experiencia_previa": "Tuve un perro durante 10 años, falleció de viejo el año pasado. También tengo un gato actualmente.",
  "puede_cubrir_gastos": true,
  "veterinaria_que_usa": "Veterinaria San Roque - Av. Almafuerte 234",
  "motivacion": "Queremos darle un hogar a Firulais porque creemos que sería un gran compañero para nuestra familia. Tenemos experiencia con perros y el espacio necesario.",
  "compromiso_castracion": true,
  "acepta_contacto": true
}
```

**Tipos de vivienda válidos:**
- `Casa con patio`
- `Casa sin patio`
- `Departamento`
- `Otro`

**Valores para otros_animales_castrados:**
- `Sí`
- `No`
- `Algunos`
- `null` (si tiene_otros_animales es false)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "request_id": 15,
    "message": "Solicitud enviada correctamente. El rescatista se pondrá en contacto contigo."
  }
}
```

**Response 400 (validación):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Errores de validación",
    "details": [
      { "field": "edad", "message": "Debes ser mayor de 18 años para adoptar" },
      { "field": "compromiso_castracion", "message": "Debes aceptar el compromiso de castración" }
    ]
  }
}
```

---

### GET /api/adoption-requests
Listar todas las solicitudes (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (opcionales):**
| Param | Tipo | Descripción |
|-------|------|-------------|
| estado | string | Filtrar por estado_solicitud |
| animal_id | number | Filtrar por animal |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 15,
        "animal_id": 1,
        "animal_nombre": "Firulais",
        "nombre_completo": "Juan Pérez",
        "email": "juan.perez@gmail.com",
        "telefono_whatsapp": "3434567890",
        "fecha_solicitud": "2025-12-15T16:00:00.000Z",
        "estado_solicitud": "Nueva"
      },
      {
        "id": 14,
        "animal_id": 1,
        "animal_nombre": "Firulais",
        "nombre_completo": "María García",
        "email": "maria.garcia@gmail.com",
        "telefono_whatsapp": "3434111222",
        "fecha_solicitud": "2025-12-14T10:00:00.000Z",
        "estado_solicitud": "Revisada"
      }
    ],
    "total": 2
  }
}
```

---

### GET /api/adoption-requests/:id
Ver detalle completo de una solicitud (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 15,
      "animal": {
        "id": 1,
        "nombre": "Firulais",
        "foto_principal": "https://..."
      },
      "nombre_completo": "Juan Pérez",
      "edad": 28,
      "email": "juan.perez@gmail.com",
      "telefono_whatsapp": "3434567890",
      "instagram": "@juanperez",
      "ciudad_zona": "Paraná Centro",
      "tipo_vivienda": "Casa con patio",
      "vive_solo_acompanado": "Con familia (4 personas)",
      "todos_de_acuerdo": true,
      "tiene_otros_animales": true,
      "otros_animales_castrados": "Sí",
      "experiencia_previa": "Tuve un perro durante 10 años...",
      "puede_cubrir_gastos": true,
      "veterinaria_que_usa": "Veterinaria San Roque - Av. Almafuerte 234",
      "motivacion": "Queremos darle un hogar a Firulais...",
      "compromiso_castracion": true,
      "acepta_contacto": true,
      "fecha_solicitud": "2025-12-15T16:00:00.000Z",
      "estado_solicitud": "Nueva"
    }
  }
}
```

---

### PATCH /api/adoption-requests/:id
Actualizar estado de solicitud (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "estado_solicitud": "Revisada"
}
```

**Estados válidos:**
- `Nueva`
- `Revisada`
- `En evaluación`
- `Aprobada`
- `Rechazada`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 15,
      "estado_solicitud": "Revisada"
    },
    "message": "Estado actualizado correctamente"
  }
}
```

---

## UTILIDADES

### POST /api/upload
Subir imagen a Cloudinary (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (form-data):**
```
file: [archivo de imagen]
```

**Restricciones:**
- Formatos: JPG, JPEG, PNG, WEBP
- Tamaño máximo: 5MB

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/v1702654321/adopcion/abc123.jpg",
    "public_id": "adopcion/abc123"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "El archivo debe ser una imagen (JPG, PNG, WEBP) de máximo 5MB"
  }
}
```

---

### GET /api/dashboard/stats
Estadísticas para el dashboard admin (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "animals": {
      "total": 15,
      "by_status": {
        "Disponible": 8,
        "En proceso": 3,
        "Adoptado": 3,
        "En transito": 1
      },
      "by_species": {
        "Perro": 10,
        "Gato": 5
      }
    },
    "requests": {
      "total": 25,
      "pending": 5,
      "by_status": {
        "Nueva": 5,
        "Revisada": 8,
        "En evaluación": 4,
        "Aprobada": 6,
        "Rechazada": 2
      }
    }
  }
}
```

---

## CÓDIGOS DE ERROR

| Código HTTP | Error Code | Descripción |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Datos inválidos en el request |
| 400 | INVALID_FILE | Archivo no permitido |
| 401 | INVALID_CREDENTIALS | Email/password incorrectos |
| 401 | INVALID_TOKEN | Token JWT inválido o expirado |
| 401 | NO_TOKEN | No se envió token |
| 403 | FORBIDDEN | Sin permisos para esta acción |
| 404 | NOT_FOUND | Recurso no encontrado |
| 409 | CONFLICT | Conflicto (ej: email ya existe) |
| 500 | SERVER_ERROR | Error interno del servidor |

---

## NOTAS PARA EL FRONTEND

1. **Token:** Guardalo en localStorage o sessionStorage. Envialo en CADA request a rutas protegidas.

2. **Expiración:** El token expira en 24h. Si recibís 401, redirigí al login.

3. **Imágenes:** Primero subí a `/api/upload`, después usá la URL devuelta para crear/editar animal.

4. **Validaciones:** Aunque el frontend valide, el backend puede devolver errores. Mostrá los mensajes de `details`.

5. **Loading states:** Las operaciones pueden tardar. Mostrá feedback al usuario.

6. **CORS:** En desarrollo, el backend está configurado para aceptar requests desde `http://localhost:5173`.
