# Actualización: Datos de Donación y Redes Sociales en Animal

**Fecha:** 25 Feb 2026
**Para:** Frontend
**Endpoint afectado:** `GET /api/animals/:id`

---

## Resumen del Cambio

Cuando se obtiene un animal por ID, ahora la respuesta incluye datos de **donación** y **redes sociales** de la organización. Esto permite mostrar toda la información en la vista de detalle del animal sin necesidad de hacer otra llamada a la API.

---

## Endpoint

```
GET /api/animals/:id
```

**Ejemplo:** `GET /api/animals/5`

---

## Respuesta Actualizada

```json
{
  "success": true,
  "data": {
    "animal": {
      "id": 5,
      "nombre": "Luna",
      "especie": "Perro",
      "sexo": "Hembra",
      "edad_aproximada": "2 años",
      "tamanio": "Mediano",
      "raza_mezcla": "Mestiza",
      "descripcion_historia": "Luna fue rescatada...",
      "estado": "Disponible",
      "estado_castracion": true,
      "estado_vacunacion": "Al día",
      "estado_desparasitacion": true,
      "socializa_perros": true,
      "socializa_gatos": false,
      "socializa_ninos": true,
      "necesidades_especiales": null,
      "tipo_hogar_ideal": "Casa con patio",
      "publicado_por": "Refugio Patitas",
      "contacto_rescatista": "@rescatista_luna",
      "foto_principal": "https://res.cloudinary.com/.../foto1.jpg",
      "foto_2": "https://res.cloudinary.com/.../foto2.jpg",
      "foto_3": null,
      "foto_4": null,
      "foto_5": null,
      "fecha_publicacion": "2026-02-20T10:30:00.000Z",
      "organizacion": {
        "id": 1,
        "nombre": "Refugio Patitas Felices",
        "slug": "refugio-patitas-felices",
        "instagram": "@patitas_felices",
        "facebook": "patitasfelices",
        "donacion_alias": "PATITAS.MP",
        "donacion_cbu": "0000003100012345678901",
        "donacion_info": "También aceptamos alimento balanceado y mantas"
      }
    }
  }
}
```

---

## Campos Nuevos en `organizacion`

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `instagram` | string \| null | Usuario de Instagram (con @) | `"@patitas_felices"` |
| `facebook` | string \| null | Página de Facebook | `"patitasfelices"` |
| `donacion_alias` | string \| null | Alias de Mercado Pago | `"PATITAS.MP"` |
| `donacion_cbu` | string \| null | CBU/CVU para transferencias | `"0000003100012345678901"` |
| `donacion_info` | string \| null | Texto libre con info adicional de donación | `"También aceptamos alimento"` |

**NOTA:** El teléfono/WhatsApp de la organización NO se expone en este endpoint por privacidad.

---

## Campos que YA venían (sin cambios)

| Campo | Tipo |
|-------|------|
| `id` | integer |
| `nombre` | string |
| `slug` | string |

---

## Cómo Usar en el Frontend

### Mostrar redes sociales

```jsx
{animal.organizacion.instagram && (
  <a href={`https://instagram.com/${animal.organizacion.instagram.replace('@', '')}`}>
    {animal.organizacion.instagram}
  </a>
)}

{animal.organizacion.facebook && (
  <a href={`https://facebook.com/${animal.organizacion.facebook}`}>
    Facebook
  </a>
)}
```

### Mostrar datos de donación

```jsx
{(animal.organizacion.donacion_alias || animal.organizacion.donacion_cbu) && (
  <div className="donacion-section">
    <h3>¿Querés ayudar?</h3>

    {animal.organizacion.donacion_alias && (
      <p><strong>Alias:</strong> {animal.organizacion.donacion_alias}</p>
    )}

    {animal.organizacion.donacion_cbu && (
      <p><strong>CBU:</strong> {animal.organizacion.donacion_cbu}</p>
    )}

    {animal.organizacion.donacion_info && (
      <p>{animal.organizacion.donacion_info}</p>
    )}
  </div>
)}
```

---

## Validaciones Recomendadas

Todos los campos nuevos pueden ser `null`, así que siempre verificar antes de mostrar:

```javascript
// Verificar si hay datos de donación
const tieneDonacion = animal.organizacion.donacion_alias ||
                      animal.organizacion.donacion_cbu ||
                      animal.organizacion.donacion_info;

// Verificar si hay redes sociales
const tieneRedes = animal.organizacion.instagram ||
                   animal.organizacion.facebook;
```

---

## Notas Importantes

1. **No hay cambios en otros endpoints** - Solo `GET /api/animals/:id` fue modificado
2. **Backwards compatible** - Si el frontend no usa los campos nuevos, sigue funcionando igual
3. **Campos opcionales** - Cada organización puede o no tener estos datos cargados
4. **Sin WhatsApp público** - Por decisión de privacidad, el WhatsApp no se expone

---

## Swagger

La documentación completa está en:
- **Producción:** https://adopcion-api.onrender.com/api-docs
- **Local:** http://localhost:3000/api-docs
