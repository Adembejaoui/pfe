"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

export default function SessionRefreshProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const lastRoleRef = useRef<string | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Store the current role to compare later
    if (session?.user?.role) {
      lastRoleRef.current = session.user.role
    }

    // Function to refresh the session data from the server
    const refreshSession = async () => {
      try {
        // Skip if no session
        if (!session || !session.user) return

        const response = await fetch("/api/auth/session/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            // Only update if the role has changed AND is different from what we already have
            if (session?.user?.role !== data.user.role && lastRoleRef.current !== data.user.role) {
              console.log(`Role changed from ${session?.user?.role} to ${data.user.role}`)
              lastRoleRef.current = data.user.role
              await update({ role: data.user.role })

              // Trigger a custom event to notify other components about the role change
              window.dispatchEvent(
                new CustomEvent("userRoleChanged", {
                  detail: { newRole: data.user.role },
                }),
              )
            }
          }
        }
      } catch (error) {
        console.error("Failed to refresh session:", error)
      }
    }

    // Only try to refresh if we have a session and clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    if (session) {
      // Initial check
      refreshSession()

      // Set up a timeout to check again after 30 seconds
      refreshTimeoutRef.current = setTimeout(() => {
        refreshSession()
      }, 30000) // Check every 30 seconds instead of continuously
    }

    return () => {
      // Clean up timeout on unmount
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [session, update])

  return <>{children}</>
}
