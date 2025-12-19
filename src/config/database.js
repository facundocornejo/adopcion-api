const { PrismaClient } = require('@prisma/client');

// Crear una única instancia de PrismaClient para toda la aplicación
// Esto evita crear múltiples conexiones a la base de datos
const prisma = new PrismaClient();

module.exports = prisma;
