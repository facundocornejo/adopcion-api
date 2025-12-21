/**
 * Script para hacer a un administrador super-admin
 * Uso: node prisma/set-super-admin.js <email>
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'admin@adopcion.com'

  console.log(`Buscando admin con email: ${email}...`)

  const admin = await prisma.administrador.findUnique({
    where: { email }
  })

  if (!admin) {
    console.error('Admin no encontrado')
    process.exit(1)
  }

  console.log(`Admin encontrado: ${admin.username} (ID: ${admin.id})`)

  await prisma.administrador.update({
    where: { id: admin.id },
    data: { es_super_admin: true }
  })

  console.log('✅ Admin actualizado como super-admin')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
