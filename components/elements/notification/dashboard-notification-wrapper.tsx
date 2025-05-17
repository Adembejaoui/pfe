"use client"

import { useState, useEffect } from "react"
import BoosterRequestNotification from "@/components/elements/notification/booster-request-notification"

export default function DashboardNotificationWrapper() {
  const [mounted, setMounted] = useState(false)

  // This ensures we only render the notification component on the client side
  // to avoid hydration errors with localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <BoosterRequestNotification />
}
