import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import MainLayout from "@/app/Mainlayout"

export const metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez votre mot de passe",
}

export default function ForgotPasswordPage() {
  return (
    <MainLayout>
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full px-4">
        <Card className="bg-black/95 text-white/85">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
            <CardDescription className="text-white/70">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  )
}
