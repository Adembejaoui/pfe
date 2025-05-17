"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Loader2, User, Shield, AlertTriangle, Bell, LinkIcon, Trash2, Activity } from "lucide-react"
import ProfileForm from "@/components/settings/profile-form"
import SecurityForm from "@/components/settings/security-form"
import NotificationSettings from "@/components/settings/notification-settings"
import ConnectedAccounts from "@/components/settings/connected-accounts"
import DangerZone from "@/components/settings/danger-zone"
import ActivityLog from "@/components/settings/activity-log"
import EmailVerificationBanner from "@/components/settings/email-verification-banner"

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const params = useParams()
  const role = params.Role as string
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null)
  const [isCheckingVerification, setIsCheckingVerification] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/authentification")
    }
  }, [status])

  // Check email verification status
  useEffect(() => {
    const checkVerification = async () => {
      if (session?.user?.email) {
        try {
          setIsCheckingVerification(true)
          const response = await fetch("/api/user/check-verification")
          const data = await response.json()
          setIsEmailVerified(data.emailVerified)
        } catch (error) {
          console.error("Error checking verification status:", error)
        } finally {
          setIsCheckingVerification(false)
        }
      }
    }

    if (session?.user) {
      checkVerification()
    }
  }, [session])

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch("/api/user/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Email de vérification envoyé avec succès!")
      } else {
        toast.error(data.message || "Une erreur est survenue. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.")
    }
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto" />
          <p className="mt-4 text-gray-400">Chargement de vos paramètres...</p>
        </div>
      </div>
    )
  }

  // Check if user has the correct role
  const userRole = session?.user?.role
  if (userRole && userRole !== role.toUpperCase()) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center bg-gray-950 p-4">
        <Card className="w-full max-w-md bg-black/80 border border-red-900/50 shadow-xl text-white">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-red-500">Accès Refusé</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Vous n'avez pas les permissions nécessaires pour accéder à ces paramètres.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Votre rôle actuel ({userRole}) ne vous permet pas d'accéder aux paramètres de {role}.
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Paramètres du Compte</h1>
            <p className="text-gray-400">Gérez vos informations personnelles et vos préférences</p>
          </div>

          {/* Email Verification Banner */}
          {isEmailVerified === false && !isCheckingVerification && (
            <EmailVerificationBanner
              email={session?.user?.email || ""}
              onResendClick={handleResendVerification}
              className="mb-6"
            />
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {session?.user?.email ? session.user.email[0].toUpperCase() : "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">
                        {session?.user?.email || "utilisateur@exemple.com"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{userRole || "CLIENT"}</p>
                    </div>
                  </div>
                  <Separator className="bg-gray-800" />
                  <nav className="p-2">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === "profile"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profil
                      </Button>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === "security"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("security")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Sécurité
                      </Button>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === "notifications"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("notifications")}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === "connections"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("connections")}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Comptes liés
                      </Button>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === "activity"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("activity")}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Activité
                      </Button>
                      <Separator className="my-2 bg-gray-800" />
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === "danger"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("danger")}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Zone de danger
                      </Button>
                    </div>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  {activeTab === "profile" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Informations Personnelles</h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Mettez à jour vos informations personnelles et vos préférences de compte
                      </p>
                      <ProfileForm user={session?.user} />
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Paramètres de Sécurité</h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Gérez votre mot de passe et les paramètres de sécurité de votre compte
                      </p>
                      <SecurityForm />
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Préférences de Notification</h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Contrôlez quand et comment vous souhaitez être notifié
                      </p>
                      <NotificationSettings />
                    </div>
                  )}

                  {activeTab === "connections" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Comptes Connectés</h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Gérez les services et applications connectés à votre compte
                      </p>
                      <ConnectedAccounts />
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Journal d'Activité</h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Consultez l'historique des activités récentes sur votre compte
                      </p>
                      <ActivityLog />
                    </div>
                  )}

                  {activeTab === "danger" && (
                    <div>
                      <h2 className="text-xl font-semibold text-red-500 mb-4">Zone de Danger</h2>
                      <p className="text-gray-400 text-sm mb-6">Actions irréversibles qui affectent votre compte</p>
                      <DangerZone />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
