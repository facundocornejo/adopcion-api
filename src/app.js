// Cargar variables de entorno PRIMERO (antes que cualquier otra cosa)
require('dotenv').config();

// Validar variables de entorno antes de continuar
const validateEnv = require('./config/validateEnv');
validateEnv();

// Importar dependencias
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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
const casosExitoRoutes = require('./routes/casosexito.routes');

// Crear la aplicación Express
const app = express();

// Confiar en el proxy de Render (necesario para rate-limit y obtener IP real)
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// ============================================
// CORS - Respuesta rápida a preflight OPTIONS
// ============================================
// Esto debe ir ANTES de cualquier otro middleware para evitar timeouts
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://adopcion-responsable.vercel.app',
  'https://tfi-pet-adoption-front.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Permitir cualquier subdominio de vercel.app que contenga "adopcion-responsable"
    if (origin.includes('adopcion-responsable') && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204 // Algunos navegadores legacy necesitan esto
};

// Aplicar CORS a todas las rutas
app.use(cors(corsOptions));

// Responder inmediatamente a preflight OPTIONS (evita timeouts en Render)
app.options('*', cors(corsOptions));

// Helmet - Headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir imágenes de Cloudinary
  contentSecurityPolicy: false // Desactivado para permitir Swagger UI
}));

// Rate Limiting - Prevenir ataques de fuerza bruta
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Demasiadas solicitudes, intentá más tarde'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Demasiados intentos de login, esperá 15 minutos'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting estricto para endpoints públicos sensibles
const adoptionRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 solicitudes de adopción por hora por IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Demasiadas solicitudes de adopción, esperá una hora'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const contactRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5, // 5 solicitudes de contacto por día por IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Demasiadas solicitudes de contacto, esperá 24 horas'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limiting general (excluye OPTIONS para no bloquear preflight)
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // Skip rate limit para preflight
  }
  generalLimiter(req, res, next);
});

// Parsear JSON en el body de las requests (límite aumentado para uploads)
app.use(express.json({ limit: '10mb' }));

// Parsear datos de formularios URL-encoded (límite aumentado)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/auth/login', loginLimiter); // Rate limit estricto para login
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/upload', uploadRoutes);
app.post('/api/adoption-requests', adoptionRequestLimiter); // Rate limit para crear solicitudes
app.use('/api/adoption-requests', adoptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.post('/api/contact-requests', contactRequestLimiter); // Rate limit para solicitudes de contacto
app.use('/api', superadminRoutes);
app.use('/api/casos-exito', casosExitoRoutes);

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

const server = app.listen(PORT, () => {
  console.log(`
  =============================================
  Servidor corriendo en http://localhost:${PORT}
  Entorno: ${process.env.NODE_ENV || 'development'}
  =============================================
  `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

async function gracefulShutdown(signal) {
  console.log(`\n${signal} recibido. Iniciando cierre graceful...`);

  // Dejar de aceptar nuevas conexiones
  server.close(async () => {
    console.log('Servidor HTTP cerrado.');

    try {
      // Cerrar conexión a la base de datos
      await prisma.$disconnect();
      console.log('Conexión a base de datos cerrada.');
      process.exit(0);
    } catch (error) {
      console.error('Error durante el cierre:', error);
      process.exit(1);
    }
  });

  // Forzar cierre si tarda más de 10 segundos
  setTimeout(() => {
    console.error('Cierre forzado por timeout');
    process.exit(1);
  }, 10000);
}

// SIGINT: Ctrl+C en terminal
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// SIGTERM: Señal de terminación (Docker, Kubernetes, etc.)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
