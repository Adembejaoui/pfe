import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcrypt"

export async function POST(request: Request) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      return NextResponse.json(
        {
          error: "Format de requête invalide.",
        },
        { status: 400 },
      )
    }

    const { token, newPassword } = body

    // Validate input
    if (!token) {
      console.error("Missing token in request")
      return NextResponse.json(
        {
          error: "Token requis.",
        },
        { status: 400 },
      )
    }

    if (!newPassword) {
      console.error("Missing newPassword in request")
      return NextResponse.json(
        {
          error: "Nouveau mot de passe requis.",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 },
      )
    }

    console.log("Looking for token:", token.substring(0, 10) + "...")

    // Find password reset token
    let passwordResetToken
    try {
      passwordResetToken = await db.passwordResetToken.findFirst({
        where: {
          token,
          used: false,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      })
    } catch (dbError) {
      console.error("Database query error:", dbError)
      return NextResponse.json(
        {
          error: "Erreur de base de données.",
        },
        { status: 500 },
      )
    }

    if (!passwordResetToken) {
      console.error("Token not found or expired")

      // Check if token exists but is used or expired for better debugging
      const existingToken = await db.passwordResetToken.findFirst({
        where: { token },
      })

      if (existingToken) {
        if (existingToken.used) {
          console.error("Token already used")
          return NextResponse.json(
            {
              error: "Ce token a déjà été utilisé.",
            },
            { status: 400 },
          )
        }
        if (existingToken.expiresAt <= new Date()) {
          console.error("Token expired")
          return NextResponse.json(
            {
              error: "Ce token a expiré.",
            },
            { status: 400 },
          )
        }
      }

      return NextResponse.json(
        {
          error: "Token invalide.",
        },
        { status: 400 },
      )
    }

    console.log("Token found for user:", passwordResetToken.user.email)

    // Hash new password
    let hashedPassword
    try {
      hashedPassword = await hash(newPassword, 12) // Increased salt rounds for better security
    } catch (hashError) {
      console.error("Password hashing error:", hashError)
      return NextResponse.json(
        {
          error: "Erreur lors du traitement du mot de passe.",
        },
        { status: 500 },
      )
    }

    // Update user password and mark token as used in a transaction
    try {
      await db.$transaction([
        db.user.update({
          where: { id: passwordResetToken.userId },
          data: { password: hashedPassword },
        }),
        db.passwordResetToken.update({
          where: { id: passwordResetToken.id },
          data: { used: true },
        }),
      ])
    } catch (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour.",
        },
        { status: 500 },
      )
    }

    console.log("Password reset successful for user:", passwordResetToken.user.email)

    return NextResponse.json(
      {
        message: "Mot de passe réinitialisé avec succès.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unexpected Reset Password Error:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur inattendue.",
      },
      { status: 500 },
    )
  }
}
