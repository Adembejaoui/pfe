
import MainLayout from "@/app/Mainlayout"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Réinitialisation de mot de passe",
  description: "Définissez votre nouveau mot de passe",
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token || ""

  return (
    <MainLayout>
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full">
        <Card className="bg-black/95 text-white/85 border-white/10 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Réinitialisation de mot de passe</CardTitle>
            <CardDescription className="text-white/70">
              Entrez votre nouveau mot de passe pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  ) 
}
