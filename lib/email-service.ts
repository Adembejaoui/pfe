import nodemailer from "nodemailer"
import { renderAsync } from "@react-email/render"
import { ResetPasswordEmail } from "@/components/auth/reset-password-email"
import { VerificationEmail } from "@/components/auth/verification-email"

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
 */
export async function sendResetPasswordEmail(params: ResetPasswordEmailParams): Promise<any> {
  try {
    // Créer le transporteur
    const transporter = createTransporter()

    // Vérifier la connexion au serveur SMTP
    await transporter.verify()
    console.log("Connexion au serveur SMTP établie avec succès")

    // Générer le contenu HTML de l'email à partir du composant React
    // Utiliser renderAsync au lieu de render pour obtenir une chaîne de caractères
    const emailHtml = await renderAsync(
      ResetPasswordEmail({
        resetUrl: params.reset_link,
        username: params.to_name,
      }),
    )

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
      html: emailHtml, // Maintenant c'est une chaîne de caractères, pas une Promise
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

// Interface pour les paramètres d'email de vérification
interface VerificationEmailParams {
  to_email: string;
  to_name: string | null; // Allow null for to_name
  verification_link: string;
}

/**
 * Envoie un email de vérification via Nodemailer
 */
export async function sendVerificationEmail(params: VerificationEmailParams): Promise<any> {
  try {
    // Créer le transporteur
    const transporter = createTransporter();

    // Vérifier la connexion au serveur SMTP
    await transporter.verify();
    console.log("Connexion au serveur SMTP établie avec succès");

    // Use a default name if to_name is null
    const username = params.to_name || "Utilisateur";

    // Générer le contenu HTML de l'email à partir du composant React
    const emailHtml = await renderAsync(
      VerificationEmail({
        verificationUrl: params.verification_link,
        username: username,
      })
    );

    // Version texte simple de l'email
    const textContent = `
      Bonjour ${username},

      Merci de vous être inscrit. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien suivant ou en le copiant dans votre navigateur:
      ${params.verification_link}

      Ce lien expirera dans 24 heures.

      Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

      Cordialement,
      L'équipe de support
    `;

    // Configurer les options de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Support" <${process.env.SMTP_USER}>`,
      to: params.to_email,
      subject: "Vérification de votre adresse email",
      html: emailHtml,
      text: textContent,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email de vérification envoyé avec succès:", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de vérification:", error);
    throw error;
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
