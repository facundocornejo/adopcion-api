/**
 * Validación de variables de entorno al iniciar la aplicación
 * Falla rápidamente si faltan variables críticas
 */

const requiredEnvVars = [
  { name: 'DATABASE_URL', description: 'URL de conexión a PostgreSQL' },
  { name: 'JWT_SECRET', description: 'Secreto para firmar tokens JWT' }
];

const optionalEnvVars = [
  { name: 'CLOUDINARY_CLOUD_NAME', description: 'Nombre del cloud de Cloudinary' },
  { name: 'CLOUDINARY_API_KEY', description: 'API Key de Cloudinary' },
  { name: 'CLOUDINARY_API_SECRET', description: 'API Secret de Cloudinary' },
  { name: 'SMTP_HOST', description: 'Host del servidor SMTP' },
  { name: 'SMTP_PORT', description: 'Puerto del servidor SMTP' },
  { name: 'SMTP_USER', description: 'Usuario SMTP' },
  { name: 'SMTP_PASS', description: 'Contraseña SMTP' },
  { name: 'ADMIN_EMAIL', description: 'Email del administrador para notificaciones' },
  { name: 'FRONTEND_URL', description: 'URL del frontend para CORS' }
];

function validateEnv() {
  const missing = [];
  const warnings = [];

  // Verificar variables requeridas
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar.name]) {
      missing.push(`  - ${envVar.name}: ${envVar.description}`);
    }
  }

  // Verificar variables opcionales (solo warnings)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar.name]) {
      warnings.push(`  - ${envVar.name}: ${envVar.description}`);
    }
  }

  // Si faltan variables requeridas, terminar
  if (missing.length > 0) {
    console.error('\n❌ ERROR: Faltan variables de entorno requeridas:\n');
    console.error(missing.join('\n'));
    console.error('\nCrea un archivo .env con las variables necesarias.\n');
    process.exit(1);
  }

  // Mostrar warnings para variables opcionales
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  Variables de entorno opcionales no configuradas:');
    console.warn(warnings.join('\n'));
    console.warn('Algunas funcionalidades pueden no estar disponibles.\n');
  }

  // Validaciones adicionales
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET debería tener al menos 32 caracteres para mayor seguridad.\n');
  }

  return true;
}

module.exports = validateEnv;
