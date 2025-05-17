import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
// Importer la version alternative du service d'email si la version React Email pose problème
// import { sendResetPasswordEmail } from "@/lib/email-service"
import { sendResetPasswordEmail } from "@/lib/email-service-alternative"

// Durée de validité du token (1 heure)
const TOKEN_EXPIRY = 60 * 60 * 1000 // 1 heure en millisecondes

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "L'adresse email est requise" }, { status: 400 })
    }

    console.log(`[DEBUG] Demande de réinitialisation pour l'email: ${email}`)

    // Vérifier si l'utilisateur existe
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`[DEBUG] Utilisateur non trouvé pour l'email: ${email}`)
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return NextResponse.json(
        { message: "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation." },
        { status: 200 },
      )
    }

    console.log(`[DEBUG] Utilisateur trouvé: ${user.id}`)

    // Générer un token unique
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY)

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    try {
      await db.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      })
      console.log(`[DEBUG] Anciens tokens supprimés pour l'utilisateur: ${user.id}`)
    } catch (error) {
      console.error(`[ERROR] Erreur lors de la suppression des anciens tokens:`, error)
    }

    // Créer un nouveau token dans la base de données
    try {
      const passwordResetToken = await db.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      })
      console.log(`[DEBUG] Nouveau token créé: ${passwordResetToken.id}`)
    } catch (error) {
      console.error(`[ERROR] Erreur lors de la création du token:`, error)
      return NextResponse.json({ error: "Erreur lors de la création du token de réinitialisation" }, { status: 500 })
    }

    // URL de réinitialisation
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${appUrl}/authentification/reset-password?token=${token}`
    console.log(`[DEBUG] URL de réinitialisation: ${resetUrl}`)

    // Envoyer l'email avec Nodemailer
    try {
      console.log(`[DEBUG] Tentative d'envoi d'email via Nodemailer à ${email}`)

      const emailResult = await sendResetPasswordEmail({
        to_email: email,
        to_name: user.username || "Utilisateur",
        reset_link: resetUrl,
      })

      console.log(`[DEBUG] Email envoyé avec succès:`, emailResult)
    } catch (error) {
      console.error(`[ERROR] Erreur lors de l'envoi de l'email:`, error)
      // Malgré l'erreur d'envoi d'email, nous retournons un succès pour des raisons de sécurité
      // mais nous loggons l'erreur pour le débogage
    }

    return NextResponse.json(
      {
        message: "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.",
        debug:
          process.env.NODE_ENV === "development"
            ? {
                resetUrl,
                token,
                expiresAt,
              }
            : undefined,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[ERROR] Erreur lors de la demande de réinitialisation:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la demande de réinitialisation" },
      { status: 500 },
    )
  }
}
