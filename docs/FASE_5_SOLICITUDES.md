# FASE 5: Solicitudes de Adopción - Explicación Completa

## Resumen de la Fase

En esta fase implementamos el sistema de solicitudes de adopción. Los usuarios pueden enviar formularios para adoptar animales, y los administradores pueden gestionar estas solicitudes.

**Fecha:** 19 de Diciembre 2025
**Estado:** Completada

---

## ¿Qué es una solicitud de adopción?

Es el formulario que completa una persona interesada en adoptar un animal. Contiene:
- Datos personales del solicitante
- Información sobre su vivienda y estilo de vida
- Experiencia previa con animales
- Motivación para adoptar
- Compromisos que acepta

---

## Archivos creados

```
src/
├── controllers/
│   └── adoption.controller.js    # Lógica CRUD de solicitudes
└── routes/
    └── adoption.routes.js        # Definición de endpoints
```

## Archivos modificados

```
src/app.js                        # Se conectaron las rutas
src/middlewares/validators.js     # Ya tenía las validaciones (fase anterior)
```

---

## Endpoints implementados

| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| POST | /api/adoption-requests | No | Enviar solicitud de adopción |
| GET | /api/adoption-requests | Sí | Listar todas las solicitudes |
| GET | /api/adoption-requests/stats | Sí | Estadísticas de solicitudes |
| GET | /api/adoption-requests/:id | Sí | Ver detalle de solicitud |
| PATCH | /api/adoption-requests/:id | Sí | Cambiar estado de solicitud |
| DELETE | /api/adoption-requests/:id | Sí | Eliminar solicitud |

---

## Explicación de cada función

### 1. `createAdoptionRequest` - Enviar solicitud (PÚBLICO)

```javascript
const createAdoptionRequest = async (req, res) => {
  // 1. Extraer datos del formulario
  const { animal_id, nombre_completo, ... } = req.body;

  // 2. Verificar que el animal existe
  const animal = await prisma.animal.findUnique({
    where: { id: parseInt(animal_id) }
  });

  // 3. Verificar que está disponible
  if (!['Disponible', 'En proceso', 'En transito'].includes(animal.estado)) {
    return res.status(400).json({ error: 'ANIMAL_NOT_AVAILABLE' });
  }

  // 4. Crear la solicitud en la BD
  const solicitud = await prisma.solicitudAdopcion.create({
    data: { ... }
  });

  // 5. Responder con confirmación
  res.status(201).json({ success: true, data: { solicitud } });
};
```

**¿Por qué verificar el estado del animal?**
No tiene sentido recibir solicitudes para animales que ya fueron adoptados. Evitamos crear falsas expectativas.

**Estados que permiten solicitudes:**
- `Disponible` - Buscando adoptante
- `En proceso` - Evaluando candidatos (puede haber varios)
- `En transito` - En hogar temporal

**Estados que NO permiten solicitudes:**
- `Adoptado` - Ya tiene hogar

---

### 2. `getAdoptionRequests` - Listar solicitudes (ADMIN)

```javascript
const getAdoptionRequests = async (req, res) => {
  // 1. Obtener filtros de la query
  const { estado_solicitud, animal_id } = req.query;

  // 2. Construir objeto de filtros
  const where = {};
  if (estado_solicitud) where.estado_solicitud = estado_solicitud;
  if (animal_id) where.animal_id = parseInt(animal_id);

  // 3. Buscar en BD incluyendo datos del animal
  const solicitudes = await prisma.solicitudAdopcion.findMany({
    where,
    include: { animal: { select: { ... } } },
    orderBy: { fecha_solicitud: 'desc' }
  });

  res.json({ success: true, data: { solicitudes } });
};
```

**Filtros disponibles:**
```
GET /api/adoption-requests?estado_solicitud=Nueva
GET /api/adoption-requests?animal_id=5
GET /api/adoption-requests?estado_solicitud=Nueva&animal_id=5
```

**¿Qué es `include` en Prisma?**
Trae datos de tablas relacionadas. En este caso, incluimos info del animal para mostrar "Solicitud para Luna (Gato)".

---

### 3. `getAdoptionRequestById` - Ver detalle (ADMIN)

```javascript
const getAdoptionRequestById = async (req, res) => {
  const { id } = req.params;

  const solicitud = await prisma.solicitudAdopcion.findUnique({
    where: { id: parseInt(id) },
    include: {
      animal: {
        select: {
          id: true,
          nombre: true,
          contacto_rescatista: true,
          // ... más campos
        }
      }
    }
  });

  if (!solicitud) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }

  res.json({ success: true, data: { solicitud } });
};
```

