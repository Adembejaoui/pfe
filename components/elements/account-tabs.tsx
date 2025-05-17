"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SpecialButton from "@/components/ui/SpecialButton"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface Props {
  type: "account" | "security"
}

interface User {
  username: string
  email: string
  password?: string // for handling password update in security settings
}

export default function SettingsForm({ type }: Props) {
  const { data: session, update } = useSession()
  const [user, setUser] = useState<User>({ username: "", email: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user && type === "account") {
      setUser({
        username: session.user.username || "",
        email: session.user.email || "",
      })
    }
  }, [session, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (type === "account") {
      try {
        const updatedUserData = {
          username: user.username,
          email: user.email,
        }

        // Send the request to update account info
        const res = await fetch("/api/user/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUserData),
        })

        const data = await res.json()

        if (res.ok) {
          toast.success("Information updated!")

          // Update the session with the new user data
          // This is the key part that updates the session immediately
          await update({
            ...session,
            user: {
              ...session?.user,
              username: data.user.username,
              email: data.user.email,
              // Keep other properties like role
              role: session?.user.role,
            },
          })
        } else {
          toast.error(data.message || "Failed to update information")
        }
      } catch (error) {
        toast.error("Something went wrong while updating information.")
        console.error(error)
      }
    } else if (type === "security") {
      const currentPassword = (document.getElementById("current-password") as HTMLInputElement).value
      const newPassword = (document.getElementById("new-password") as HTMLInputElement).value
      const confirmPassword = (document.getElementById("confirm-password") as HTMLInputElement).value

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match.")
        setLoading(false)
        return
      }

      try {
        // Handle password update logic here
        const updatedSecurityData = {
          currentPassword,
          newPassword,
        }

        // Send the request to update password
        const res = await fetch("/api/user/update-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSecurityData),
        })

        const data = await res.json()

        if (res.ok) {
          toast.success("Password updated!")
        } else {
          toast.error(data.message || "Failed to update password")
        }
      } catch (error) {
        toast.error("Something went wrong while updating password.")
        console.error(error)
      }
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "account" ? "Paramètres du compte" : "Paramètres de sécurité"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {type === "account" ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full-name">Nom d'utilisateur</Label>
              <Input
                id="full-name"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
            <CardFooter>
              <SpecialButton
                text={loading ? "Loading..." : "Sauvegarder"}
                type="submit"
                className="w-full"
                disabled={loading}
              />
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <CardFooter>
              <SpecialButton
                text={loading ? "Loading..." : "Sauvegarder"}
                type="submit"
                className="w-full"
                disabled={loading}
              />
            </CardFooter>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

