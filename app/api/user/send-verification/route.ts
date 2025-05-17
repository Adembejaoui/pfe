import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email-service"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 })
    }

    // Trouver l'utilisateur
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'utilisateur existe
      return NextResponse.json(
        { message: "Si votre email est enregistré, un lien de vérification vous sera envoyé." },
        { status: 200 },
      )
    }

    // Si l'email est déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Votre email est déjà vérifié. Vous pouvez vous connecter." },
        { status: 200 },
      )
    }

    // Générer un token de vérification
    const verificationToken = uuidv4()
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Expire dans 24 heures

    // Mettre à jour l'utilisateur avec le token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    })

    // Ensure username is not null
    const safeUsername = user.username || email.split("@")[0]

    // Get the base URL from environment or request
    

    // Générer le lien de vérification
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/user/verify?token=${verificationToken}`

    // Envoyer l'email de vérification
    await sendVerificationEmail({
      to_email: user.email,
      to_name: safeUsername,
      verification_link: verificationLink,
    })

    return NextResponse.json(
      { message: "Un lien de vérification a été envoyé à votre adresse email." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erreur lors de l'envoi du lien de vérification:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'envoi du lien de vérification" },
      { status: 500 },
    )
  }
}
