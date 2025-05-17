import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    const redirectUrl = searchParams.get("redirect") || "/dashboard/Client/Orders"

    if (!token) {
      return NextResponse.redirect(new URL("/authentification?error=missing_token", request.url))
    }

    // Trouver l'utilisateur avec ce token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Le token n'a pas expiré
        },
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL("/authentification?error=invalid_token", request.url))
    }

    // Mettre à jour l'utilisateur
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    })

    // If user is already logged in, redirect to dashboard
    // Otherwise, redirect to login page with success message
    const isLoggedIn =
      request.cookies.has("next-auth.session-token") || request.cookies.has("__Secure-next-auth.session-token")

    if (isLoggedIn) {
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    } else {
      return NextResponse.redirect(new URL("/authentification?success=email_verified", request.url))
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error)
    return NextResponse.redirect(new URL("/authentification?error=verification_failed", request.url))
  }
}
