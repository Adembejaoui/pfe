"use client"

import type React from "react"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SpecialButton from "../ui/SpecialButton"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"

// Zod validation schema
const signUpSchema = z
  .object({
    username: z.string().min(3, "Full Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(signUpSchema),
  })

  const router = useRouter()
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      // Create the user using the existing API
      const response = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          role: "CLIENT",
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success("Compte créé avec succès! Veuillez vérifier votre email pour activer votre compte.", {
          duration: 6000,
        })
        setIsRegistered(true)
        setRegisteredEmail(data.email)
        reset() // Clear the form
      } else {
        toast.error(responseData.message || "Une erreur s'est produite. Veuillez réessayer.")
        console.error("Erreur d'inscription:", responseData)
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.")
    }
  }

  if (isRegistered) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="bg-black/95 text-white/85">
          <CardHeader>
            <CardTitle className="text-2xl">Email de vérification envoyé</CardTitle>
            <CardDescription className="text-white/70">
              Veuillez vérifier votre boîte de réception pour activer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-white/90">
                Nous avons envoyé un email de vérification à <strong>{registeredEmail}</strong>. Veuillez vérifier votre
                boîte de réception et cliquer sur le lien de vérification pour activer votre compte.
              </p>
              <p className="text-sm text-white/70">
                Si vous ne voyez pas l'email, veuillez vérifier votre dossier spam.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/authentification" className="w-full">
              <SpecialButton text="Aller à la page de connexion" type="button" className="w-full" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-black/95 text-white/85">
        <CardHeader>
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription className="text-white/70">
            Entrez vos informations ci-dessous pour créer votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Nom complet</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  {...register("username")}
                  className="bg-black/50 border-white/20 text-white"
                />
                {errors.username && <p className="text-red-500">{errors.username.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  {...register("email")}
                  className="bg-black/50 border-white/20 text-white"
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-black/50 border-white/20 text-white"
                />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="bg-black/50 border-white/20 text-white"
                />
                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              <SpecialButton
                text={isSubmitting ? "Création du compte..." : "S'inscrire"}
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
