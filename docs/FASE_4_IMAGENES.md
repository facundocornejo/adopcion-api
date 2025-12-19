# FASE 4: Subida de Imágenes (Cloudinary) - Explicación Completa

## Resumen de la Fase

En esta fase implementamos la subida de imágenes a Cloudinary. Las imágenes no se guardan en nuestra base de datos ni en nuestro servidor, sino en un servicio externo especializado.

**Fecha:** 19 de Diciembre 2025
**Estado:** Completada

---

## ¿Por qué no guardar imágenes en la base de datos?

Las bases de datos relacionales como PostgreSQL están optimizadas para datos estructurados (texto, números, fechas). Guardar imágenes ahí:

1. **Hace la BD muy lenta** - Las queries tardan más
2. **Complica los backups** - Una BD de 500MB vs 50GB
3. **No escala bien** - Más usuarios = más problemas
4. **Consume recursos** - Memoria y CPU del servidor

**Solución:** Usar un servicio especializado como Cloudinary.

---

## ¿Qué es Cloudinary?

Es un servicio de almacenamiento de imágenes en la nube que:

- **Almacena** las imágenes de forma segura
- **Optimiza** automáticamente (compresión, formatos)
- **Transforma** imágenes (resize, crop, filtros)
- **Distribuye** via CDN (carga rápida en todo el mundo)
- **Gratis** hasta 25GB

**Flujo:**
```
1. Usuario sube imagen → Tu API
2. Tu API → Cloudinary
3. Cloudinary devuelve URL
4. Tu API guarda la URL en PostgreSQL
5. Frontend usa la URL para mostrar la imagen
```

---

## Archivos creados

```
src/
├── controllers/
│   └── upload.controller.js    # Lógica de subida/eliminación
└── routes/
    └── upload.routes.js        # Rutas + configuración multer
```

---

## Endpoints implementados

| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| POST | /api/upload | Sí | Subir imagen |
| DELETE | /api/upload/:publicId | Sí | Eliminar imagen |

---

## Explicación de cada archivo

### 1. `upload.routes.js` - Configuración de Multer

**¿Qué es Multer?**
Es un middleware de Express para manejar `multipart/form-data`, el formato usado para subir archivos.

```javascript
const multer = require('multer');

// 1. Configurar almacenamiento en memoria (buffer)
const storage = multer.memoryStorage();

// 2. Filtrar tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);   // Aceptar
  } else {
    cb(new Error('Formato no permitido'), false);  // Rechazar
  }
};

// 3. Crear instancia de multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB
});
```

**¿Por qué `memoryStorage` y no `diskStorage`?**
- `diskStorage`: Guarda el archivo en el disco temporalmente
- `memoryStorage`: Mantiene el archivo en memoria (RAM)

Usamos memoria porque vamos a enviar el archivo directo a Cloudinary, no lo necesitamos en disco.

**¿Qué es `file.mimetype`?**
Es el tipo MIME del archivo:
- `image/jpeg` → archivo .jpg o .jpeg
- `image/png` → archivo .png
- `image/webp` → archivo .webp

**Usando multer en la ruta:**
```javascript
router.post('/',
  verificarToken,           // 1. Verificar autenticación
  upload.single('file'),    // 2. Procesar archivo (campo 'file')
  handleMulterError,        // 3. Manejar errores de multer
  uploadImage               // 4. Subir a Cloudinary
);
```

`upload.single('file')` significa:
- Espera UN archivo
- En el campo llamado `file` del form-data

---

### 2. `upload.controller.js` - Subida a Cloudinary

```javascript
const uploadImage = async (req, res) => {
  // 1. Verificar que hay archivo
  if (!req.file) {
    return res.status(400).json({ error: 'NO_FILE' });
  }

  // 2. Subir a Cloudinary usando stream
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'adopcion',           // Carpeta en Cloudinary
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Enviar el buffer del archivo
    uploadStream.end(req.file.buffer);
  });

  // 3. Devolver URL y public_id
  res.json({
    success: true,
    data: {
      url: result.secure_url,
      public_id: result.public_id
    }
  });
};
```

**¿Qué es `upload_stream`?**
Cloudinary tiene dos formas de subir:
- `upload(filePath)` - Desde un archivo en disco
- `upload_stream()` - Desde un buffer en memoria

Usamos stream porque tenemos el archivo en memoria (por multer).

