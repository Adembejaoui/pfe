"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, EyeIcon, EyeOffIcon, KeyRound, LockIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Schéma de validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[a-zA-Z]/, "Le mot de passe doit contenir au moins une lettre")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Token de réinitialisation manquant")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue")
      }

      setIsSuccess(true)
      toast.success("Mot de passe réinitialisé avec succès")

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/authentification")
      }, 3000)
    } catch (error: any) {
      console.error("Erreur:", error)
      toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Si le token est manquant, afficher un message d'erreur
  if (!token) {
    return (
      <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-white">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Token invalide</AlertTitle>
        <AlertDescription>
          Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full mt-2 border-white/20 text-white hover:bg-white/10">
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
      </Alert>
    )
  }

  // Si la réinitialisation a réussi, afficher un message de succès
  if (isSuccess) {
    return (
      <Alert className="bg-green-900/30 border-green-800 text-white">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Mot de passe réinitialisé</AlertTitle>
        <AlertDescription>
          Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/authentification">
            <Button className="w-full mt-2 bg-white text-black hover:bg-white/90">Se connecter</Button>
          </Link>
        </div>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90 flex items-center gap-2">
            <LockIcon className="h-4 w-4" /> Nouveau mot de passe
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              disabled={isLoading}
              className="bg-black/50 border-white/20 text-white pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/90 flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Confirmer le mot de passe
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              disabled={isLoading}
              className="bg-black/50 border-white/20 text-white pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black hover:bg-white/90 transition-all"
        >
          {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
        </Button>

        <div className="text-center">
          <Link
            href="/authentification"
            className="text-sm text-white/70 hover:text-white/100 underline underline-offset-4"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>

      <div className="mt-6 text-sm text-white/60">
        <p>Votre mot de passe doit contenir au moins:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li className={errors.password?.message?.includes("8 caractères") ? "text-red-400" : ""}>8 caractères</li>
          <li className={errors.password?.message?.includes("une lettre") ? "text-red-400" : ""}>Une lettre</li>
          <li className={errors.password?.message?.includes("un chiffre") ? "text-red-400" : ""}>Un chiffre</li>
          <li className={errors.password?.message?.includes("un caractère spécial") ? "text-red-400" : ""}>
            Un caractère spécial
          </li>
        </ul>
      </div>
    </form>
  )
}
