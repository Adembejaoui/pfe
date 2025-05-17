"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SpecialButton from "../ui/SpecialButton"
import { toast } from "sonner"
import Link from "next/link"
import { Mail, CheckCircle } from "lucide-react"

const resendSchema = z.object({
  email: z.string().email("Adresse email invalide"),
})

type ResendFormValues = z.infer<typeof resendSchema>

export function ResendVerificationEmail() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
  })

  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")

  const onSubmit = async (data: ResendFormValues) => {
    try {
      const response = await fetch("/api/user/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success(responseData.message || "Email de vérification envoyé avec succès!")
        setIsEmailSent(true)
        setSentEmail(data.email)
        reset()
      } else {
        toast.error(responseData.message || "Une erreur est survenue. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error)
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.")
    }
  }

  if (isEmailSent) {
    return (
      <Card className="bg-black/80 border border-gray-700 shadow-xl backdrop-blur-sm text-white">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Email Envoyé</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Veuillez vérifier votre boîte de réception
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Nous avons envoyé un email de vérification à <strong className="text-white">{sentEmail}</strong>. Veuillez
              vérifier votre boîte de réception et cliquer sur le lien de vérification pour activer votre compte.
            </p>
            <p className="text-sm text-gray-400">Si vous ne voyez pas l'email, veuillez vérifier votre dossier spam.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Link href="/authentification" className="w-full">
            <SpecialButton text="Retour à la connexion" type="button" className="w-full" />
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-black/80 border border-gray-700 shadow-xl backdrop-blur-sm text-white">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-full bg-indigo-900/30 flex items-center justify-center">
            <Mail className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Renvoyer l'email de vérification</CardTitle>
        <CardDescription className="text-gray-400 text-center">
          Entrez votre adresse email pour recevoir un nouveau lien de vérification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                {...register("email")}
                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
            </div>

            <SpecialButton
              text={isSubmitting ? "Envoi en cours..." : "Envoyer le lien de vérification"}
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400 w-full text-center">
          Vous avez déjà un compte vérifié?{" "}
          <Link href="/authentification" className="text-indigo-400 hover:text-indigo-300 hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
