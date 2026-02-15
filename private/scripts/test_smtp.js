const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('========================================');
console.log('   Prueba de Conexión SMTP Gmail');
console.log('========================================\n');

console.log('Configuración cargada desde .env:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NO CONFIGURADA');
console.log('SMTP_FROM:', process.env.SMTP_FROM);
console.log('');

// Configuración del transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Mostrar logs de debug
    logger: true // Mostrar logs detallados
});

console.log('Verificando conexión SMTP...\n');

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Error de conexión SMTP:');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.code);
        console.error('Comando:', error.command);
        console.error('\nDetalles completos:', error);
        process.exit(1);
    } else {
        console.log('✅ Conexión SMTP exitosa!');
        console.log('El servidor está listo para enviar correos.\n');

        // Intentar enviar un correo de prueba
        console.log('Enviando correo de prueba...\n');

        transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Enviar a ti mismo
            subject: 'Prueba de Configuración SMTP - El Amatal',
            html: `
        <div style="font-family: sans-serif; text-align: center; color: #333;">
          <h1>✅ Configuración SMTP Exitosa</h1>
          <p>Este es un correo de prueba del sistema Centro Escolar El Amatal.</p>
          <p>Si recibes este correo, significa que la configuración SMTP está funcionando correctamente.</p>
          <hr>
          <small>Configuración: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</small>
        </div>
      `,
        }, (error, info) => {
            if (error) {
                console.error('❌ Error al enviar correo de prueba:');
                console.error('Mensaje:', error.message);
                console.error('Código:', error.code);
                console.error('\nDetalles completos:', error);
                process.exit(1);
            } else {
                console.log('✅ Correo de prueba enviado exitosamente!');
                console.log('Message ID:', info.messageId);
                console.log('Response:', info.response);
                console.log('\n🎉 Todo funciona correctamente!');
                console.log('Revisa tu bandeja de entrada en:', process.env.SMTP_USER);
                process.exit(0);
            }
        });
    }
});
