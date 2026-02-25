# Documentación Personal - API de Adopción de Animales

> Este documento es para vos, Facundo. Está escrito para que entiendas cada parte del sistema que construiste. Tomátelo con calma, leé las explicaciones y no dudes en volver a consultar las secciones que necesites.

---

## Tabla de Contenidos

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura y Estructura de Carpetas](#2-arquitectura-y-estructura-de-carpetas)
3. [Modelos de Datos (Prisma)](#3-modelos-de-datos-prisma)
4. [Rutas y Endpoints](#4-rutas-y-endpoints)
5. [Middlewares](#5-middlewares)
6. [Autenticación y Autorización](#6-autenticación-y-autorización)
7. [Servicios Externos](#7-servicios-externos)
8. [Validaciones](#8-validaciones)
9. [Manejo de Errores](#9-manejo-de-errores)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Decisiones de Diseño](#11-decisiones-de-diseño)
12. [Glosario Técnico](#12-glosario-técnico)

---

## 1. Visión General del Sistema

### ¿Qué hace esta API?

Imaginate que tenés un refugio de animales y querés que la gente pueda ver los perros y gatos que tenés para adoptar. Esta API es el "cerebro" que maneja toda esa información:

- **Guarda los datos de los animales** (nombre, fotos, si está vacunado, etc.)
- **Recibe solicitudes de adopción** de personas interesadas
- **Notifica por email** cuando alguien quiere adoptar
- **Permite a los administradores** gestionar todo desde un panel

Pensalo como un intermediario: el frontend (la página web que ve el usuario) le "pregunta" cosas a esta API, y la API le responde con los datos que necesita.

### Flujo Principal del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE ADOPCIÓN                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

1. REGISTRO DE ORGANIZACIÓN (Super Admin)
   ┌──────────────┐
   │ Super Admin  │ ──→ Crea organización + admin
   └──────────────┘
         │
         ▼
   ┌──────────────┐
   │ Organización │ ──→ Refugio Patitas, Huellitas de Amor, etc.
   │   + Admin    │
   └──────────────┘

2. PUBLICACIÓN DE ANIMAL (Admin del Refugio)
   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
   │    Admin     │ ──→  │ Sube fotos a │ ──→  │ Crea animal  │
   │   (login)    │      │  Cloudinary  │      │  en la BD    │
   └──────────────┘      └──────────────┘      └──────────────┘
                                                      │
                                                      ▼
                                               Estado: "Disponible"

3. SOLICITUD DE ADOPCIÓN (Usuario Público)
   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
   │   Usuario    │ ──→  │ Ve animales  │ ──→  │ Completa     │
   │   público    │      │ disponibles  │      │ formulario   │
   └──────────────┘      └──────────────┘      └──────────────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │ Se envía     │
                                               │ email al     │
                                               │ refugio      │
                                               └──────────────┘

4. EVALUACIÓN (Admin del Refugio)
   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
   │    Admin     │ ──→  │ Revisa       │ ──→  │  Aprueba o   │
   │              │      │ solicitud    │      │  Rechaza     │
   └──────────────┘      └──────────────┘      └──────────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          ▼                       ▼
                                    Si aprueba:             Si rechaza:
                                    Animal → "Adoptado"     Solicitud → "Rechazada"
                                          │
                                          ▼
                                    ┌──────────────┐
                                    │ Caso de      │
                                    │ Éxito        │
                                    └──────────────┘
```

### Multi-Tenancy: ¿Qué significa?

Tu sistema es **multi-tenant**, lo que significa que varias organizaciones (refugios) pueden usar la misma plataforma, pero cada una solo ve sus propios datos.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATAFORMA DE ADOPCIÓN                       │
├─────────────────────┬─────────────────────┬─────────────────────┤
│  Refugio Patitas    │  Huellitas de Amor  │   Nuevo Refugio     │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ - Sus animales      │ - Sus animales      │ - Sus animales      │
│ - Sus admins        │ - Sus admins        │ - Sus admins        │
│ - Sus solicitudes   │ - Sus solicitudes   │ - Sus solicitudes   │
└─────────────────────┴─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │    SUPER ADMIN      │
                    │  (Ve todo, gestiona │
                    │   organizaciones)   │
                    └─────────────────────┘
```

---

## 2. Arquitectura y Estructura de Carpetas

### Patrón de Arquitectura: Capas (Layered Architecture)

Tu proyecto sigue un patrón de **arquitectura en capas**. Pensalo como una torta: cada capa tiene una responsabilidad específica y se comunica con la capa de abajo.

```
┌─────────────────────────────────────────┐
│            RUTAS (Routes)               │  ← Define QUÉ endpoints existen
├─────────────────────────────────────────┤
│         MIDDLEWARES                     │  ← Validación, autenticación
├─────────────────────────────────────────┤
│        CONTROLADORES (Controllers)      │  ← Lógica de negocio
├─────────────────────────────────────────┤
│          SERVICIOS (Services)           │  ← Funcionalidades reutilizables
├─────────────────────────────────────────┤
│      ACCESO A DATOS (Prisma ORM)        │  ← Comunicación con la BD
├─────────────────────────────────────────┤
│         BASE DE DATOS (PostgreSQL)      │  ← Donde se guardan los datos
└─────────────────────────────────────────┘
```

### Estructura de Carpetas Explicada

```
adopcion-api/
│
├── src/                          # Todo el código fuente
│   │
│   ├── app.js                    # PUNTO DE ENTRADA
│   │                             # Acá se configura Express, se cargan
│   │                             # middlewares globales y se montan las rutas
│   │
│   ├── config/                   # CONFIGURACIONES
│   │   ├── database.js           # Conexión a PostgreSQL via Prisma
│   │   ├── cloudinary.js         # Configuración para subir imágenes
│   │   ├── email.js              # Configuración SMTP para enviar emails
│   │   ├── swagger.js            # Documentación automática de la API
│   │   └── validateEnv.js        # Valida que las variables de entorno existan
│   │
│   ├── constants/                # CONSTANTES
│   │   └── enums.js              # Valores fijos (estados, especies, etc.)
│   │                             # Ejemplo: ANIMAL_STATUS = ['Disponible', 'Adoptado', ...]
│   │
│   ├── middlewares/              # MIDDLEWARES
│   │   ├── auth.middleware.js    # Verifica el token JWT
│   │   └── validators.js         # Valida los datos que llegan en los requests
│   │
│   ├── routes/                   # RUTAS (Endpoints)
│   │   ├── auth.routes.js        # /api/auth/* (login, logout, me)
│   │   ├── animals.routes.js     # /api/animals/* (CRUD de animales)
│   │   ├── adoption.routes.js    # /api/adoption-requests/* (solicitudes)
│   │   ├── upload.routes.js      # /api/upload (subir imágenes)
│   │   ├── dashboard.routes.js   # /api/dashboard/* (estadísticas)
│   │   ├── organization.routes.js# /api/organization/* (perfil org)
│   │   ├── superadmin.routes.js  # /api/super-admin/* (gestión global)
│   │   └── casosexito.routes.js  # /api/casos-exito/* (historias)
│   │
│   ├── controllers/              # CONTROLADORES (Lógica)
│   │   ├── auth.controller.js    # Lógica de autenticación
│   │   ├── animals.controller.js # Lógica de animales
│   │   ├── adoption.controller.js# Lógica de solicitudes
│   │   ├── upload.controller.js  # Lógica de subida de archivos
│   │   ├── dashboard.controller.js
│   │   ├── organization.controller.js
│   │   ├── superadmin.controller.js
│   │   └── casosexito.controller.js
│   │
│   └── services/                 # SERVICIOS REUTILIZABLES
│       ├── email.service.js      # Envío de emails
│       └── audit.service.js      # Registro de auditoría
│
├── prisma/                       # BASE DE DATOS
│   ├── schema.prisma             # Definición de modelos/tablas
│   └── seed.js                   # Datos iniciales de prueba
│
├── tests/                        # TESTS
│   └── ...
│
├── .env                          # Variables de entorno (NO subir a git)
├── .env.example                  # Ejemplo de variables necesarias
└── package.json                  # Dependencias del proyecto
```

### ¿Por qué está organizado así?

**Separación de responsabilidades**: Cada carpeta tiene UN propósito. Si querés cambiar cómo se envían emails, vas a `services/email.service.js`. Si querés agregar una validación, vas a `middlewares/validators.js`.

**Facilidad de mantenimiento**: Cuando algo falla, sabés dónde buscar. Un error en login? → `controllers/auth.controller.js`. Un problema con las rutas? → `routes/`.

**Escalabilidad**: Si mañana querés agregar un nuevo recurso (por ejemplo, "Eventos de adopción"), solo creás `routes/eventos.routes.js` y `controllers/eventos.controller.js` siguiendo el mismo patrón.

---

## 3. Modelos de Datos (Prisma)

### ¿Qué es Prisma?

Prisma es un **ORM** (Object-Relational Mapping). En vez de escribir SQL directamente, escribís código JavaScript y Prisma lo traduce a SQL.

```javascript
// En vez de escribir SQL así:
// SELECT * FROM animal WHERE estado = 'Disponible'

// Con Prisma escribís así:
const animales = await prisma.animal.findMany({
  where: { estado: 'Disponible' }
});
```

### Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          DIAGRAMA DE ENTIDADES                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  Organizacion   │
                              │─────────────────│
                              │ id              │
                              │ nombre          │
                              │ slug (único)    │
                              │ email, tel...   │
                              │ activa          │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │ 1:N                    │ 1:N                    │ 1:N
              ▼                        ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │  Administrador  │      │     Animal      │      │   CasoExito     │
    │─────────────────│      │─────────────────│      │─────────────────│
    │ id              │      │ id              │      │ id              │
    │ username        │◄─────│ administrador_id│      │ animal_id (1:1) │
    │ email           │ 1:N  │ organizacion_id │      │ organizacion_id │
    │ password_hash   │      │ nombre, especie │      │ titulo, historia│
    │ es_super_admin  │      │ estado          │      └─────────────────┘
    └─────────────────┘      │ fotos...        │
                             │ deleted_at      │
                             └────────┬────────┘
                                      │
                                      │ 1:N
                                      ▼
                            ┌─────────────────┐
                            │SolicitudAdopcion│
                            │─────────────────│
                            │ id              │
                            │ animal_id       │
                            │ nombre_completo │
                            │ email           │
                            │ estado_solicitud│
                            └─────────────────┘


    ┌─────────────────┐                    ┌─────────────────┐
    │SolicitudContacto│                    │    AuditLog     │
    │─────────────────│                    │─────────────────│
    │ id              │                    │ id              │
    │ nombre_refugio  │                    │ action          │
    │ email           │                    │ entity_type     │
    │ estado          │                    │ admin_id        │
    │ (independiente) │                    │ old/new_values  │
    └─────────────────┘                    └─────────────────┘
```

### Modelo: Organizacion

**¿Qué representa?** Un refugio o asociación que publica animales para adopción.

```prisma
model Organizacion {
  id                Int      @id @default(autoincrement())  // Identificador único
  nombre            String   @db.VarChar(100)               // "Refugio Patitas Felices"
  slug              String   @unique @db.VarChar(50)        // "refugio-patitas" (para URLs)
  email             String?  @db.VarChar(100)               // Email de contacto (opcional)
  telefono          String?  @db.VarChar(20)                // Teléfono
  whatsapp          String?  @db.VarChar(20)                // WhatsApp
  direccion         String?  @db.VarChar(200)               // Dirección física
  logo_url          String?  @db.VarChar(255)               // URL del logo
  descripcion       String?  @db.Text                       // Descripción larga
  instagram         String?  @db.VarChar(100)               // @refugio_patitas
  facebook          String?  @db.VarChar(100)               // URL de Facebook
  donacion_alias    String?  @db.VarChar(100)               // Alias para donaciones
  donacion_cbu      String?  @db.VarChar(30)                // CBU/CVU
  donacion_info     String?  @db.Text                       // Info adicional donaciones
  activa            Boolean  @default(true)                 // Si está activa o no
  fecha_creacion    DateTime @default(now())                // Cuándo se creó

  // Relaciones
  administradores   Administrador[]                         // Sus admins
  animales          Animal[]                                // Sus animales
  casosExito        CasoExito[]                             // Sus casos de éxito
}
```

**¿Por qué existe el campo `slug`?** El slug es una versión "amigable para URLs" del nombre. En vez de `refugio.com/organizacion/1`, tenés `refugio.com/organizacion/refugio-patitas`. Es más legible y mejor para SEO.

**¿Por qué `activa` es booleano?** Cuando un super admin desactiva una organización, sus admins no pueden loguearse y sus animales no aparecen públicamente. Es una forma de "pausar" una organización sin borrarla.

---

### Modelo: Administrador

**¿Qué representa?** Un usuario que puede gestionar animales y solicitudes.

```prisma
model Administrador {
  id               Int           @id @default(autoincrement())
  organizacion_id  Int                                      // A qué org pertenece
  username         String        @unique @db.VarChar(50)    // Nombre de usuario único
  password_hash    String        @db.VarChar(255)           // Contraseña hasheada
  email            String        @unique @db.VarChar(100)   // Email único
  es_super_admin   Boolean       @default(false)            // ¿Tiene poderes especiales?
  fecha_creacion   DateTime      @default(now())
  ultimo_acceso    DateTime?                                // Último login

  // Relaciones
  organizacion     Organizacion  @relation(fields: [organizacion_id], references: [id])
  animales         Animal[]                                 // Animales que publicó
}
```

**¿Qué es `password_hash`?** NUNCA guardamos contraseñas en texto plano. Cuando un usuario se registra con contraseña "hola123", la hasheamos con bcrypt y guardamos algo como `$2b$10$N9qo8uLOickgx2ZMRZoMy...`. Nadie puede "des-hashear" esto para obtener la contraseña original.

**¿Qué significa `es_super_admin`?** Un super admin puede:
- Ver TODAS las organizaciones
- Crear nuevas organizaciones
- Aprobar solicitudes de contacto de rescatistas
- Acceder a datos de cualquier org

Un admin regular solo ve los datos de su propia organización.

---

### Modelo: Animal

**¿Qué representa?** Un perro o gato disponible para adopción.

```prisma
model Animal {
  id                     Int           @id @default(autoincrement())
  organizacion_id        Int                                 // Organización dueña
  administrador_id       Int                                 // Quién lo publicó
  nombre                 String        @db.VarChar(100)      // "Luna"
  especie                String        @db.VarChar(20)       // "Perro" o "Gato"
  sexo                   String        @db.VarChar(10)       // "Macho" o "Hembra"
  edad_aproximada        String        @db.VarChar(50)       // "2 años", "6 meses"
  tamanio                String        @db.VarChar(20)       // "Pequeño", "Mediano", "Grande"
  raza_mezcla            String?       @db.VarChar(100)      // "Labrador mix"
  descripcion_historia   String        @db.Text              // Historia del animal (min 50 chars)

  // Estados de salud
  estado_castracion      Boolean       @default(false)
  estado_vacunacion      String?       @db.VarChar(200)      // Detalle de vacunas
  estado_desparasitacion Boolean       @default(false)

  // Socialización (pueden ser null = "no se sabe")
  socializa_perros       Boolean?      @default(false)
  socializa_gatos        Boolean?      @default(false)
  socializa_ninos        Boolean?      @default(false)

  necesidades_especiales String?       @db.Text              // Cuidados especiales
  tipo_hogar_ideal       String?       @db.VarChar(200)      // "Casa con patio"

  estado                 String        @default("Disponible") // Estado actual
  publicado_por          String        @db.VarChar(100)      // Nombre del rescatista
  contacto_rescatista    String        @db.VarChar(200)      // Email/teléfono

  // Fotos (hasta 5)
  foto_principal         String        @db.VarChar(255)      // Obligatoria
  foto_2                 String?       @db.VarChar(255)
  foto_3                 String?       @db.VarChar(255)
  foto_4                 String?       @db.VarChar(255)
  foto_5                 String?       @db.VarChar(255)

  fecha_publicacion      DateTime      @default(now())
  fecha_actualizacion    DateTime      @updatedAt            // Se actualiza automáticamente
  deleted_at             DateTime?                           // Soft delete

  // Relaciones
  organizacion           Organizacion  @relation(...)
  administrador          Administrador @relation(...)
  solicitudes            SolicitudAdopcion[]
  casoExito              CasoExito?                          // 1:1 opcional
}
```

**¿Qué es `deleted_at` (Soft Delete)?** En vez de borrar el animal de la base de datos (DELETE), marcamos cuándo se "borró". Esto permite:
- Recuperar datos si fue un error
- Mantener historial
- Las solicitudes de adopción asociadas no quedan huérfanas

```javascript
// Al "borrar" un animal:
await prisma.animal.update({
  where: { id: 1 },
  data: { deleted_at: new Date() }  // Marcamos la fecha de borrado
});

// Al buscar animales, excluimos los borrados:
await prisma.animal.findMany({
  where: { deleted_at: null }  // Solo los que NO tienen fecha de borrado
});
```

**Estados posibles del animal:**
- `Disponible` → Puede recibir solicitudes
- `En proceso` → Hay interesados evaluándose
- `En transito` → Está siendo trasladado
- `Adoptado` → Ya tiene familia

---

### Modelo: SolicitudAdopcion

**¿Qué representa?** El formulario que completa alguien que quiere adoptar.

```prisma
model SolicitudAdopcion {
  id                      Int      @id @default(autoincrement())
  animal_id               Int                                 // Qué animal quiere adoptar
  nombre_completo         String   @db.VarChar(100)
  edad                    Int                                 // Mínimo 18 años
  email                   String   @db.VarChar(100)
  telefono_whatsapp       String   @db.VarChar(20)
  instagram               String?  @db.VarChar(100)
  ciudad_zona             String   @db.VarChar(100)
  tipo_vivienda           String   @db.VarChar(50)            // Casa con patio, Depto...
  vive_solo_acompanado    String   @db.VarChar(100)
  todos_de_acuerdo        Boolean                             // Todos en casa aceptan
  tiene_otros_animales    Boolean  @default(false)
  otros_animales_castrados String? @db.VarChar(50)
  experiencia_previa      String   @db.Text
  puede_cubrir_gastos     Boolean                             // Gastos veterinarios
  veterinaria_que_usa     String?  @db.VarChar(200)
  motivacion              String   @db.Text                   // Min 20 caracteres
  compromiso_castracion   Boolean                             // Debe ser true
  acepta_contacto         Boolean  @default(true)
  fecha_solicitud         DateTime @default(now())
  estado_solicitud        String   @default("Nueva")

  // Relación
  animal                  Animal   @relation(...)

  // Índice único compuesto: no puede existir 2 solicitudes del mismo email para el mismo animal
  @@unique([animal_id, email], name: "unique_adoption_request")
}
```

**¿Por qué `@@unique([animal_id, email])`?** Evita que una persona envíe múltiples solicitudes para el mismo animal. Sin embargo, en el código se hace una lógica adicional: si ya existe una solicitud VIEJA (más de 7 días), se elimina y se permite crear una nueva.

**Estados de la solicitud:**
- `Nueva` → Recién llegada
- `Revisada` → El admin la vio
- `En evaluación` → Están contactando al adoptante
- `Aprobada` → Se aprobó la adopción
- `Rechazada` → No fue aceptada

---

### Modelo: SolicitudContacto

**¿Qué representa?** Un rescatista que quiere unirse a la plataforma.

```prisma
model SolicitudContacto {
  id                 Int       @id @default(autoincrement())
  nombre_refugio     String    @db.VarChar(100)   // "Patitas al Rescate"
  nombre_contacto    String    @db.VarChar(100)   // "María García"
  email              String    @db.VarChar(100)
  telefono           String    @db.VarChar(20)
  ciudad             String    @db.VarChar(100)
  descripcion        String    @db.Text            // Qué hacen, cuántos animales, etc.
  instagram          String?   @db.VarChar(100)
  facebook           String?   @db.VarChar(100)
  cantidad_animales  String?   @db.VarChar(50)     // "Aproximadamente 30"
  estado             String    @default("Pendiente")
  notas_admin        String?   @db.Text            // Notas internas del super admin
  fecha_solicitud    DateTime  @default(now())
  fecha_respuesta    DateTime?                     // Cuándo se respondió
}
```

Este modelo es independiente (no tiene relaciones). Un super admin revisa estas solicitudes y, si las aprueba, crea manualmente una nueva Organizacion + Administrador.

---

### Modelo: CasoExito

**¿Qué representa?** La historia de un animal que fue adoptado exitosamente.

```prisma
model CasoExito {
  id                Int           @id @default(autoincrement())
  animal_id         Int           @unique              // 1:1 con Animal
  organizacion_id   Int
  titulo            String        @db.VarChar(200)     // "Luna encontró su hogar"
  historia          String        @db.Text             // Narración completa
  foto_actual_1     String?       @db.VarChar(255)     // Fotos del animal ya adoptado
  foto_actual_2     String?       @db.VarChar(255)
  foto_actual_3     String?       @db.VarChar(255)
  fecha_adopcion    DateTime                           // Cuándo se adoptó
  fecha_publicacion DateTime      @default(now())      // Cuándo se publicó la historia

  // Relaciones
  animal            Animal        @relation(...)       // 1:1
  organizacion      Organizacion  @relation(...)
}
```

**¿Por qué `animal_id` es `@unique`?** Un animal solo puede tener UN caso de éxito. Es una relación 1:1.

---

### Modelo: AuditLog

**¿Qué representa?** Un registro de todas las acciones importantes en el sistema.

```prisma
model AuditLog {
  id               Int       @id @default(autoincrement())
  timestamp        DateTime  @default(now())
  admin_id         Int?                              // Quién hizo la acción (null si sistema)
  admin_username   String?   @db.VarChar(50)
  organizacion_id  Int?
  action           String    @db.VarChar(50)         // CREATE, UPDATE, DELETE, LOGIN...
  entity_type      String    @db.VarChar(50)         // Animal, SolicitudAdopcion...
  entity_id        Int?                              // ID de la entidad afectada
  old_values       Json?                             // Valores anteriores
  new_values       Json?                             // Valores nuevos
  ip_address       String?   @db.VarChar(45)         // IP del cliente
  user_agent       String?   @db.VarChar(500)        // Navegador/cliente
}
```

Esto es fundamental para **seguridad y debugging**. Si algo sale mal, podés ver exactamente quién hizo qué y cuándo.

---

## 4. Rutas y Endpoints

### Convención de Respuestas

Todas las respuestas siguen el mismo formato:

```javascript
// Éxito
{
  "success": true,
  "data": { ... }  // Los datos solicitados
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",      // Código para el frontend
    "message": "Descripción"   // Mensaje legible
  }
}
```

### Rutas de Autenticación (`/api/auth/*`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | `/api/auth/login` | No | Iniciar sesión |
| POST | `/api/auth/logout` | JWT | Cerrar sesión |
| GET | `/api/auth/me` | JWT | Obtener datos del usuario actual |

**POST /api/auth/login**
```javascript
// Request
{
  "email": "admin@adopcion.com",
  "password": "admin123"
}

// Response exitoso
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",  // JWT para usar en requests
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@adopcion.com",
      "es_super_admin": false
    },
    "organizacion": {
      "id": 1,
      "nombre": "Refugio Patitas Felices",
      "slug": "refugio-patitas"
    }
  }
}
```

---

### Rutas de Animales (`/api/animals/*`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/api/animals` | Opcional | Listar animales (paginado) |
| GET | `/api/animals/:id` | Opcional | Ver detalle de un animal |
| POST | `/api/animals` | JWT | Crear un animal |
| PUT | `/api/animals/:id` | JWT | Actualizar un animal |
| PATCH | `/api/animals/:id/status` | JWT | Cambiar estado |
| DELETE | `/api/animals/:id` | JWT | Eliminar (soft delete) |

**GET /api/animals (Público)**

Cuando un usuario NO autenticado pide animales, solo ve los que están disponibles para adopción.

```
GET /api/animals?especie=Perro&tamanio=Grande&page=1&limit=10
```

**GET /api/animals (Autenticado)**

Cuando un admin pide animales, ve TODOS los de su organización (incluyendo adoptados, en proceso, etc.).

---

### Rutas de Solicitudes de Adopción (`/api/adoption-requests/*`)

| Método | Ruta | Autenticación | Rate Limit | Descripción |
|--------|------|---------------|------------|-------------|
| POST | `/api/adoption-requests` | No | 10/hora | Enviar solicitud (público) |
| GET | `/api/adoption-requests` | JWT | - | Listar solicitudes |
| GET | `/api/adoption-requests/:id` | JWT | - | Ver detalle |
| PATCH | `/api/adoption-requests/:id` | JWT | - | Cambiar estado |
| DELETE | `/api/adoption-requests/:id` | JWT | - | Eliminar |
| GET | `/api/adoption-requests/stats` | JWT | - | Estadísticas |

**Rate Limit:** El endpoint público tiene un límite de 10 solicitudes por hora por IP. Esto previene spam y abuso.

---

### Rutas de Upload (`/api/upload`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | `/api/upload` | JWT | Subir imagen a Cloudinary |
| DELETE | `/api/upload/:publicId` | JWT | Eliminar imagen |

**Restricciones de subida:**
- Máximo 5 MB
- Solo JPEG, PNG, WEBP
- Se redimensiona automáticamente a máximo 1200px

---

### Rutas de Dashboard (`/api/dashboard/*`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/api/dashboard/stats` | JWT | Estadísticas del panel |

Retorna:
- Total de animales
- Total de solicitudes
- Solicitudes últimos 7 días
- Animales últimos 30 días
- Tasa de adopción (%)
- Desglose por estado

---

### Rutas de Organización (`/api/organization/*`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/api/organization` | JWT | Mi organización |
| PUT | `/api/organization` | JWT | Actualizar mi org |
| GET | `/api/organization/:slug` | No | Ver org pública por slug |

---

### Rutas de Super Admin (`/api/super-admin/*`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | `/api/contact-requests` | No (rate limited) | Rescatista solicita unirse |
| GET | `/api/super-admin/organizations` | JWT + Super | Listar organizaciones |
| POST | `/api/super-admin/organizations` | JWT + Super | Crear organización |
| PUT | `/api/super-admin/organizations/:id/toggle` | JWT + Super | Activar/desactivar org |
| DELETE | `/api/super-admin/organizations/:id` | JWT + Super | Eliminar org (cascada) |
| GET | `/api/super-admin/contact-requests` | JWT + Super | Ver solicitudes de contacto |
| PUT | `/api/super-admin/contact-requests/:id` | JWT + Super | Actualizar solicitud |

---

### Rutas de Casos de Éxito (`/api/casos-exito/*`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/api/casos-exito` | No | Listar todos los casos |
| GET | `/api/casos-exito/:orgSlug` | No | Casos de una org |
| POST | `/api/casos-exito` | JWT | Crear caso |
| PUT | `/api/casos-exito/:id` | JWT | Actualizar caso |
| DELETE | `/api/casos-exito/:id` | JWT | Eliminar caso |

---

## 5. Middlewares

### ¿Qué es un Middleware?

Un middleware es una función que se ejecuta ANTES de que llegue el request al controlador. Pensalo como un guardia de seguridad que revisa a todos los que entran.

```
Request del cliente
        │
        ▼
┌───────────────────┐
│    Middleware 1   │  ← Verifica autenticación
│  (verificarToken) │
└─────────┬─────────┘
          │ Si pasa...
          ▼
┌───────────────────┐
│    Middleware 2   │  ← Valida los datos
│   (validators)    │
└─────────┬─────────┘
          │ Si pasa...
          ▼
┌───────────────────┐
│    Controlador    │  ← Ejecuta la lógica
└───────────────────┘
```

### Middleware: verificarToken

**Archivo:** `src/middlewares/auth.middleware.js`

**¿Qué hace?** Verifica que el request tenga un token JWT válido.

```javascript
const verificarToken = (req, res, next) => {
  // 1. Obtener el header "Authorization"
  const authHeader = req.headers['authorization'];

  // 2. El formato esperado es "Bearer eyJhbGciOiJI..."
  //    Separamos por espacio y tomamos la segunda parte (el token)
  const token = authHeader && authHeader.split(' ')[1];

  // 3. Si no hay token, rechazar
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Token de autenticación no proporcionado'
      }
    });
  }

  try {
    // 4. Verificar que el token sea válido usando el secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Adjuntar los datos del usuario al request
    //    Ahora en el controlador podés usar req.admin
    req.admin = decoded;

    // 6. Continuar al siguiente middleware o controlador
    next();

  } catch (error) {
    // Si el token es inválido o expiró
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado'
      }
    });
  }
};
```

**¿Cómo se usa en las rutas?**

```javascript
// En animals.routes.js
router.post('/',
  verificarToken,        // Primero verifica el token
  animalValidation,      // Luego valida los datos
  createAnimal           // Finalmente ejecuta el controlador
);
```

---

### Middleware: Validators

**Archivo:** `src/middlewares/validators.js`

**¿Qué hace?** Valida los datos que llegan en el body del request usando `express-validator`.

**Ejemplo: animalValidation**

```javascript
const animalValidation = [
  // Validar el campo "nombre"
  body('nombre')
    .trim()                                    // Quita espacios al inicio/fin
    .notEmpty().withMessage('El nombre es obligatorio')  // No puede estar vacío
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres')
    .escape(),                                 // Escapa caracteres HTML (seguridad XSS)

  // Validar el campo "especie"
  body('especie')
    .trim()
    .notEmpty().withMessage('La especie es obligatoria')
    .isIn(['Perro', 'Gato']).withMessage('La especie debe ser "Perro" o "Gato"'),
    // isIn() verifica que el valor esté en la lista permitida

  // ... más validaciones ...

  // Al final, este middleware maneja los errores
  handleValidationErrors
];
```

**¿Qué pasa si falla la validación?**

```javascript
// Response de error de validación
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Errores de validación",
    "details": [
      { "field": "nombre", "message": "El nombre es obligatorio" },
      { "field": "especie", "message": "La especie debe ser \"Perro\" o \"Gato\"" }
    ]
  }
}
```

---

## 6. Autenticación y Autorización

### ¿Qué es JWT?

JWT (JSON Web Token) es como una "credencial digital". Cuando te logueas, el servidor te da un token que tenés que guardar y enviar en cada request posterior.

### Flujo de Autenticación Paso a Paso

```
1. LOGIN
   ┌──────────────┐                    ┌──────────────┐
   │   Frontend   │ ── POST /login ──▶ │   Backend    │
   │              │    {email, pass}   │              │
   └──────────────┘                    └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Verifica     │
                                       │ credenciales │
                                       │ con bcrypt   │
                                       └──────┬───────┘
                                              │
                                              ▼
   ┌──────────────┐                    ┌──────────────┐
   │   Frontend   │ ◀── { token } ──── │ Genera JWT   │
   │ Guarda token │                    │ con datos    │
   │ en localStorage│                  │ del usuario  │
   └──────────────┘                    └──────────────┘

2. REQUEST AUTENTICADO
   ┌──────────────┐                    ┌──────────────┐
   │   Frontend   │ ── GET /animals ─▶ │   Backend    │
   │              │    Authorization:  │              │
   │              │    Bearer <token>  │              │
   └──────────────┘                    └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ verificarToken│
                                       │ decodifica   │
                                       │ y valida JWT │
                                       └──────┬───────┘
                                              │
                                              ▼
   ┌──────────────┐                    ┌──────────────┐
   │   Frontend   │ ◀── { data } ───── │ Controlador  │
   └──────────────┘                    │ usa req.admin│
                                       └──────────────┘
```

### ¿Cómo se genera el token?

```javascript
// En auth.controller.js, función login()

// 1. Verificar que el usuario existe y la contraseña es correcta
const admin = await prisma.administrador.findUnique({
  where: { email }
});

const passwordValido = await bcrypt.compare(password, admin.password_hash);

// 2. Generar el token con los datos del usuario
const token = jwt.sign(
  {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    organizacion_id: admin.organizacion_id,
    es_super_admin: admin.es_super_admin
  },
  process.env.JWT_SECRET,  // Secreto para firmar
  { expiresIn: '24h' }     // El token expira en 24 horas
);
```

### ¿Qué contiene el token?

Un JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhZG9wY2lvbi5jb20iLCJ1c2VybmFtZSI6ImFkbWluIiwib3JnYW5pemFjaW9uX2lkIjoxLCJlc19zdXBlcl9hZG1pbiI6ZmFsc2UsImlhdCI6MTcwOTMwMDAwMCwiZXhwIjoxNzA5Mzg2NDAwfQ.SIGNATURE
│                              │                                                                                                                                              │
└──────── HEADER ──────────────┴──────────────────────────────────────────────── PAYLOAD ─────────────────────────────────────────────────────────────────────────────────────┴── FIRMA ──
```

El PAYLOAD (decodificado) contiene:
```json
{
  "id": 1,
  "email": "admin@adopcion.com",
  "username": "admin",
  "organizacion_id": 1,
  "es_super_admin": false,
  "iat": 1709300000,  // Issued At: cuándo se creó
  "exp": 1709386400   // Expires: cuándo expira
}
```

### Roles y Permisos

**Admin Regular:**
- Solo ve animales de su organización
- Solo ve solicitudes para animales de su organización
- Puede crear/editar/eliminar animales de su org
- Puede actualizar perfil de su organización

**Super Admin:**
- Ve TODAS las organizaciones
- Puede crear nuevas organizaciones
- Puede activar/desactivar organizaciones
- Puede ver y responder solicitudes de contacto
- Accede a todo el sistema

```javascript
// Middleware que verifica si es super admin
const verificarSuperAdmin = (req, res, next) => {
  if (!req.admin.es_super_admin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Acceso denegado. Se requieren permisos de super administrador.'
      }
    });
  }
  next();
};
```

---

## 7. Servicios Externos

### Cloudinary (Almacenamiento de Imágenes)

**¿Qué es?** Un servicio en la nube para almacenar y transformar imágenes. Las fotos de los animales se guardan ahí.

**¿Por qué no guardarlas en el servidor?**
- Las imágenes ocupan MUCHO espacio
- Cloudinary las optimiza automáticamente
- Sirve las imágenes desde CDN (más rápido)
- Podés transformarlas al vuelo (resize, crop, etc.)

**Configuración:** `src/config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Tu nombre de cuenta
  api_key: process.env.CLOUDINARY_API_KEY,        // API key
  api_secret: process.env.CLOUDINARY_API_SECRET   // API secret
});
```

**¿Cómo se suben las imágenes?** En `upload.controller.js`:

```javascript
// 1. Multer recibe el archivo y lo guarda en memoria (buffer)
// 2. Se sube a Cloudinary con transformaciones
const result = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'adopcion',                    // Carpeta en Cloudinary
      transformation: [
        { width: 1200, crop: 'limit' },      // Máximo 1200px de ancho
        { quality: 'auto' },                 // Calidad automática
        { format: 'auto' }                   // Formato óptimo (webp si el browser lo soporta)
      ]
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );

  // Enviar el buffer al stream
  uploadStream.end(req.file.buffer);
});

// 3. Retornar la URL segura
return res.json({
  success: true,
  data: {
    url: result.secure_url,      // https://res.cloudinary.com/...
    public_id: result.public_id  // Para poder eliminarla después
  }
});
```

---

### Nodemailer (Envío de Emails)

**¿Qué es?** Una librería para enviar emails desde Node.js.

**¿Cuándo se envían emails?** Cuando alguien envía una solicitud de adopción, se notifica a la organización por email.

**Configuración:** `src/config/email.js`

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp.gmail.com
  port: process.env.SMTP_PORT,      // 587
  secure: false,                    // true para 465, false para otros
  auth: {
    user: process.env.SMTP_USER,    // tu_email@gmail.com
    pass: process.env.SMTP_PASS     // Contraseña de aplicación (NO tu contraseña normal)
  }
});
```

**Servicio de email:** `src/services/email.service.js`

La función `notificarNuevaSolicitud()` genera un email HTML con toda la información del adoptante y lo envía a la organización.

**Importante:** El envío se hace de forma **asíncrona** (no bloquea la respuesta al usuario). Si el email falla, el usuario igual recibe confirmación de que su solicitud se envió.

---

### Supabase (PostgreSQL)

**¿Qué es?** Una plataforma que provee una base de datos PostgreSQL en la nube.

**¿Solo se usa como PostgreSQL?** Sí, en este proyecto solo usamos Supabase como hosting de la base de datos. No usamos otras features de Supabase como autenticación o storage (usamos JWT propio y Cloudinary).

**¿Cómo se conecta?** A través de la variable `DATABASE_URL`:

```
postgresql://postgres:TU_PASSWORD@db.XXXXX.supabase.co:5432/postgres
             │        │           │                      │    │
             usuario  contraseña  host de Supabase       puerto  nombre de BD
```

---

## 8. Validaciones

### ¿Por qué validar?

1. **Seguridad:** Prevenir inyección de código malicioso
2. **Integridad de datos:** Asegurar que los datos tengan el formato correcto
3. **UX:** Dar mensajes de error claros al usuario

### express-validator

Es la librería que usamos. Funciona con una cadena de validaciones:

```javascript
body('campo')
  .trim()                    // Limpia espacios
  .notEmpty()                // No puede estar vacío
  .isLength({ min: 5 })      // Mínimo 5 caracteres
  .escape()                  // Escapa HTML (seguridad)
  .withMessage('Mensaje de error personalizado')
```

### Validaciones por Entidad

**Animal:**
- `nombre`: Obligatorio, máx 100 chars, escapado
- `especie`: Solo "Perro" o "Gato"
- `sexo`: Solo "Macho" o "Hembra"
- `tamanio`: Solo "Pequeño", "Mediano" o "Grande"
- `descripcion_historia`: Mínimo 50 caracteres
- `foto_principal`: URL válida obligatoria
- Booleanos (`estado_castracion`, etc.): Deben ser true/false

**Solicitud de Adopción:**
- `edad`: Entre 18 y 120 años
- `email`: Formato válido, normalizado
- `todos_de_acuerdo`: DEBE ser true
- `compromiso_castracion`: DEBE ser true
- `motivacion`: Mínimo 20 caracteres

### Sanitización XSS

`.escape()` convierte caracteres especiales de HTML en entidades seguras:

```
<script>alert('hacked')</script>
  ↓
&lt;script&gt;alert('hacked')&lt;/script&gt;
```

Esto previene ataques XSS (Cross-Site Scripting).

---

## 9. Manejo de Errores

### Formato Estándar de Errores

```javascript
{
  "success": false,
  "error": {
    "code": "CODIGO_UNICO",      // Para el frontend
    "message": "Mensaje legible"  // Para mostrar al usuario
  }
}
```

### Códigos de Error HTTP que Usamos

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Todo bien |
| 201 | Created | Se creó un recurso |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No tiene permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto (ej: duplicado) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

### Middleware Global de Errores

En `app.js` hay un middleware que captura todos los errores no manejados:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);

  // En desarrollo, mostrar el error completo
  // En producción, mostrar mensaje genérico
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Error interno del servidor';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message
    }
  });
});
```

---

## 10. Variables de Entorno

### ¿Qué son?

Son valores de configuración que NO querés guardar en el código. Cada entorno (desarrollo, producción) tiene sus propios valores.

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secreto para firmar tokens | String largo y aleatorio (32+ chars) |

### Variables Opcionales

| Variable | Descripción | Si no está... |
|----------|-------------|---------------|
| `PORT` | Puerto del servidor | Usa 3000 |
| `NODE_ENV` | Entorno | Asume development |
| `CLOUDINARY_*` | Credenciales Cloudinary | No se pueden subir imágenes |
| `SMTP_*` | Credenciales email | No se envían emails |
| `FRONTEND_URL` | URL del frontend | CORS usa defaults |

### Archivo .env

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=un_string_muy_largo_y_seguro_de_al_menos_32_caracteres

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=contraseña_de_aplicacion
ADMIN_EMAIL=donde_recibir_notificaciones@email.com

# Frontend
FRONTEND_URL=http://localhost:5173
```

**IMPORTANTE:** El archivo `.env` NUNCA se sube a git. Está en `.gitignore`.

---

## 11. Decisiones de Diseño

### 1. Arquitectura en Capas

**¿Qué se decidió?** Separar el código en rutas → middlewares → controladores → servicios → base de datos.

**¿Por qué es buena práctica?**
- **Separación de responsabilidades:** Cada capa hace UNA cosa
- **Facilidad de testing:** Podés testear cada capa por separado
- **Mantenibilidad:** Los cambios en una capa no afectan las otras

**Alternativas:** Podría haberse usado un monolito sin capas (más simple pero menos escalable) o microservicios (más complejo pero más escalable).

---

### 2. Soft Delete para Animales

**¿Qué se decidió?** En vez de borrar animales con DELETE, se marca con `deleted_at`.

**¿Por qué es buena práctica?**
- Se puede recuperar un animal borrado por error
- Las solicitudes de adopción no quedan huérfanas
- Podés generar estadísticas históricas

**Alternativas:** Hard delete (borrado real) - más simple pero perdés datos.

---

### 3. JWT para Autenticación

**¿Qué se decidió?** Usar tokens JWT en vez de sesiones en el servidor.

**¿Por qué es buena práctica?**
- **Stateless:** El servidor no guarda nada, toda la info está en el token
- **Escalable:** Funciona bien con múltiples servidores
- **Mobile-friendly:** Funciona igual para web y apps móviles

**Alternativas:**
- Sesiones con cookies (más simple pero requiere estado en servidor)
- OAuth (más complejo, mejor para "Login con Google")

---

### 4. Rate Limiting

**¿Qué se decidió?** Limitar la cantidad de requests que puede hacer una IP.

**¿Por qué es buena práctica?**
- Previene ataques de fuerza bruta
- Evita spam de solicitudes
- Protege recursos del servidor

**Límites actuales:**
- General: 100 requests / 15 minutos
- Login: 5 intentos / 15 minutos
- Solicitud adopción: 10 / hora
- Solicitud contacto: 5 / día

---

### 5. Validación y Sanitización de Inputs

**¿Qué se decidió?** Validar TODOS los inputs con express-validator y escapar HTML.

**¿Por qué es buena práctica?**
- Previene SQL Injection (aunque Prisma ya lo previene)
- Previene XSS (Cross-Site Scripting)
- Asegura integridad de datos

---

### 6. Multi-Tenancy con organizacion_id

**¿Qué se decidió?** Cada registro tiene un `organizacion_id` que determina a quién pertenece.

**¿Por qué es buena práctica?**
- Una sola base de datos para todas las organizaciones
- Fácil de mantener y desplegar
- Aislamiento de datos a nivel de aplicación

**Alternativas:**
- Base de datos separada por organización (más aislamiento, más complejo)
- Sin multi-tenancy (más simple pero no escala a múltiples orgs)

---

### 7. Auditoría con AuditLog

**¿Qué se decidió?** Registrar todas las acciones importantes en una tabla.

**¿Por qué es buena práctica?**
- Trazabilidad: sabés quién hizo qué y cuándo
- Debugging: podés investigar problemas
- Seguridad: detectás actividad sospechosa
- Compliance: algunas regulaciones lo requieren

---

## 12. Glosario Técnico

### A

**API (Application Programming Interface):** Un conjunto de reglas que permite que programas se comuniquen. Tu API es el "traductor" entre el frontend y la base de datos.

**Autenticación:** Verificar QUIÉN sos (login con usuario y contraseña).

**Autorización:** Verificar QUÉ podés hacer (permisos, roles).

### B

**Backend:** La parte del sistema que corre en el servidor. Maneja lógica, base de datos, seguridad.

**bcrypt:** Algoritmo para hashear contraseñas de forma segura.

**Body:** Los datos que se envían en un request POST/PUT. Generalmente en formato JSON.

### C

**CDN (Content Delivery Network):** Red de servidores distribuidos que sirven contenido más rápido desde ubicaciones cercanas al usuario.

**CORS (Cross-Origin Resource Sharing):** Mecanismo de seguridad que controla qué dominios pueden acceder a tu API.

**CRUD:** Create, Read, Update, Delete - las 4 operaciones básicas sobre datos.

### E

**Endpoint:** Una URL específica de la API que hace algo. Ejemplo: `GET /api/animals` es un endpoint.

**express-validator:** Librería para validar datos en Express.

### F

**Frontend:** La parte del sistema que ve el usuario (la página web).

### H

**Hash:** Transformar un dato en un valor fijo irreversible. Se usa para contraseñas.

**Header:** Metadatos que van con cada request HTTP. El token JWT va en el header `Authorization`.

### J

**JSON (JavaScript Object Notation):** Formato de texto para intercambiar datos. `{"nombre": "Luna", "especie": "Perro"}`

**JWT (JSON Web Token):** Token codificado que contiene información del usuario. Se usa para autenticación.

### M

**Middleware:** Función que se ejecuta entre el request y el controlador. Puede validar, autenticar, loguear, etc.

**Migración:** Cambios estructurales en la base de datos (crear tablas, agregar columnas).

**Multi-tenant:** Arquitectura donde múltiples clientes (tenants) usan la misma aplicación pero con datos aislados.

### O

**ORM (Object-Relational Mapping):** Herramienta que traduce entre objetos JavaScript y tablas SQL. Prisma es un ORM.

### P

**Payload:** Los datos contenidos en algo. En JWT, el payload son los datos del usuario.

**Prisma:** ORM moderno para Node.js que usamos para conectar con PostgreSQL.

### R

**Rate Limiting:** Limitar la cantidad de requests que puede hacer un cliente en un período de tiempo.

**Request:** Pedido que hace el cliente al servidor.

**Response:** Respuesta que devuelve el servidor al cliente.

**REST:** Estilo arquitectónico para diseñar APIs. Usa HTTP methods (GET, POST, PUT, DELETE) y URLs descriptivas.

### S

**Seed:** Datos iniciales que se cargan en la base de datos para pruebas o configuración inicial.

**Soft Delete:** "Borrar" un registro marcándolo como eliminado sin quitarlo de la base de datos.

**SMTP:** Protocolo para enviar emails.

### T

**Token:** Cadena de caracteres que representa una credencial o autorización.

**Transacción:** Operación de base de datos que agrupa múltiples acciones. Si una falla, todas se revierten.

### V

**Validación:** Verificar que los datos cumplan reglas específicas (formato, longitud, tipo).

### X

**XSS (Cross-Site Scripting):** Ataque donde se inyecta código malicioso a través de inputs del usuario.

---

## Conclusión

Este documento cubre toda la estructura y funcionamiento de tu API. Si tenés dudas sobre algún aspecto específico, podés buscar en el código los archivos mencionados y ver la implementación real.

Recordá:
- El código está en `src/`
- Los modelos están en `prisma/schema.prisma`
- Las rutas definen los endpoints
- Los controladores tienen la lógica
- Los middlewares validan y protegen

¡Éxitos con el TFI!
