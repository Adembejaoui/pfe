"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import SpecialButton from "../ui/SpecialButton"

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue")
      }

      // Afficher le message de succès même si l'email n'existe pas (pour des raisons de sécurité)
      setIsSubmitted(true)
      toast.success("Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.")

      // Stocker les informations de débogage si elles existent
      if (result.debug) {
        setDebugInfo(result.debug)
        console.log("Informations de débogage:", result.debug)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const testSmtpConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "GET",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue lors du test de connexion SMTP")
      }

      toast.success("Connexion au serveur SMTP établie avec succès")
      console.log("Résultat du test SMTP:", result)
    } catch (error) {
      console.error("Erreur lors du test de connexion SMTP:", error)
      toast.error("Échec de la connexion au serveur SMTP. Vérifiez les logs du serveur.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-white/80">
          Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.
        </p>
        <p className="text-white/80">Vérifiez votre boîte de réception et vos spams.</p>

        {/* Afficher les informations de débogage en mode développement */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <div className="mt-8 p-4 bg-gray-800 rounded-md text-left">
            <h3 className="text-white font-bold mb-2">Informations de débogage:</h3>
            <p className="text-white/80 text-sm break-all">Token: {debugInfo.token}</p>
            <p className="text-white/80 text-sm break-all">URL: {debugInfo.resetUrl}</p>
            <p className="text-white/80 text-sm">Expire le: {new Date(debugInfo.expiresAt).toLocaleString()}</p>
          </div>
        )}

        <div className="mt-4">
          <Link href="/authentification">
            <SpecialButton text="Retour à la connexion" type="button" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          {...register("email")}
          disabled={isLoading}
          className="bg-black/50 border-white/20 text-white"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-4">
        <SpecialButton
          text={isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          type="submit"
          disabled={isLoading}
        />
        <div className="text-center">
          <Link
            href="/authentification"
            className="text-sm text-white/70 hover:text-white/100 underline underline-offset-4"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </form>
  )
}
