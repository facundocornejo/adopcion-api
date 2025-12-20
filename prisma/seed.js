const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // 1. Crear organizaciones de ejemplo
  const org1 = await prisma.organizacion.upsert({
    where: { slug: 'refugio-patitas' },
    update: {},
    create: {
      nombre: 'Refugio Patitas Felices',
      slug: 'refugio-patitas',
      email: 'contacto@patitasfelices.org',
      telefono: '11-4567-8900',
      direccion: 'Av. San Martín 1234, Buenos Aires',
      descripcion: 'Refugio dedicado al rescate y adopción de perros y gatos abandonados.'
    }
  });

  const org2 = await prisma.organizacion.upsert({
    where: { slug: 'huellitas-amor' },
    update: {},
    create: {
      nombre: 'Huellitas de Amor',
      slug: 'huellitas-amor',
      email: 'info@huellitasdeamor.org',
      telefono: '11-2345-6789',
      direccion: 'Calle Belgrano 567, Córdoba',
      descripcion: 'ONG dedicada a encontrar hogares para animales rescatados.'
    }
  });

  console.log('Organizaciones creadas:', [org1.nombre, org2.nombre]);

  // 2. Crear contraseña hasheada para el admin
  const passwordHash = await bcrypt.hash('admin123', 10);

  // 3. Crear administrador asociado a la primera organización
  const admin = await prisma.administrador.upsert({
    where: { email: 'admin@adopcion.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@adopcion.com',
      password_hash: passwordHash,
      organizacion_id: org1.id
    }
  });

  console.log('Administrador creado:', {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    organizacion: org1.nombre
  });

  // 4. Crear algunos animales de ejemplo
  const animalesData = [
    {
      nombre: 'Luna',
      especie: 'Perro',
      sexo: 'Hembra',
      edad_aproximada: '2 años',
      tamanio: 'Grande',
      raza_mezcla: 'Labrador Mix',
      descripcion_historia: 'Luna fue rescatada de la calle cuando era cachorra. Es una perra muy cariñosa y juguetona. Le encanta correr y jugar con pelotas.',
      estado_castracion: true,
      estado_vacunacion: 'Al día - Antirrábica y Séxtuple',
      estado_desparasitacion: true,
      socializa_perros: true,
      socializa_gatos: false,
      socializa_ninos: true,
      necesidades_especiales: null,
      tipo_hogar_ideal: 'Casa con patio o departamento grande con paseos diarios',
      estado: 'Disponible',
      publicado_por: 'Refugio Patitas Felices',
      contacto_rescatista: 'contacto@patitasfelices.org / 11-4567-8900',
      foto_principal: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
    },
    {
      nombre: 'Michi',
      especie: 'Gato',
      sexo: 'Macho',
      edad_aproximada: '1 año',
      tamanio: 'Mediano',
      raza_mezcla: 'Común Europeo',
      descripcion_historia: 'Michi fue encontrado abandonado en una caja. Es un gato tranquilo y muy independiente. Le gusta tomar sol en la ventana y ronronear.',
      estado_castracion: true,
      estado_vacunacion: 'Al día - Triple felina',
      estado_desparasitacion: true,
      socializa_perros: false,
      socializa_gatos: true,
      socializa_ninos: true,
      necesidades_especiales: null,
      tipo_hogar_ideal: 'Departamento o casa, ideal sin perros',
      estado: 'Disponible',
      publicado_por: 'Refugio Patitas Felices',
      contacto_rescatista: 'contacto@patitasfelices.org / 11-4567-8900',
      foto_principal: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
    },
    {
      nombre: 'Rocky',
      especie: 'Perro',
      sexo: 'Macho',
      edad_aproximada: '4 años',
      tamanio: 'Pequeño',
      raza_mezcla: 'Bulldog Francés',
      descripcion_historia: 'Rocky fue entregado por su familia anterior por mudanza. Es un perro muy cariñoso que ama estar en compañía. Ideal para departamento.',
      estado_castracion: false,
      estado_vacunacion: 'Al día - Antirrábica y Séxtuple',
      estado_desparasitacion: true,
      socializa_perros: true,
      socializa_gatos: true,
      socializa_ninos: true,
      necesidades_especiales: 'Cuidado con el calor extremo por su condición braquicefálica',
      tipo_hogar_ideal: 'Departamento con aire acondicionado',
      estado: 'Disponible',
      publicado_por: 'Refugio Patitas Felices',
      contacto_rescatista: 'contacto@patitasfelices.org / 11-4567-8900',
      foto_principal: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'
    }
  ];

  for (const animalData of animalesData) {
    await prisma.animal.create({
      data: {
        ...animalData,
        organizacion_id: org1.id,
        administrador_id: admin.id
      }
    });
  }

  console.log(animalesData.length + ' animales creados para ' + org1.nombre);

  console.log('\n========================================');
  console.log('CREDENCIALES INICIALES (cambiar luego):');
  console.log('Email: admin@adopcion.com');
  console.log('Password: admin123');
  console.log('Organizacion: ' + org1.nombre);
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
