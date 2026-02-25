# Implementación: Filtro por Organización para Super Admin (Frontend)

## Contexto
El backend ahora permite al Super Admin filtrar animales y estadísticas del dashboard por organización. Tu tarea es implementar un dropdown/selector en el frontend para elegir la organización.

## Cambio de comportamiento

| Antes | Ahora |
|-------|-------|
| Super Admin veía solo animales de su org | Super Admin ve TODOS los animales de todas las orgs |
| Dashboard mostraba stats globales | Dashboard sigue mostrando stats globales (sin cambios) |

---

## Endpoints modificados

### 1. Listar animales (con filtro opcional)

```
GET /api/animals?organizacion_id=X
Authorization: Bearer <token>
```

| Escenario | Resultado |
|-----------|-----------|
| Super Admin sin filtro | Ve todos los animales de todas las organizaciones |
| Super Admin con `?organizacion_id=2` | Ve solo animales de la organización 2 |
| Admin normal (cualquier caso) | Ve solo animales de su organización (ignora el param) |

### 2. Estadísticas del dashboard (con filtro opcional)

```
GET /api/dashboard/stats?organizacion_id=X
Authorization: Bearer <token>
```

| Escenario | Resultado |
|-----------|-----------|
| Super Admin sin filtro | Ve estadísticas globales (todas las orgs) |
| Super Admin con `?organizacion_id=2` | Ve estadísticas solo de la organización 2 |
| Admin normal (cualquier caso) | Ve solo stats de su organización (ignora el param) |

---

## Endpoint para obtener lista de organizaciones

```
GET /api/super-admin/organizations
Authorization: Bearer <token>
```

### Response
```json
{
  "success": true,
  "data": {
    "organizaciones": [
      {
        "id": 1,
        "nombre": "Refugio Patitas Felices",
        "slug": "refugio-patitas",
        "activa": true,
        "_count": { "animales": 6, "administradores": 2 }
      },
      {
        "id": 3,
        "nombre": "Refugio Huellas de Amor",
        "slug": "refugio-huellas-de-amor",
        "activa": true,
        "_count": { "animales": 4, "administradores": 1 }
      }
    ]
  }
}
```

---

## Componente a implementar

### OrganizationFilter (solo visible para Super Admin)

```
Ubicación sugerida: Header del dashboard o sidebar

Lógica:
1. Si el usuario es super_admin (verificar con /api/auth/me o del token)
2. Mostrar un <select> o dropdown con:
   - Opción "Todas las organizaciones" (valor: vacío o null)
   - Lista de organizaciones (de GET /api/super-admin/organizations)
3. Al cambiar la selección:
   - Guardar el valor en estado (ej: selectedOrgId)
   - Llamar a GET /api/animals?organizacion_id=X
   - Llamar a GET /api/dashboard/stats?organizacion_id=X
   - Actualizar la UI con los nuevos datos
```

### Ejemplo de implementación (React)

```jsx
const [selectedOrgId, setSelectedOrgId] = useState(null);
const [organizations, setOrganizations] = useState([]);

// Cargar organizaciones al montar (solo si es super admin)
useEffect(() => {
  if (user.es_super_admin) {
    fetch('/api/super-admin/organizations', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setOrganizations(data.data.organizaciones));
  }
}, []);

// Cuando cambia la organización seleccionada
useEffect(() => {
  const params = selectedOrgId ? `?organizacion_id=${selectedOrgId}` : '';
  
  // Recargar animales
  fetch(`/api/animals${params}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => setAnimals(data.data.animals));
  
  // Recargar stats
  fetch(`/api/dashboard/stats${params}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => setStats(data.data));
}, [selectedOrgId]);

// Render del selector
{user.es_super_admin && (
  <select value={selectedOrgId || ''} onChange={e => setSelectedOrgId(e.target.value || null)}>
    <option value="">Todas las organizaciones</option>
    {organizations.map(org => (
      <option key={org.id} value={org.id}>{org.nombre}</option>
    ))}
  </select>
)}
```

---

## Verificar si es Super Admin

Del endpoint `/api/auth/me` o del token decodificado:

```json
{
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@ejemplo.com",
    "es_super_admin": true  // <-- Este campo
  }
}
```

---

## Base URL
- Local: `http://localhost:3000`
- Producción: `https://adopcion-api.onrender.com`
