"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, LogIn, LogOut, Settings, Shield, AlertTriangle, RefreshCw } from "lucide-react"

interface ActivityLogItem {
  id: string
  type: "login" | "logout" | "settings_change" | "security_alert" | "password_change"
  description: string
  ipAddress: string
  location: string
  device: string
  timestamp: string
}

export default function ActivityLog() {
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState<ActivityLogItem[]>([
    {
      id: "act-1",
      type: "login",
      description: "Connexion réussie",
      ipAddress: "192.168.1.1",
      location: "Paris, France",
      device: "Chrome sur Windows",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
      id: "act-2",
      type: "settings_change",
      description: "Modification des paramètres du profil",
      ipAddress: "192.168.1.1",
      location: "Paris, France",
      device: "Chrome sur Windows",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "act-3",
      type: "password_change",
      description: "Mot de passe modifié",
      ipAddress: "192.168.1.1",
      location: "Paris, France",
      device: "Chrome sur Windows",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: "act-4",
      type: "security_alert",
      description: "Tentative de connexion suspecte bloquée",
      ipAddress: "83.45.123.45",
      location: "Moscou, Russie",
      device: "Inconnu",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    {
      id: "act-5",
      type: "logout",
      description: "Déconnexion",
      ipAddress: "192.168.1.1",
      location: "Paris, France",
      device: "Chrome sur Windows",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    },
  ])

  const getActivityIcon = (type: ActivityLogItem["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4 text-green-500" />
      case "logout":
        return <LogOut className="h-4 w-4 text-blue-500" />
      case "settings_change":
        return <Settings className="h-4 w-4 text-indigo-500" />
      case "security_alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "password_change":
        return <Shield className="h-4 w-4 text-amber-500" />
      default:
        return <LogIn className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const refreshActivityLog = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Journal d'activité mis à jour!")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Voici les activités récentes de votre compte.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshActivityLog}
          disabled={isLoading}
          className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Actualiser</span>
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-gray-800 mr-3">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{activity.description}</p>
                  <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span>{activity.device}</span>
                  <span>{activity.ipAddress}</span>
                  <span>{activity.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-800">
            Voir plus d'activités
          </Button>
        </div>
      )}
    </div>
  )
}
