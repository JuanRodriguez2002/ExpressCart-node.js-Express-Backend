import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

type EmailType = {
  name: string;
  email: string;
  token: string;
};

export class AuthEmail {
  
  // 🛠️ Función auxiliar privada para leer el logo y prepararlo para la API de Brevo
  private static getLogoAttachment() {
    try {
      const logoPath = path.join(__dirname, "../assets/logo_conF.png");
      if (fs.existsSync(logoPath)) {
        const base64Content = fs.readFileSync(logoPath, { encoding: 'base64' });
        return [
          {
            name: "logo.png",
            content: base64Content,
            cid: "expresscart-logo"
          }
        ];
      }
    } catch (error) {
      console.error("⚠️ No se pudo cargar el logo local para el correo:", error);
    }
    return undefined;
  }

  // 🚀 Función base que centraliza la petición HTTPS segura hacia Brevo
  private static async sendBrevoEmail(payload: object) {
    const url = 'https://api.brevo.com/v3/smtp/email';
    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;

    if (!apiKey) {
      throw new Error("Falta la API Key de Brevo en las variables de entorno (BREVO_API_KEY o EMAIL_PASS)");
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error en la API de Brevo: ${errorDetails}`);
    }

    const result = await response.json() as { messageId?: string };
    return result.messageId || "Success";
  }

  // 1. CONFIRMACIÓN DE CUENTA (CLIENTE)
  static sendConfirmationEmail = async (data: EmailType) => {
    const attachments = AuthEmail.getLogoAttachment();
    const messageId = await AuthEmail.sendBrevoEmail({
      sender: { name: "ExpressCart", email: "rodriguezsalasjuandiego070@gmail.com" },
      to: [{ email: data.email, name: data.name }],
      subject: "ExpressCart - Confirma tu cuenta",
      textContent: `Hola ${data.name}, confirma tu cuenta en ExpressCart utilizando el siguiente código: ${data.token}`,
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fbf9; padding: 40px 10px; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 75, 50, 0.05); overflow: hidden; border: 1px solid #eef2f0;">
                <tr>
                    <td align="center" style="padding: 30px 20px; background-color: #004B32;">
                        <img src="cid:expresscart-logo" alt="ExpressCart Logo" width="160" style="display: block; border: 0; outline: none; text-decoration: none; border-radius: 8px;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 30px;">
                        <h1 style="color: #1A3026; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">¡Hola, ${data.name}!</h1>
                        <p style="color: #4A5A51; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                            Gracias por unirte a <strong>ExpressCart</strong>. Para completar tu registro y asegurar tu cuenta, introduce el siguiente código de verificación en la aplicación:
                        </p>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
                            <tr>
                                <td align="center" style="background-color: #F0F7F4; border: 2px dashed #004B32; border-radius: 12px; padding: 18px 40px;">
                                    <span style="font-size: 32px; font-weight: 800; color: #004B32; letter-spacing: 6px; display: block; font-family: monospace;">${data.token}</span>
                                </td>
                            </tr>
                        </table>
                        <p style="color: #7A8B81; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                            Este código expira pronto y puede ser utilizado una sola vez. Si tú no creaste esta cuenta, puedes ignorar este correo con total seguridad.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 30px; background-color: #F8FAF9; border-top: 1px solid #eef2f0; text-align: center;">
                        <p style="color: #9AABA1; font-size: 12px; margin: 0 0 5px 0;">© 2026 ExpressCart. Todos los derechos reservados.</p>
                    </td>
                </tr>
            </table>
        </div>
      `,
      attachment: attachments
    });
    console.log("Confirmation email sent via API: %s", messageId);
  };

  // 2. RECUPERAR CONTRASEÑA (CLIENTE)
  static sendForgotPasswordEmail = async (user: EmailType) => {
    const attachments = AuthEmail.getLogoAttachment();
    const messageId = await AuthEmail.sendBrevoEmail({
      sender: { name: "ExpressCart", email: "rodriguezsalasjuandiego070@gmail.com" },
      to: [{ email: user.email, name: user.name }],
      subject: "ExpressCart - Restablece tu contraseña",
      textContent: `Hola ${user.name}, has solicitado restablecer tu contraseña. Utiliza el siguiente código para continuar: ${user.token}`,
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fbf9; padding: 40px 10px; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 75, 50, 0.05); overflow: hidden; border: 1px solid #eef2f0;">
                <tr>
                    <td align="center" style="padding: 30px 20px; background-color: #004B32;">
                        <img src="cid:expresscart-logo" alt="ExpressCart Logo" width="160" style="display: block; border: 0; outline: none; text-decoration: none; border-radius: 8px;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 30px;">
                        <h1 style="color: #1A3026; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">Restablecer Contraseña</h1>
                        <p style="color: #4A5A51; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                            Hola <strong>${user.name}</strong>, recibimos una solicitud para cambiar la contraseña de tu cuenta ExpressCart. Introduce este código de verificación en la aplicación para proceder con el cambio:
                        </p>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
                            <tr>
                                <td align="center" style="background-color: #FFF9F3; border: 2px dashed #D97706; border-radius: 12px; padding: 18px 40px;">
                                    <span style="font-size: 32px; font-weight: 800; color: #D97706; letter-spacing: 6px; display: block; font-family: monospace;">${user.token}</span>
                                </td>
                            </tr>
                        </table>
                        <p style="color: #7A8B81; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                            Si tú no solicitaste este cambio, puedes ignorar este correo de manera segura. Tu contraseña actual seguirá activa sin modificaciones.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 30px; background-color: #F8FAF9; border-top: 1px solid #eef2f0; text-align: center;">
                        <p style="color: #9AABA1; font-size: 12px; margin: 0 0 5px 0;">© 2026 ExpressCart. Todos los derechos reservados.</p>
                    </td>
                </tr>
            </table>
        </div>
      `,
      attachment: attachments
    });
    console.log("Password reset email sent via API: %s", messageId);
  };

  // 3. CONFIRMACIÓN DE CUENTA (SUPERMERCADO)
  static sendSupermarketConfirmationEmail = async (data: EmailType) => {
    const attachments = AuthEmail.getLogoAttachment();
    const messageId = await AuthEmail.sendBrevoEmail({
      sender: { name: "ExpressCart Business", email: "rodriguezsalasjuandiego070@gmail.com" },
      to: [{ email: data.email, name: data.name }],
      subject: "ExpressCart Business - Activa tu cuenta de Supermercado",
      textContent: `Estimado aliado de ${data.name}, active su cuenta comercial en ExpressCart utilizando el siguiente código: ${data.token}`,
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; padding: 40px 10px; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 75, 50, 0.05); overflow: hidden; border: 1px solid #e2e8e4;">
                <tr>
                    <td align="center" style="padding: 30px 20px; background-color: #004B32;">
                        <img src="cid:expresscart-logo" alt="ExpressCart Business" width="160" style="display: block; border: 0; outline: none; text-decoration: none; border-radius: 8px;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 30px;">
                        <h1 style="color: #1A3026; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">¡Bienvenido a ExpressCart Business!</h1>
                        <p style="color: #4A5A51; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: justify;">
                            Estimado administrador de <strong>${data.name}</strong>, le damos la bienvenida a nuestra red de aliados comerciales. Su cuenta como administrador de supermercado ha sido creada con éxito.
                        </p>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
                            <tr>
                                <td align="center" style="background-color: #E6F3ED; border: 2px solid #004B32; border-radius: 12px; padding: 18px 45px;">
                                    <span style="font-size: 32px; font-weight: 800; color: #004B32; letter-spacing: 6px; display: block; font-family: monospace;">${data.token}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 30px; background-color: #F0F4F2; border-top: 1px solid #e2e8e4; text-align: center;">
                        <p style="color: #8A9B91; font-size: 12px; margin: 0;">© 2026 ExpressCart Business. Módulo de Gestión de Sucursales.</p>
                    </td>
                </tr>
            </table>
        </div>
      `,
      attachment: attachments
    });
    console.log("Supermarket confirmation email sent via API: %s", messageId);
  };

  // 4. RECUPERAR CONTRASEÑA (SUPERMERCADO)
  static sendSupermarketForgotPasswordEmail = async (user: EmailType) => {
    const attachments = AuthEmail.getLogoAttachment();
    const messageId = await AuthEmail.sendBrevoEmail({
      sender: { name: "ExpressCart Business", email: "rodriguezsalasjuandiego070@gmail.com" },
      to: [{ email: user.email, name: user.name }],
      subject: "ExpressCart Business - Reestablecimiento de credenciales de acceso",
      textContent: `Estimado usuario de ${user.name}, utilice el siguiente código de seguridad para reestablecer sus credenciales: ${user.token}`,
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; padding: 40px 10px; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 75, 50, 0.05); overflow: hidden; border: 1px solid #e2e8e4;">
                <tr>
                    <td align="center" style="padding: 30px 20px; background-color: #004B32;">
                        <img src="cid:expresscart-logo" alt="ExpressCart Business" width="160" style="display: block; border: 0; outline: none; text-decoration: none; border-radius: 8px;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 30px;">
                        <h1 style="color: #1A3026; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">Restablecimiento de Credenciales</h1>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
                            <tr>
                                <td align="center" style="background-color: #FFF5EC; border: 2px dashed #D97706; border-radius: 12px; padding: 18px 45px;">
                                    <span style="font-size: 32px; font-weight: 800; color: #D97706; letter-spacing: 6px; display: block; font-family: monospace;">${user.token}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 30px; background-color: #F0F4F2; border-top: 1px solid #e2e8e4; text-align: center;">
                        <p style="color: #8A9B91; font-size: 12px; margin: 0;">© 2026 ExpressCart Business. Todos los derechos reservados.</p>
                    </td>
                </tr>
            </table>
        </div>
      `,
      attachment: attachments
    });
    console.log("Supermarket password reset email sent via API: %s", messageId);
  };
}