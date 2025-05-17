"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSettings, setEmailSettings] = useState({
    productUpdates: true,
    securityAlerts: true,
    marketing: false,
  })

  const [pushSettings, setPushSettings] = useState({
    messages: true,
    accountActivity: true,
    productUpdates: false,
  })

  const handleEmailToggle = (key: keyof typeof emailSettings) => {
    setEmailSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePushToggle = (key: keyof typeof pushSettings) => {
    setPushSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const saveSettings = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Préférences de notification mises à jour avec succès!")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Notifications par email</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">Mises à jour du produit</p>
              <p className="text-xs text-gray-400">
                Recevez des emails sur les nouvelles fonctionnalités et améliorations.
              </p>
            </div>
            <Switch
              checked={emailSettings.productUpdates}
              onCheckedChange={() => handleEmailToggle("productUpdates")}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">Alertes de sécurité</p>
              <p className="text-xs text-gray-400">
                Recevez des emails sur les activités de sécurité importantes liées à votre compte.
              </p>
            </div>
            <Switch
              checked={emailSettings.securityAlerts}
              onCheckedChange={() => handleEmailToggle("securityAlerts")}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">Marketing</p>
              <p className="text-xs text-gray-400">
                Recevez des emails sur les promotions, offres spéciales et enquêtes.
              </p>
            </div>
            <Switch
              checked={emailSettings.marketing}
              onCheckedChange={() => handleEmailToggle("marketing")}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Notifications push</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">Messages</p>
              <p className="text-xs text-gray-400">
                Recevez des notifications push lorsque quelqu'un vous envoie un message.
              </p>
            </div>
            <Switch
              checked={pushSettings.messages}
              onCheckedChange={() => handlePushToggle("messages")}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">Activité du compte</p>
              <p className="text-xs text-gray-400">
                Recevez des notifications push pour les activités importantes du compte.
              </p>
            </div>
            <Switch
              checked={pushSettings.accountActivity}
              onCheckedChange={() => handlePushToggle("accountActivity")}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">Mises à jour du produit</p>
              <p className="text-xs text-gray-400">Recevez des notifications push sur les nouvelles fonctionnalités.</p>
            </div>
            <Switch
              checked={pushSettings.productUpdates}
              onCheckedChange={() => handlePushToggle("productUpdates")}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={saveSettings} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  )
}
