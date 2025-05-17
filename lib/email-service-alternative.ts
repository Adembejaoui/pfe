import nodemailer from "nodemailer"

// Configuration du transporteur Nodemailer
const createTransporter = () => {
  // Vérifier si les variables d'environnement sont définies
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "Configuration SMTP manquante. Vérifiez vos variables d'environnement (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).",
    )
  }

  // Créer le transporteur avec les informations SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // true pour le port 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Interface pour les paramètres d'email de réinitialisation
interface ResetPasswordEmailParams {
  to_email: string
  to_name: string
  reset_link: string
}

/**
 * Envoie un email de réinitialisation de mot de passe via Nodemailer
 * Version alternative sans React Email pour éviter les problèmes de rendu
 */
export async function sendResetPasswordEmail(params: ResetPasswordEmailParams): Promise<any> {
  try {
    // Créer le transporteur
    const transporter = createTransporter()

    // Vérifier la connexion au serveur SMTP
    await transporter.verify()
    console.log("Connexion au serveur SMTP établie avec succès")

    // Créer un template HTML simple sans dépendance à React Email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de mot de passe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f6f9fc;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e6e6e6;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: block;
            width: max-content;
            margin: 30px auto;
            padding: 12px 24px;
            background-color: #000;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
          }
          .link {
            word-break: break-all;
            color: #0066cc;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${params.to_name},</p>
            
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
            
            <a href="${params.reset_link}" class="button">Réinitialiser mon mot de passe</a>
            
            <p>Ou copiez et collez ce lien dans votre navigateur:</p>
            <p class="link">${params.reset_link}</p>
          </div>
          
          <div class="footer">
            <p>Ce lien expirera dans 1 heure. Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email ou nous contacter si vous avez des questions.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Version texte simple de l'email
    const textContent = `
      Bonjour ${params.to_name},

      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. 
      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.

      Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant ou le copier dans votre navigateur:
      ${params.reset_link}

      Ce lien expirera dans 1 heure.

      Cordialement,
      L'équipe de support
    `

    // Configurer les options de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Support" <${process.env.SMTP_USER}>`,
      to: params.to_email,
      subject: "Réinitialisation de votre mot de passe",
      html: htmlContent,
      text: textContent,
    }

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email envoyé avec succès:", info.messageId)
    return info
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw error
  }
}

/**
 * Fonction de test pour vérifier la configuration SMTP
 */
export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { success: true, message: "Connexion au serveur SMTP établie avec succès" }
  } catch (error) {
    console.error("Erreur de connexion au serveur SMTP:", error)
    return {
      success: false,
      message: `Erreur de connexion au serveur SMTP: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