**¿Por qué incluir `contacto_rescatista`?**
Para que el admin pueda contactar al rescatista y coordinar la entrega si aprueba la solicitud.

---

### 4. `updateAdoptionRequestStatus` - Cambiar estado (ADMIN)

```javascript
const updateAdoptionRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { estado_solicitud } = req.body;

  // 1. Verificar que existe
  const existingSolicitud = await prisma.solicitudAdopcion.findUnique(...);
  if (!existingSolicitud) return res.status(404)...

  // 2. Actualizar solo el estado
  const solicitud = await prisma.solicitudAdopcion.update({
    where: { id: parseInt(id) },
    data: { estado_solicitud }
  });

  res.json({ success: true, data: { solicitud } });
};
```

**Estados de solicitud:**

| Estado | Significado | Acción siguiente |
|--------|-------------|------------------|
| Nueva | Recién llegada | Revisar datos |
| Revisada | Admin vio los datos | Contactar solicitante |
| En evaluación | Evaluando al candidato | Decidir |
| Aprobada | Candidato aprobado | Coordinar entrega |
| Rechazada | No cumple requisitos | Notificar (opcional) |

---

### 5. `deleteAdoptionRequest` - Eliminar (ADMIN)

```javascript
const deleteAdoptionRequest = async (req, res) => {
  const { id } = req.params;

  // Verificar que existe
  const existingSolicitud = await prisma.solicitudAdopcion.findUnique(...);
  if (!existingSolicitud) return res.status(404)...

  // Eliminar
  await prisma.solicitudAdopcion.delete({
    where: { id: parseInt(id) }
  });

  res.json({ success: true, message: 'Solicitud eliminada' });
};
```

**¿Cuándo eliminar una solicitud?**
- Duplicados (misma persona, mismo animal)
- Spam o datos falsos
- A pedido del solicitante

---

### 6. `getAdoptionStats` - Estadísticas (ADMIN)

```javascript
const getAdoptionStats = async (req, res) => {
  // 1. Contar por estado usando groupBy
  const stats = await prisma.solicitudAdopcion.groupBy({
    by: ['estado_solicitud'],
    _count: { id: true }
  });

  // 2. Total general
  const total = await prisma.solicitudAdopcion.count();

  // 3. Últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentCount = await prisma.solicitudAdopcion.count({
    where: { fecha_solicitud: { gte: sevenDaysAgo } }
  });

  res.json({
    success: true,
    data: {
      total,
      ultimos_7_dias: recentCount,
      por_estado: { Nueva: 5, Revisada: 3, ... }
    }
  });
};
```

**¿Qué es `groupBy` en Prisma?**
Agrupa registros por un campo y permite hacer operaciones (contar, sumar, etc.).

```javascript
// SQL equivalente:
// SELECT estado_solicitud, COUNT(*) FROM solicitud_adopcion GROUP BY estado_solicitud
```

---

## Campos del formulario de adopción

### Datos personales:
| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| nombre_completo | string | Sí | max 100 chars |
| edad | int | Sí | min 18 |
| email | string | Sí | formato email |
| telefono_whatsapp | string | Sí | max 20 chars |
| instagram | string | No | max 100 chars |

### Vivienda:
| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| ciudad_zona | string | Sí | max 100 chars |
| tipo_vivienda | string | Sí | Casa con patio, Casa sin patio, Departamento, Otro |
| vive_solo_acompanado | string | Sí | max 100 chars |

### Situación:
| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| todos_de_acuerdo | boolean | Sí | debe ser true |
| tiene_otros_animales | boolean | Sí | - |
| otros_animales_castrados | string | Condicional | Sí, No, Algunos |
| experiencia_previa | text | Sí | - |

### Compromiso:
| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| puede_cubrir_gastos | boolean | Sí | - |
| veterinaria_que_usa | string | No | max 200 chars |
| motivacion | text | Sí | min 20 chars |
| compromiso_castracion | boolean | Sí | debe ser true |
| acepta_contacto | boolean | No | default true |

### Automáticos:
| Campo | Descripción |
|-------|-------------|
| id | Auto-incrementado |
| animal_id | ID del animal solicitado |
| fecha_solicitud | Fecha actual |
| estado_solicitud | Siempre empieza en "Nueva" |

---

## Probando los endpoints

