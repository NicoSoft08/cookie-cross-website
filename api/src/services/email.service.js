
require('@babel/register')({
    extensions: ['.js', '.jsx'],
    ignore: [/node_modules/],
});

const ejs = require('ejs');
const { transporter } = require("../utils/mailer");
const path = require('path');


class EmailService {

    /**
   * Envoyer l'email de réinitialisation de mot de passe
   */

    static async sendPasswordResetEmail(email, firstName, lastName, resetLink, expiresAt) {
        try {
            const expirationTime = new Date(expiresAt).toLocaleString('fr-FR', {
                timeZone: 'Europe/Paris',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const templatePath = path.join(__dirname, '../templates/password-reset.ejs');

            const html = await ejs.renderFile(templatePath, {
                email,
                firstName,
                lastName,
                resetLink,
                expirationTime,
                year: new Date().getFullYear()
            });

            const mailOptions = {
                from: `"AdsCity Sécurité" <${process.env.SMTP_MAIL}>`,
                to: email,
                replyTo: process.env.SUPPORT_EMAIL,
                subject: '🔐 Réinitialisation de votre mot de passe - AdsCity',
                html,
            }

            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email de réinitialisation envoyé à ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email réinitialisation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
  * Envoyer l'email de confirmation de réinitialisation
  */

    static async sendPasswordResetConfirmation(email, firstName, lastName, ipAddress = null) {
        try {
            const resetTime = new Date().toLocaleString('fr-FR', {
                timeZone: 'Europe/Paris',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const mailOptions = {
                from: `"AdsCity Sécurité" <${process.env.SMTP_MAIL}>`,
                to: email,
                replyTo: process.env.SUPPORT_EMAIL,
                subject: '✅ Mot de passe réinitialisé avec succès - AdsCity',
                html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mot de passe réinitialisé</title>
                <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f4f4f4; 
                }
                .container { 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white; 
                    border-radius: 10px; 
                    overflow: hidden; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                }
                .header { 
                    background: linear-gradient(135deg, #00b894 0%, #00a085 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: 300; 
                }
                .content { 
                    padding: 40px 30px; 
                }
                .success-icon { 
                    text-align: center; 
                    font-size: 60px; 
                    margin-bottom: 20px; 
                }
                .message { 
                    font-size: 16px; 
                    margin-bottom: 20px; 
                    line-height: 1.8; 
                    text-align: center; 
                }
                .details { 
                    background: #f8f9fa; 
                    border-radius: 8px; 
                    padding: 20px; 
                    margin: 20px 0; 
                }
                .security-tips { 
                    background: #e3f2fd; 
                    border-left: 4px solid #2196f3; 
                    padding: 15px; 
                    margin: 20px 0; 
                    font-size: 14px; 
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 20px 30px; 
                    text-align: center; 
                    font-size: 12px; 
                    color: #6c757d; 
                    border-top: 1px solid #dee2e6; 
                }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="header">
                    <h1>✅ Mot de passe réinitialisé</h1>
                </div>
                
                <div class="content">
                    <div class="success-icon">🎉</div>
                    
                    <div class="message">
                    <strong>Bonjour ${firstName} ${lastName},</strong><br><br>
                    Votre mot de passe a été réinitialisé avec succès !<br>
                    Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </div>
                    
                    <div class="details">
                    <strong>📋 Détails de la réinitialisation :</strong><br>
                    • Date et heure : ${resetTime}<br>
                    ${ipAddress ? `• Adresse IP : ${ipAddress}<br>` : ''}
                    • Compte : ${email}
                    </div>
                    
                    <div class="security-tips">
                    <strong>🔒 Conseils de sécurité :</strong><br>
                    • Utilisez un mot de passe unique pour chaque service<br>
                    • Activez l'authentification à deux facteurs<br>
                    • Ne partagez jamais vos identifiants<br>
                    • Surveillez régulièrement l'activité de votre compte
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                    <p><strong>Si cette action n'a pas été effectuée par vous, contactez immédiatement notre support.</strong></p>
                    </div>
                </div>
                
                <div class="footer">
                        <p>
                        Cet email a été envoyé par AdsCity<br>
                        Si vous avez des questions, contactez notre support : support@adscity.net
                        </p>
                        <p style="margin-top: 15px;">
                        © ${new Date().getFullYear()} AdsCity. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `
            }

            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email de confirmation envoyé à ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email réinitialisation:', error);
            return { success: false, error: error.message };

        }
    }

    /**
   * Envoyer une alerte de sécurité pour tentative suspecte
   */

    static async sendSecurityAlert(email, firstName, lastName, ip, browser, os, device, country, city) {
        try {
            const alertTime = new Date().toLocaleString('fr-FR', {
                timeZone: 'Europe/Paris',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const appUrl = process.env.APP_URL;

            const templatePath = path.join(__dirname, '../templates/security-alert.ejs');

            const html = await ejs.renderFile(templatePath, {
                email, firstName, lastName, ip, browser, os, device, country, city, alertTime, appUrl,
                year: new Date().getFullYear()
            });
            const mailOptions = {
                from: `"AdsCity Security" <${process.env.SMTP_MAIL}>`,
                to: email,
                replyTo: process.env.SUPPORT_EMAIL,
                subject: '🚨 Alerte de sécurité - Tentative de connexion suspecte',
                html: html
            }

            const result = await transporter.sendMail(mailOptions);
            console.log(`🚨 Alerte de sécurité envoyée à ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi alerte sécurité:', error);
            return { success: false, error: error.message };
        }
    }

    static async sendEmailWithVerificationCode(email, firstName, lastName, code, expiresAt) {

        const expirationTime = new Date(expiresAt).toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const templatePath = path.join(__dirname, '../templates/email-verification.ejs');

        const html = await ejs.renderFile(templatePath, {
            email,
            firstName,
            lastName,
            code,
            expirationTime,
            year: new Date().getFullYear()
        });

        try {
            const mailOptions = {
                from: `"AdsCity Sécurité" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Vérification de votre adresse email',
                html,
            };

            const result = await transporter.sendMail(mailOptions);
            console.log(`Email de vérification envoyée à ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email avec code de vérification:', error);
            return { success: false, error: error.message };
        }
    }

    static async sendTwoDigitChallenge(email, firstName, lastName, code, expiresAt) {
        const expirationTime = expiresAt.toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const templatePath = path.join(__dirname, '../templates/two-digit-challenge.ejs');
        const html = await ejs.renderFile(templatePath, {
            email,
            firstName,
            lastName,
            code,
            expirationTime,
            year: new Date().getFullYear()
        });

        try {
            const mailOptions = {
                from: `"AdsCity Sécurité" <${process.env.EMAIL_USER}>`,
                to: email,
                replyTo: process.env.SUPPORT_EMAIL,
                subject: '🛡️ Vérification de Sécurité',
                html,
            };

            const result = await transporter.sendMail(mailOptions);
            console.log(`Email de vérification envoyée à ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email avec code de vérification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
   * Tester la configuration email
   */
    static async testEmailConfiguration() {
        try {
            await transporter.verify();
            console.log('✅ Configuration email valide');
            return { success: true, message: 'Configuration email valide' };
        } catch (error) {
            console.error('❌ Configuration email invalide:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;