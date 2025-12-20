const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Importar controller
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Importar middleware de autenticación
const { verificarToken } = require('../middlewares/auth.middleware');

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Estadísticas del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumen:
 *                       type: object
 *                     animales_por_estado:
 *                       type: object
 *                     solicitudes_por_estado:
 *                       type: object
 */
router.get('/stats', verificarToken, getDashboardStats);

// Endpoint temporal para seed (BORRAR EN PRODUCCIÓN)
router.post('/seed-animals', verificarToken, async (req, res) => {
  try {
    // Eliminar animales existentes
    await prisma.animal.deleteMany({});

    // Datos de animales con 5 fotos cada uno
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
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
        foto_2: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        foto_3: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800',
        foto_4: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
        foto_5: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800'
      },
      {
        nombre: 'Michi',
        especie: 'Gato',
        sexo: 'Macho',
        edad_aproximada: '1 año',
        tamanio: 'Mediano',
        raza_mezcla: 'Común Europeo',
        descripcion_historia: 'Michi fue encontrado abandonado en una caja. Es un gato tranquilo y muy independiente. Le gusta tomar sol en la ventana.',
        estado_castracion: true,
        estado_vacunacion: 'Al día - Triple felina',
        estado_desparasitacion: true,
        socializa_perros: false,
        socializa_gatos: true,
        socializa_ninos: true,
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
        foto_2: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
        foto_3: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800',
        foto_4: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800',
        foto_5: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800'
      },
      {
        nombre: 'Rocky',
        especie: 'Perro',
        sexo: 'Macho',
        edad_aproximada: '4 años',
        tamanio: 'Pequeño',
        raza_mezcla: 'Bulldog Francés',
        descripcion_historia: 'Rocky fue entregado por su familia anterior por mudanza. Es un perro muy cariñoso que ama estar en compañía.',
        estado_castracion: false,
        estado_vacunacion: 'Al día - Antirrábica y Séxtuple',
        estado_desparasitacion: true,
        socializa_perros: true,
        socializa_gatos: true,
        socializa_ninos: true,
        necesidades_especiales: 'Cuidado con el calor extremo',
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
        foto_2: 'https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=800',
        foto_3: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=800',
        foto_4: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        foto_5: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=800'
      },
      {
        nombre: 'Nina',
        especie: 'Gato',
        sexo: 'Hembra',
        edad_aproximada: '3 años',
        tamanio: 'Pequeño',
        raza_mezcla: 'Siamés Mix',
        descripcion_historia: 'Nina es una gatita dulce y elegante. Fue rescatada de un hogar donde ya no podían cuidarla. Es muy vocal.',
        estado_castracion: true,
        estado_vacunacion: 'Al día - Triple felina',
        estado_desparasitacion: true,
        socializa_perros: false,
        socializa_gatos: true,
        socializa_ninos: false,
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800',
        foto_2: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=800',
        foto_3: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800',
        foto_4: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
        foto_5: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'
      },
      {
        nombre: 'Max',
        especie: 'Perro',
        sexo: 'Macho',
        edad_aproximada: '6 meses',
        tamanio: 'Mediano',
        raza_mezcla: 'Golden Retriever',
        descripcion_historia: 'Max es un cachorro lleno de energía y amor. Fue rescatado junto a sus hermanos de un abandono. Muy inteligente.',
        estado_castracion: false,
        estado_vacunacion: 'En proceso - 2da dosis',
        estado_desparasitacion: true,
        socializa_perros: true,
        socializa_gatos: true,
        socializa_ninos: true,
        necesidades_especiales: 'Completar vacunación',
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
        foto_2: 'https://images.unsplash.com/photo-1612774412771-005ed8e861d2?w=800',
        foto_3: 'https://images.unsplash.com/photo-1625316708582-7c38734be31d?w=800',
        foto_4: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800',
        foto_5: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800'
      },
      {
        nombre: 'Pelusa',
        especie: 'Gato',
        sexo: 'Hembra',
        edad_aproximada: '5 años',
        tamanio: 'Grande',
        raza_mezcla: 'Persa Mix',
        descripcion_historia: 'Pelusa es una gata majestuosa y tranquila. Su familia anterior no podía seguir cuidándola. Muy cariñosa.',
        estado_castracion: true,
        estado_vacunacion: 'Al día - Triple felina',
        estado_desparasitacion: true,
        socializa_perros: false,
        socializa_gatos: false,
        socializa_ninos: true,
        necesidades_especiales: 'Cepillado diario',
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=800',
        foto_2: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=800',
        foto_3: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800',
        foto_4: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800',
        foto_5: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=800'
      },
      {
        nombre: 'Toby',
        especie: 'Perro',
        sexo: 'Macho',
        edad_aproximada: '7 años',
        tamanio: 'Grande',
        raza_mezcla: 'Pastor Alemán',
        descripcion_historia: 'Toby es un perro noble y protector. Fue rescatado de una situación de maltrato. Busca una familia amorosa.',
        estado_castracion: true,
        estado_vacunacion: 'Al día - Antirrábica y Séxtuple',
        estado_desparasitacion: true,
        socializa_perros: true,
        socializa_gatos: false,
        socializa_ninos: true,
        necesidades_especiales: 'Dueño experimentado',
        estado: 'Disponible',
        publicado_por: 'Refugio Patitas Felices',
        contacto_rescatista: 'contacto@patitasfelices.org',
        foto_principal: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800',
        foto_2: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
        foto_3: 'https://images.unsplash.com/photo-1553882809-a4f57e59501d?w=800',
        foto_4: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800',
        foto_5: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=800'
      }
    ];

    // Crear animales
    for (const data of animalesData) {
      await prisma.animal.create({
        data: {
          ...data,
          organizacion_id: req.admin.organizacion_id,
          administrador_id: req.admin.id
        }
      });
    }

    res.json({
      success: true,
      message: `${animalesData.length} animales creados correctamente`
    });
  } catch (error) {
    console.error('Error en seed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
