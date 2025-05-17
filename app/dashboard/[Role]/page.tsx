"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import Admin from "@/components/elements/Home/Admin"
import Booster from "@/components/elements/Home/Booster"
import Client from "@/components/elements/Home/Client"
import DashboardNotificationWrapper from "@/components/elements/notification/dashboard-notification-wrapper"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage({ params }: { params: { Role: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Unified storage handler
  const handleStorageChange = () => {
    const team = localStorage.getItem("activeTeam") || ""
    setUser(team)
  }

  useEffect(() => {
    handleStorageChange()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("localStorageChange", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorageChange", handleStorageChange)
    }
  }, [])

  // Check if the user's role matches the current page
  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.role

      // If the user's role doesn't match the current page, redirect them
      if (userRole && userRole !== params.Role) {
        router.push(`/dashboard/${userRole}`)
      }

      setLoading(false)
    } else if (status === "unauthenticated") {
      router.push("/authentification")
    }
  }, [status, session, params.Role, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardNotificationWrapper />

      <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
        <CardHeader className="border-b border-[#2A2F3F] bg-[#1A1E2C]">
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {params.Role === "CLIENT" && <Client />}
          {params.Role === "BOOSTER" && <Booster />}
          {params.Role === "ADMIN" && <Admin />}
        </CardContent>
      </Card>
    </div>
  )
}
