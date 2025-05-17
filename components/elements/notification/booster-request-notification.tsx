"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type RequestStatus = "APPROVED" | "REJECTED" | null

export default function BoosterRequestNotification() {
  const router = useRouter()
  const { data: session } = useSession()
  const [status, setStatus] = useState<RequestStatus>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        // Skip if no session
        if (!session || !session.user) {
          setLoading(false)
          return
        }

        // Check if we've already shown this notification
        const notificationKey = `booster_notification_shown_${session.user.id}`
        const notificationShown = localStorage.getItem(notificationKey)

        if (notificationShown) {
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/check-notifications")

        if (!response.ok) {
          setLoading(false)
          return
        }

        const data = await response.json()

        // Check if there's a booster status notification
        if (data.boosterStatus === "APPROVED" || data.boosterStatus === "REJECTED") {
          setStatus(data.boosterStatus)
          setVisible(true)

          // Mark the notification as read
          await fetch("/api/auth/mark-notification-read", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: data.boosterStatus === "APPROVED" ? "BOOSTER_APPROVAL" : "BOOSTER_REJECTION",
            }),
          })

          // Store in localStorage to prevent showing again
          localStorage.setItem(notificationKey, "true")
        }
      } catch (error) {
        console.error("Error checking notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      checkNotifications()
    }
  }, [session])

  const handleDismiss = () => {
    setVisible(false)
  }

  const handleAction = () => {
    if (status === "APPROVED") {
      // Navigate to the booster dashboard
      router.push("/dashboard/BOOSTER")
    } else {
      router.push("/dashboard/CLIENT")
    }
    setVisible(false)
  }

  if (loading || !visible || !status) {
    return null
  }

  return (
    <Alert
      className={`mb-6 relative ${
        status === "APPROVED" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 rounded-full p-0 text-muted-foreground hover:bg-background/80"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>

      {status === "APPROVED" ? (
        <>
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="font-medium">Your booster request has been approved!</AlertTitle>
          <AlertDescription className="mt-2">
            Congratulations! You are now a booster. You can now access the booster dashboard and start accepting orders.
          </AlertDescription>
          <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white" onClick={handleAction}>
            Go to Booster Dashboard
          </Button>
        </>
      ) : (
        <>
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-medium">Your booster request has been rejected</AlertTitle>
          <AlertDescription className="mt-2">
            Unfortunately, your request to become a booster has been rejected. You can contact support for more
            information or submit a new request in the future.
          </AlertDescription>
          <Button className="mt-3 bg-red-600 hover:bg-red-700 text-white" onClick={handleAction}>
            Return to Dashboard
          </Button>
        </>
      )}
    </Alert>
  )
}
