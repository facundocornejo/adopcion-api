const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear contraseña hasheada para el admin
  // La contraseña será "admin123" - CAMBIAR EN PRODUCCIÓN
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Crear o actualizar el administrador inicial
  const admin = await prisma.administrador.upsert({
    where: { email: 'admin@adopcion.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@adopcion.com',
      password_hash: passwordHash
    }
  });

  console.log('Administrador creado:', {
    id: admin.id,
    username: admin.username,
    email: admin.email
  });

  console.log('\n========================================');
  console.log('CREDENCIALES INICIALES (cambiar luego):');
  console.log('Email: admin@adopcion.com');
  console.log('Password: admin123');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
