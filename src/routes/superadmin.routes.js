const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const {
  verificarSuperAdmin,
  getOrganizations,
  createOrganization,
  toggleOrganization,
  getContactRequests,
  updateContactRequest,
  createContactRequest
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
 *               nombre_contacto:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               cantidad_animales:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud creada
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
 *         description: Lista de organizaciones
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
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               admin_username:
 *                 type: string
 *               admin_email:
 *                 type: string
 *               admin_password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organización creada
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
 *     responses:
 *       200:
 *         description: Organización actualizada
 */
router.put('/super-admin/organizations/:id/toggle', verificarToken, verificarSuperAdmin, toggleOrganization);

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
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get('/super-admin/contact-requests', verificarToken, verificarSuperAdmin, getContactRequests);

/**
 * @swagger
 * /api/super-admin/contact-requests/{id}:
 *   put:
 *     summary: Actualizar estado de solicitud
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
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
 *     responses:
 *       200:
 *         description: Solicitud actualizada
 */
router.put('/super-admin/contact-requests/:id', verificarToken, verificarSuperAdmin, updateContactRequest);

module.exports = router;
