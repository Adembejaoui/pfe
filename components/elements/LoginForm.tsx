"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import SpecialButton from "../ui/SpecialButton"
import Link from "next/link"
import { toast } from "sonner"
import { useEffect } from "react"

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const success = searchParams.get("success")

  // Handle URL parameters with toast notifications
  useEffect(() => {
    if (error) {
      switch (error) {
        case "verification_failed":
          toast.error(
            "La vérification de votre email a échoué. Veuillez réessayer ou demander un nouveau lien de vérification.",
          )
          break
        case "invalid_token":
          toast.error(
            "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien de vérification.",
          )
          break
        case "missing_token":
          toast.error("Le token de vérification est manquant. Veuillez utiliser le lien complet envoyé par email.")
          break
        case "AuthError":
          toast.error("Une erreur d'authentification s'est produite. Veuillez réessayer.")
          break
        default:
          toast.error("Une erreur s'est produite. Veuillez réessayer.")
      }
    }

    if (success) {
      switch (success) {
        case "email_verified":
          toast.success("Votre email a été vérifié avec succès! Vous pouvez maintenant vous connecter.")
          break
        default:
          toast.success("Opération réussie!")
      }
    }
  }, [error, success])

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const signInData = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInData?.error) {
        // Check if the error is about email verification
        if (signInData.error.includes("vérifier votre email")) {
          toast.error("Veuillez vérifier votre email avant de vous connecter.", {
            description: (
              <Link href="/authentification/resend-verification" className="text-white underline">
                Renvoyer l'email de vérification
              </Link>
            ),
            duration: 6000,
          })
        } else {
          setError("email", { type: "manual", message: "Email ou mot de passe incorrect" })
          setError("password", { type: "manual", message: "Email ou mot de passe incorrect" })
          toast.error("Échec de la connexion. Veuillez vérifier vos identifiants.")
        }
      } else {
        toast.success("Connexion réussie!")
        router.refresh()
        router.push("/dashboard/home")
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-black/95 text-white/85">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription className="text-white/70">
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  {...register("email")}
                  className="bg-black/50 border-white/20 text-white"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/authentification/forgot-password"
                    className="text-sm text-white/70 hover:text-white/100 underline underline-offset-4"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-black/50 border-white/20 text-white"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  onCheckedChange={(checked) => {
                    setValue("rememberMe", checked === true)
                  }}
                  className="border-white/20 data-[state=checked]:bg-white/80 data-[state=checked]:text-black"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Se souvenir de moi
                </Label>
              </div>

              <SpecialButton
                text={isSubmitting ? "Connexion en cours..." : "Se connecter"}
                type="submit"
                disabled={isSubmitting}
              />

              <div className="text-center">
                <p className="text-sm text-white/70">
                  Vous n'avez pas reçu l'email de vérification?{" "}
                  <Link href="/authentification/resend-verification" className="text-white hover:underline">
                    Renvoyer l'email
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
