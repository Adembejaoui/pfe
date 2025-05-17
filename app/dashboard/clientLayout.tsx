"use client"

import type React from "react"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { OrderHeader } from "@/components/order/order-header"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to the appropriate dashboard based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      // Check if we're at the /dashboard route without a role parameter
      if (window.location.pathname === "/dashboard") {
        router.push(`/dashboard/${session.user.role}`)
      }
    } else if (status === "unauthenticated") {
      router.push("/authentification")
    }
  }, [status, session, router])

  // Listen for role changes
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      if (event.detail?.newRole && session?.user?.role !== event.detail.newRole) {
        console.log(`Role changed to ${event.detail.newRole}, redirecting...`)
        // Use router.push instead of directly changing location to avoid full page reload
        router.push(`/dashboard/${event.detail.newRole}`)
      }
    }

    window.addEventListener("userRoleChanged", handleRoleChange as EventListener)

    return () => {
      window.removeEventListener("userRoleChanged", handleRoleChange as EventListener)
    }
  }, [session, router])

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full flex-col md:flex-row bg-[#0F1118] text-gray-100">
          {/* Sidebar - hidden on small screens, shown on medium and up */}
          <AppSidebar className="border-r border-[#2A2F3F]" />

          {/* Main Content */}
          <SidebarInset className="flex flex-1 flex-col">
            {/* Header */}
            <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 bg-[#161A26] border-b border-[#2A2F3F] shadow-md">
              {session?.user?.role === "BOOSTER" && (
                <OrderHeader
                  eurPrice={72.94}
                  usdPrice={0.0}
                  rating={4.47}
                  soloStats={1}
                  duoStats={3}
                  maxSoloRank="Master"
                  maxDuoRank="Master"
                />
              )}
            </header>

            {/* Content Area */}
            <div className="flex flex-1 overflow-auto">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
