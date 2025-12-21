// Cargar variables de entorno PRIMERO (antes que cualquier otra cosa)
require('dotenv').config();

// Importar dependencias
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Importar configuración de base de datos
const prisma = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const animalsRoutes = require('./routes/animals.routes');
const uploadRoutes = require('./routes/upload.routes');
const adoptionRoutes = require('./routes/adoption.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const organizationRoutes = require('./routes/organization.routes');
const superadminRoutes = require('./routes/superadmin.routes');

// Crear la aplicación Express
const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Habilitar CORS para permitir requests del frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://adopcion-resposanble.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Parsear JSON en el body de las requests
app.use(express.json());

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS
// ============================================

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Adopción de Animales funcionando correctamente',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Swagger UI - Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Adopción - Documentación'
}));

// Ruta de health check (útil para monitoreo)
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/adoption-requests', adoptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api', superadminRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `La ruta ${req.method} ${req.path} no existe`
    }
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'Error interno del servidor'
    }
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  =============================================
  Servidor corriendo en http://localhost:${PORT}
  Entorno: ${process.env.NODE_ENV || 'development'}
  =============================================
  `);
});

// Manejar cierre graceful de la aplicación
process.on('SIGINT', async () => {
  console.log('\nCerrando conexión a la base de datos...');
  await prisma.$disconnect();
  process.exit(0);
});