**¿Qué son las transformaciones?**
Cloudinary puede modificar la imagen al subirla:

```javascript
transformation: [
  { width: 1200, height: 1200, crop: 'limit' },  // Max 1200x1200
  { quality: 'auto' },    // Compresión automática
  { fetch_format: 'auto' }  // WebP si el browser lo soporta
]
```

**¿Qué es `public_id`?**
Es el identificador único de la imagen en Cloudinary:
```
URL: https://res.cloudinary.com/xxx/image/upload/v123/adopcion/abc123.jpg
                                                        └─ public_id: adopcion/abc123
```

Lo necesitás para eliminar la imagen después.

---

### 3. Eliminación de imágenes

```javascript
const deleteImage = async (req, res) => {
  const { publicId } = req.params;

  // El publicId viene con guión (adopcion-abc123) porque / no va en URLs
  const fullPublicId = publicId.replace('-', '/');

  const result = await cloudinary.uploader.destroy(fullPublicId);

  if (result.result === 'ok') {
    res.json({ message: 'Imagen eliminada' });
  } else {
    res.status(404).json({ error: 'NOT_FOUND' });
  }
};
```

---

## Configurar Cloudinary

### 1. Crear cuenta
Ve a https://cloudinary.com y creá una cuenta gratuita.

### 2. Obtener credenciales
En el Dashboard encontrás:
- Cloud Name
- API Key
- API Secret

### 3. Configurar en .env
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## Cómo usar desde el frontend

### Subir imagen:
```javascript
const formData = new FormData();
formData.append('file', inputFile.files[0]);

const response = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // NO pongas Content-Type, FormData lo maneja
  },
  body: formData
});

const data = await response.json();
// data.data.url → URL de la imagen para usar
```

### Flujo para crear animal con foto:
```
1. Usuario selecciona foto
2. Frontend sube a /api/upload
3. Cloudinary devuelve URL
4. Frontend guarda la URL
5. Usuario completa el formulario
6. Frontend envía POST /api/animals con la URL de la foto
```

---

## Probando con curl

### Subir imagen:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/ruta/a/imagen.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/v123/adopcion/abc123.jpg",
    "public_id": "adopcion/abc123"
  }
}
```

### Eliminar imagen:
```bash
curl -X DELETE http://localhost:3000/api/upload/adopcion-abc123 \
  -H "Authorization: Bearer <token>"
```

---

## Validaciones implementadas

| Qué | Validación | Error |
|-----|------------|-------|
| Token | Requerido | 401 NO_TOKEN |
| Archivo | Requerido | 400 NO_FILE |
| Formato | JPG, PNG, WEBP | 400 INVALID_FILE |
| Tamaño | Max 5MB | 400 FILE_TOO_LARGE |

---

## Estructura actual del proyecto

```
adopcion-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js       # Ya existía
│   │   └── email.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── animals.controller.js
│   │   └── upload.controller.js    ← NUEVO
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── validators.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── animals.routes.js
│   │   └── upload.routes.js        ← NUEVO
│   └── app.js
├── docs/
│   ├── FASE_1_SETUP_INICIAL.md
│   ├── FASE_2_AUTENTICACION.md
│   ├── FASE_3_CRUD_ANIMALES.md
│   └── FASE_4_IMAGENES.md          ← NUEVO
└── ...
```

---

## Resumen de la conversación

1. Creamos el controller para subir/eliminar imágenes
2. Configuramos multer para procesar archivos
3. Implementamos validaciones de formato y tamaño
4. Conectamos las rutas en app.js
5. Probamos que las validaciones funcionan

---

## Próximos pasos (Fase 5)

En la siguiente fase implementaremos las **Solicitudes de Adopción**:
- POST /api/adoption-requests (público)
- GET /api/adoption-requests (protegido)
- GET /api/adoption-requests/:id (protegido)
- PATCH /api/adoption-requests/:id (protegido)

---

## Glosario de términos nuevos

| Término | Significado |
|---------|-------------|
| Multer | Middleware para manejar archivos en Express |
| Form-data | Formato para enviar archivos por HTTP |
| Buffer | Datos binarios en memoria |
| Stream | Flujo de datos (no todo de golpe) |
| MIME type | Identificador del tipo de archivo |
| CDN | Red de distribución de contenido |
| public_id | Identificador único en Cloudinary |
| Transformation | Modificación de imagen al subir |
