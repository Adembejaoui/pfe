"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Le nom d'utilisateur doit comporter au moins 2 caractères.",
    })
    .max(30, {
      message: "Le nom d'utilisateur ne doit pas dépasser 30 caractères.",
    }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  bio: z
    .string()
    .max(160, {
      message: "La bio ne doit pas dépasser 160 caractères.",
    })
    .optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string | null
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || user?.name || "",
      email: user?.email || "",
      bio: "",
      phone: "",
      address: "",
    },
  })

  function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      toast.success("Profil mis à jour avec succès!")
      setIsLoading(false)
    }, 1000)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-white mb-4">Photo de profil</h4>
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || ""} />
            <AvatarFallback className="bg-indigo-600 text-lg">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 relative"
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleAvatarChange}
                accept="image/*"
              />
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
            <p className="text-xs text-gray-400 mt-2">JPG, GIF ou PNG. 1MB maximum.</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Votre nom d'utilisateur"
                    {...field}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  C'est votre nom public affiché aux autres utilisateurs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="exemple@email.com"
                    {...field}
                    disabled
                    className="bg-gray-900 border-gray-700 text-gray-400"
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  Votre adresse email ne peut pas être modifiée directement.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Parlez-nous un peu de vous..."
                    className="resize-none bg-gray-900 border-gray-700 text-white"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  Brève description pour votre profil. Maximum 160 caractères.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        

          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </form>
      </Form>
    </div>
  )
}
