const transporter = require('../config/email');

/**
 * Enviar email de notificación cuando llega una nueva solicitud de adopción
 * @param {Object} solicitud - Datos de la solicitud
 * @param {Object} animal - Datos del animal
 */
const notificarNuevaSolicitud = async (solicitud, animal) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn('ADMIN_EMAIL no configurado - No se enviará notificación');
      return { success: false, reason: 'ADMIN_EMAIL not configured' };
    }

    const mailOptions = {
      from: `"Adopciones" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Nueva solicitud de adopción para ${animal.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568; border-bottom: 2px solid #ed8936; padding-bottom: 10px;">
            Nueva Solicitud de Adopción
          </h2>

          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Datos del Animal</h3>
            <p><strong>Nombre:</strong> ${animal.nombre}</p>
            <p><strong>Especie:</strong> ${animal.especie}</p>
            <p><strong>ID:</strong> #${animal.id}</p>
          </div>

          <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Datos del Solicitante</h3>
            <p><strong>Nombre:</strong> ${solicitud.nombre_completo}</p>
            <p><strong>Edad:</strong> ${solicitud.edad} años</p>
            <p><strong>Email:</strong> <a href="mailto:${solicitud.email}">${solicitud.email}</a></p>
            <p><strong>WhatsApp:</strong> ${solicitud.telefono_whatsapp}</p>
            ${solicitud.instagram ? `<p><strong>Instagram:</strong> @${solicitud.instagram.replace('@', '')}</p>` : ''}
            <p><strong>Ciudad/Zona:</strong> ${solicitud.ciudad_zona}</p>
          </div>

          <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Información de Vivienda</h3>
            <p><strong>Tipo de vivienda:</strong> ${solicitud.tipo_vivienda}</p>
            <p><strong>Vive:</strong> ${solicitud.vive_solo_acompanado}</p>
            <p><strong>Todos de acuerdo:</strong> ${solicitud.todos_de_acuerdo ? 'Sí' : 'No'}</p>
          </div>

          <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Sobre Mascotas</h3>
            <p><strong>Tiene otros animales:</strong> ${solicitud.tiene_otros_animales ? 'Sí' : 'No'}</p>
            ${solicitud.tiene_otros_animales ? `<p><strong>Están castrados:</strong> ${solicitud.otros_animales_castrados || 'No especificado'}</p>` : ''}
            <p><strong>Experiencia previa:</strong> ${solicitud.experiencia_previa}</p>
          </div>

          <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Compromiso</h3>
            <p><strong>Puede cubrir gastos veterinarios:</strong> ${solicitud.puede_cubrir_gastos ? 'Sí' : 'No'}</p>
            ${solicitud.veterinaria_que_usa ? `<p><strong>Veterinaria que usa:</strong> ${solicitud.veterinaria_que_usa}</p>` : ''}
            <p><strong>Compromiso de castración:</strong> ${solicitud.compromiso_castracion ? 'Sí' : 'No'}</p>
          </div>

          <div style="background: #fffaf0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Motivación</h3>
            <p style="white-space: pre-wrap;">${solicitud.motivacion}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

          <p style="color: #718096; font-size: 14px;">
            <strong>ID de Solicitud:</strong> #${solicitud.id}<br>
            <strong>Fecha:</strong> ${new Date(solicitud.fecha_solicitud).toLocaleString('es-AR', {
              timeZone: 'America/Argentina/Buenos_Aires',
              dateStyle: 'long',
              timeStyle: 'short'
            })}
          </p>

          <p style="color: #718096; font-size: 12px; margin-top: 30px;">
            Este email fue enviado automáticamente desde la plataforma de adopción.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de notificación enviado a ${adminEmail} para solicitud #${solicitud.id}`);

    return { success: true };

  } catch (error) {
    console.error('Error al enviar email de notificación:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar que la configuración de email esté correcta
 */
const verificarConfiguracionEmail = async () => {
  try {
    await transporter.verify();
    console.log('Configuración de email verificada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error en configuración de email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  notificarNuevaSolicitud,
  verificarConfiguracionEmail
};
