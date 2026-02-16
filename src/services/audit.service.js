const prisma = require('../config/database');

/**
 * Acciones de auditoría disponibles
 */
const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  STATUS_CHANGE: 'STATUS_CHANGE'
};

/**
 * Tipos de entidad que se pueden auditar
 */
const ENTITY_TYPES = {
  ANIMAL: 'Animal',
  SOLICITUD_ADOPCION: 'SolicitudAdopcion',
  SOLICITUD_CONTACTO: 'SolicitudContacto',
  ORGANIZACION: 'Organizacion',
  ADMINISTRADOR: 'Administrador',
  CASO_EXITO: 'CasoExito'
};

/**
 * Registra una acción en el audit log
 * @param {Object} params
 * @param {string} params.action - Acción realizada (CREATE, UPDATE, DELETE, etc.)
 * @param {string} params.entityType - Tipo de entidad afectada
 * @param {number} params.entityId - ID de la entidad afectada
 * @param {Object} params.admin - Admin que realizó la acción (opcional)
 * @param {Object} params.oldValues - Valores anteriores (para updates)
 * @param {Object} params.newValues - Valores nuevos
 * @param {Object} params.req - Request de Express (para IP y user-agent)
 */
async function logAudit({
  action,
  entityType,
  entityId,
  admin = null,
  oldValues = null,
  newValues = null,
  req = null
}) {
  try {
    // Obtener IP real (considerando proxies)
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection?.remoteAddress;
      userAgent = req.headers['user-agent']?.substring(0, 500);
    }

    // Limpiar valores sensibles antes de guardar
    const sanitizedOldValues = sanitizeForAudit(oldValues);
    const sanitizedNewValues = sanitizeForAudit(newValues);

    await prisma.auditLog.create({
      data: {
        action,
        entity_type: entityType,
        entity_id: entityId,
        admin_id: admin?.id || null,
        admin_username: admin?.username || null,
        organizacion_id: admin?.organizacion_id || null,
        old_values: sanitizedOldValues,
        new_values: sanitizedNewValues,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    });
  } catch (error) {
    // No fallar la operación principal por error de auditoría
    console.error('Error al registrar auditoría:', error);
  }
}

/**
 * Elimina campos sensibles antes de guardar en el log
 */
function sanitizeForAudit(values) {
  if (!values) return null;

  const sanitized = { ...values };

  // Campos sensibles que no deben guardarse
  const sensitiveFields = ['password_hash', 'password', 'token', 'jwt'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Obtiene el historial de auditoría de una entidad
 */
async function getEntityAuditHistory(entityType, entityId, limit = 50) {
  return prisma.auditLog.findMany({
    where: {
      entity_type: entityType,
      entity_id: entityId
    },
    orderBy: { timestamp: 'desc' },
    take: limit
  });
}

/**
 * Obtiene el historial de auditoría de un administrador
 */
async function getAdminAuditHistory(adminId, limit = 100) {
  return prisma.auditLog.findMany({
    where: { admin_id: adminId },
    orderBy: { timestamp: 'desc' },
    take: limit
  });
}

module.exports = {
  logAudit,
  getEntityAuditHistory,
  getAdminAuditHistory,
  AUDIT_ACTIONS,
  ENTITY_TYPES
};
