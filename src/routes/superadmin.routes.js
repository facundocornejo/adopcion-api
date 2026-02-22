const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const {
  verificarSuperAdmin,
  getOrganizations,
  createOrganization,
  toggleOrganization,
  deleteOrganization,
  getContactRequests,
  updateContactRequest,
  createContactRequest,
  resetAdminPassword,
  getAdmins
} = require('../controllers/superadmin.controller');

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * @swagger
 * /api/contact-requests:
 *   post:
 *     summary: Enviar solicitud para ser rescatista
 *     tags: [Contacto]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_refugio
 *               - nombre_contacto
 *               - email
 *               - telefono
 *               - ciudad
 *               - descripcion
 *             properties:
 *               nombre_refugio:
 *                 type: string
 *                 example: "Refugio Huellitas"
 *               nombre_contacto:
 *                 type: string
 *                 example: "María García"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria@huellitas.org"
 *               telefono:
 *                 type: string
 *                 example: "+54 343 555-5678"
 *               ciudad:
 *                 type: string
 *                 example: "Paraná, Entre Ríos"
 *               descripcion:
 *                 type: string
 *                 example: "Somos un refugio con 5 años de experiencia..."
 *               instagram:
 *                 type: string
 *                 example: "@huellitas_parana"
 *               facebook:
 *                 type: string
 *                 example: "huellitasparana"
 *               cantidad_animales:
 *                 type: string
 *                 example: "Aproximadamente 30 animales"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Solicitud enviada correctamente
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/contact-requests', createContactRequest);

// ============================================
// RUTAS PROTEGIDAS (Super Admin)
// ============================================

/**
 * @swagger
 * /api/super-admin/organizations:
 *   get:
 *     summary: Listar todas las organizaciones
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las organizaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       activa:
 *                         type: boolean
 *                       _count:
 *                         type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Solo super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/super-admin/organizations', verificarToken, verificarSuperAdmin, getOrganizations);

/**
 * @swagger
 * /api/super-admin/organizations:
 *   post:
 *     summary: Crear nueva organización con administrador
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - admin_username
 *               - admin_email
 *               - admin_password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Refugio Nuevo"
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               admin_username:
 *                 type: string
 *                 example: "admin_nuevo"
 *               admin_email:
 *                 type: string
 *                 format: email
 *                 example: "admin@nuevo.org"
 *               admin_password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Organización y administrador creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizacion:
 *                       type: object
 *                     administrador:
 *                       type: object
 *       400:
 *         description: Datos inválidos o email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Solo super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/super-admin/organizations', verificarToken, verificarSuperAdmin, createOrganization);

/**
 * @swagger
 * /api/super-admin/organizations/{id}/toggle:
 *   put:
 *     summary: Activar/Desactivar organización
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la organización
 *     responses:
 *       200:
 *         description: Estado de la organización actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     activa:
 *                       type: boolean
 *                 message:
 *                   type: string
 *                   example: Organización desactivada correctamente
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Solo super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organización no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/super-admin/organizations/:id/toggle', verificarToken, verificarSuperAdmin, toggleOrganization);

/**
 * @swagger
 * /api/super-admin/organizations/{id}:
 *   delete:
 *     summary: Eliminar organización completamente
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la organización
 *     responses:
 *       200:
 *         description: Organización eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Organización eliminada correctamente
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Solo super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organización no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/super-admin/organizations/:id', verificarToken, verificarSuperAdmin, deleteOrganization);

/**
 * @swagger
 * /api/super-admin/contact-requests:
 *   get:
 *     summary: Listar solicitudes de contacto
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Pendiente, Aprobada, Rechazada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de solicitudes de contacto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre_refugio:
 *                         type: string
 *                       nombre_contacto:
 *                         type: string
 *                       email:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       fecha_solicitud:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Solo super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/super-admin/contact-requests', verificarToken, verificarSuperAdmin, getContactRequests);

/**
 * @swagger
 * /api/super-admin/contact-requests/{id}:
 *   put:
 *     summary: Actualizar estado de solicitud de contacto
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, Aprobada, Rechazada]
 *               notas_admin:
 *                 type: string
 *                 example: "Aprobada después de verificar referencias"
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Estado inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Solo super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/super-admin/contact-requests/:id', verificarToken, verificarSuperAdmin, updateContactRequest);

/**
 * @swagger
 * /api/super-admin/admins:
 *   get:
 *     summary: Listar todos los administradores
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     admins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           es_super_admin:
 *                             type: boolean
 *                           organizacion:
 *                             type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo super admin
 */
router.get('/super-admin/admins', verificarToken, verificarSuperAdmin, getAdmins);

/**
 * @swagger
 * /api/super-admin/admins/{id}/reset-password:
 *   put:
 *     summary: Resetear contraseña de un administrador
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *                 format: password
 *                 example: "NuevaPassword123"
 *                 description: "Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Contraseña reseteada correctamente para usuario1"
 *                     admin:
 *                       type: object
 *       400:
 *         description: Contraseña inválida o débil
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo super admin
 *       404:
 *         description: Administrador no encontrado
 */
router.put('/super-admin/admins/:id/reset-password', verificarToken, verificarSuperAdmin, resetAdminPassword);

module.exports = router;
