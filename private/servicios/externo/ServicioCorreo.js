const nodemailer = require('nodemailer');

/**
 * Servicio de correo electrónico
 */
class ServicioCorreo {
  /**
   * @param {Object} configuracion - Configuración SMTP de configuracionApp
   */
  constructor(configuracion) {
    this.configuracion = configuracion;

    console.log('[CORREO] Inicializando servicio de correo con configuración:', {
      host: configuracion.host,
      port: configuracion.port,
      user: configuracion.user,
      from: configuracion.from,
    });

    this.transporter = nodemailer.createTransport({
      host: configuracion.host,
      port: configuracion.port,
      secure: configuracion.port === 465, // true para 465, false para otros puertos
      auth: {
        user: configuracion.user,
        pass: configuracion.pass,
      },
      // Opciones adicionales para Gmail
      tls: {
        // No fallar en certificados inválidos
        rejectUnauthorized: false
      },
      // Timeout más largo
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verificar la conexión al inicializar
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[CORREO] ❌ Error al verificar conexión SMTP:', error);
      } else {
        console.log('[CORREO] ✅ Servidor SMTP listo para enviar correos');
      }
    });
  }

  /**
   * Envía un correo de recuperación de contraseña
   */
  async enviarCodigoRecuperacion(correo, token) {
    console.log('[CORREO] Preparando envío de código de recuperación');
    console.log('[CORREO] Destinatario:', correo);
    console.log('[CORREO] Token:', token);
    console.log('[CORREO] Configuración SMTP:', {
      host: this.configuracion.host,
      port: this.configuracion.port,
      user: this.configuracion.user,
      from: this.configuracion.from,
    });

    const html = `
      <div style="font-family: sans-serif; text-align: center; color: #333;">
        <h1>Código de Recuperación</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Tu código de verificación es:</p>
        <div style="background: #f0f8ff; padding: 20px; margin: 20px auto; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0056b3;">${token}</span>
        </div>
        <p>Este código expira en 15 minutos.</p>
        <small>Si no solicitaste este cambio, ignora este correo.</small>
      </div>
    `;

    try {
      console.log('[CORREO] Enviando correo...');
      const info = await this.transporter.sendMail({
        from: `"Centro Escolar" <${this.configuracion.from}>`,
        to: correo,
        subject: `Código de recuperación: ${token}`,
        html: html,
      });
      console.log('[CORREO] ✅ Correo enviado exitosamente');
      console.log('[CORREO] Message ID:', info.messageId);
      console.log('[CORREO] Response:', info.response);
      return info;
    } catch (error) {
      console.error('[CORREO] ❌ Error al enviar correo:', error.message);
      console.error('[CORREO] Código de error:', error.code);
      console.error('[CORREO] Comando:', error.command);
      throw error;
    }
  }

  /**
   * Método genérico para enviar correos
   */
  async enviarCorreo(opciones) {
    return this.transporter.sendMail({
      from: `"Centro Escolar" <${this.configuracion.from}>`,
      ...opciones,
    });
  }
}

module.exports = ServicioCorreo;
