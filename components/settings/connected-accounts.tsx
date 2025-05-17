"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface ConnectedAccount {
  id: string
  provider: string
  name: string
  email: string
  avatar: string
  connected: boolean
  lastUsed?: string
}

export default function ConnectedAccounts() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: "google",
      provider: "Google",
      name: "Non connecté",
      email: "",
      avatar: "/placeholder.svg?height=40&width=40",
      connected: false,
    },
    {
      id: "discord",
      provider: "Discord",
      name: "Non connecté",
      email: "",
      avatar: "/placeholder.svg?height=40&width=40",
      connected: false,
    },
  ])

  const toggleConnection = (id: string) => {
    setIsLoading(id)

    // Simulate API call
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((account) => {
          if (account.id === id) {
            if (account.connected) {
              toast.success(`Compte ${account.provider} déconnecté avec succès!`)
              return {
                ...account,
                connected: false,
                name: "Non connecté",
                email: "",
                lastUsed: undefined,
              }
            } else {
              toast.success(`Compte ${account.provider} connecté avec succès!`)
              return {
                ...account,
                connected: true,
                name: `Utilisateur ${account.provider}`,
                email: `user@${account.id.toLowerCase()}.com`,
                lastUsed: new Date().toISOString(),
              }
            }
          }
          return account
        }),
      )
      setIsLoading(null)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Connectez vos comptes pour vous connecter facilement et importer vos données.
      </p>

      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-800"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                <img src={account.avatar || "/placeholder.svg"} alt={account.provider} className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{account.provider}</h4>
                <p className="text-xs text-gray-400">{account.connected ? account.email : "Non connecté"}</p>
                {account.lastUsed && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dernière utilisation: {new Date(account.lastUsed).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => toggleConnection(account.id)}
              variant={account.connected ? "destructive" : "outline"}
              size="sm"
              disabled={isLoading === account.id}
              className={
                account.connected
                  ? "bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-900/50"
                  : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              }
            >
              {isLoading === account.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {account.connected ? "Déconnecter" : "Connecter"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