### Enviar solicitud (público):
```bash
curl -X POST http://localhost:3000/api/adoption-requests \
  -H "Content-Type: application/json" \
  -d '{
    "animal_id": 1,
    "nombre_completo": "Juan Pérez",
    "edad": 30,
    "email": "juan@email.com",
    "telefono_whatsapp": "+54 11 1234-5678",
    "ciudad_zona": "CABA, Palermo",
    "tipo_vivienda": "Departamento",
    "vive_solo_acompanado": "Con pareja",
    "todos_de_acuerdo": true,
    "tiene_otros_animales": false,
    "experiencia_previa": "Tuve perros durante mi infancia y adolescencia.",
    "puede_cubrir_gastos": true,
    "motivacion": "Siempre quise tener un compañero peludo y ahora tengo el espacio y tiempo para cuidarlo.",
    "compromiso_castracion": true
  }'
```

**Response exitoso:**
```json
{
  "success": true,
  "data": {
    "solicitud": {
      "id": 1,
      "animal": { "id": 1, "nombre": "Luna", "especie": "Gato" },
      "nombre_completo": "Juan Pérez",
      "email": "juan@email.com",
      "fecha_solicitud": "2025-12-19T...",
      "estado_solicitud": "Nueva"
    },
    "message": "Solicitud enviada correctamente..."
  }
}
```

### Listar solicitudes (admin):
```bash
curl http://localhost:3000/api/adoption-requests \
  -H "Authorization: Bearer <token>"
```

### Filtrar por estado:
```bash
curl "http://localhost:3000/api/adoption-requests?estado_solicitud=Nueva" \
  -H "Authorization: Bearer <token>"
```

### Ver estadísticas:
```bash
curl http://localhost:3000/api/adoption-requests/stats \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "ultimos_7_dias": 8,
    "por_estado": {
      "Nueva": 5,
      "Revisada": 3,
      "En evaluación": 4,
      "Aprobada": 2,
      "Rechazada": 1
    }
  }
}
```

### Cambiar estado:
```bash
curl -X PATCH http://localhost:3000/api/adoption-requests/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"estado_solicitud": "Revisada"}'
```

### Eliminar:
```bash
curl -X DELETE http://localhost:3000/api/adoption-requests/1 \
  -H "Authorization: Bearer <token>"
```

---

## Flujo completo de una adopción

```
1. Usuario ve animal "Luna" en el frontend
           ↓
2. Click en "Quiero Adoptar"
           ↓
3. Completa formulario de adopción
           ↓
4. Frontend envía POST /api/adoption-requests
           ↓
5. Backend crea solicitud con estado "Nueva"
           ↓
6. Admin recibe notificación (futuro: email)
           ↓
7. Admin revisa solicitud → cambia a "Revisada"
           ↓
8. Admin contacta al solicitante → "En evaluación"
           ↓
9. Si aprueba → "Aprobada" + cambiar animal a "Adoptado"
   Si rechaza → "Rechazada"
           ↓
10. Coordinar entrega del animal
```

---

## Estructura actual del proyecto

```
adopcion-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── animals.controller.js
│   │   ├── upload.controller.js
│   │   └── adoption.controller.js    ← NUEVO
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── validators.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── animals.routes.js
│   │   ├── upload.routes.js
│   │   └── adoption.routes.js        ← NUEVO
│   └── app.js                        ← MODIFICADO
├── docs/
│   ├── FASE_1_SETUP_INICIAL.md
│   ├── FASE_2_AUTENTICACION.md
│   ├── FASE_3_CRUD_ANIMALES.md
│   ├── FASE_4_IMAGENES.md
│   └── FASE_5_SOLICITUDES.md         ← NUEVO
└── ...
```

---

## Resumen de la conversación

1. Creamos el controller con 6 funciones para gestionar solicitudes
2. Creamos las rutas separando pública (POST) de protegidas
3. Conectamos las rutas en app.js
4. Las validaciones ya existían del trabajo anterior
5. Implementamos estadísticas para el dashboard futuro

---

## Próximos pasos (Fase 6)

En la siguiente fase podemos implementar:

**Opción A: Dashboard/Estadísticas**
- Endpoint con resumen general
- Animales por estado
- Solicitudes pendientes

**Opción B: Notificaciones por Email**
- Enviar email al admin cuando llega solicitud
- Enviar email al solicitante confirmando recepción

**Opción C: Mejoras varias**
- Paginación en listados
- Búsqueda por texto
- Filtros avanzados

---

## Glosario de términos nuevos

| Término | Significado |
|---------|-------------|
| groupBy | Agrupar registros por un campo en Prisma |
| include | Traer datos de tablas relacionadas |
| Condicional | Campo obligatorio solo si otro campo tiene cierto valor |
| Stats | Estadísticas agregadas |
