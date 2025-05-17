"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Shield, Smartphone } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Veuillez entrer votre mot de passe actuel.",
    }),
    newPassword: z.string().min(8, {
      message: "Le mot de passe doit comporter au moins 8 caractères.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Le mot de passe doit comporter au moins 8 caractères.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionAlerts, setSessionAlerts] = useState(true)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: PasswordFormValues) {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      toast.success("Mot de passe mis à jour avec succès!")
      form.reset()
      setIsLoading(false)
    }, 1000)
  }

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked)
    if (checked) {
      toast.info("Configuration de l'authentification à deux facteurs requise", {
        description: "Veuillez configurer l'authentification à deux facteurs pour sécuriser votre compte.",
      })
    } else {
      toast.warning("Authentification à deux facteurs désactivée", {
        description: "Votre compte est maintenant moins sécurisé.",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-white mb-4">Changer le mot de passe</h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Mot de passe actuel</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Au moins 8 caractères avec un mélange de lettres, chiffres et symboles.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </Button>
          </form>
        </Form>
      </div>

      <div className="pt-6 border-t border-gray-800">
        <h4 className="text-sm font-medium text-white mb-4">Authentification à deux facteurs</h4>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-indigo-900/30">
                  <Smartphone className="h-4 w-4 text-indigo-400" />
                </div>
                <CardTitle className="text-base">Authentification à deux facteurs</CardTitle>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <CardDescription className="pt-1.5 text-gray-400">
              Ajoutez une couche de sécurité supplémentaire à votre compte en exigeant plus qu'un mot de passe pour vous
              connecter.
            </CardDescription>
          </CardHeader>
          {twoFactorEnabled && (
            <CardContent>
              <Button variant="outline" size="sm" className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                Configurer l'authentification à deux facteurs
              </Button>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="pt-6 border-t border-gray-800">
        <h4 className="text-sm font-medium text-white mb-4">Alertes de sécurité</h4>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-indigo-900/30">
                  <Shield className="h-4 w-4 text-indigo-400" />
                </div>
                <CardTitle className="text-base">Alertes de nouvelles sessions</CardTitle>
              </div>
              <Switch
                checked={sessionAlerts}
                onCheckedChange={setSessionAlerts}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <CardDescription className="pt-1.5 text-gray-400">
              Recevez une notification par email lorsque quelqu'un se connecte à votre compte depuis un nouvel appareil
              ou une nouvelle localisation.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
