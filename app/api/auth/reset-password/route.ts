// /app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcrypt";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token et nouveau mot de passe requis." }, { status: 400 });
    }

    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }, // not expired
      },
      include: { user: true },
    });

    if (!passwordResetToken) {
      return NextResponse.json({ error: "Token invalide ou expiré." }, { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 10);

    await db.user.update({
      where: { id: passwordResetToken.userId },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.update({
      where: { id: passwordResetToken.id },
      data: { used: true },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
