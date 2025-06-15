"use client"

import type * as React from "react"
import { useSession } from "next-auth/react"
import { PieChart, LifeBuoy, Gamepad, Clock, Users, Home} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavSecondary } from "./NavSecondary"
import { TeamSwitcher } from "./team-switcher"
import { Badge } from "@/components/ui/badge"

// Role-based navigation
const roleNavigation = {
  CLIENT: {
    mainNav: [
      { name: "Active Order", url: "/dashboard/Client/orders/active", icon: Clock },
      { name: "Home", url: "/", icon: Home },
      { name: "Upgrade your account", url: "/gameboost", icon: Gamepad},
      
    ],
  },
  BOOSTER: {
    mainNav: [
      { name: "Available Order", url: "/dashboard/Booster/orders/available", icon: Gamepad },
      { name: "Active Order", url: "/dashboard/Booster/orders/active", icon: Clock },
      { name: "Review Order", url: "/dashboard/Booster/orders/review", icon: PieChart },
    ],
  },
  ADMIN: {
    mainNav: [
      { name: "Available Order", url: "/dashboard/Admin/orders/available", icon: Gamepad },
      { name: "Active Order", url: "/dashboard/Admin/orders/active", icon: Clock },
      { name: "Review Order", url: "/dashboard/Admin/orders/review", icon: PieChart },
    ],
  },
}

// Secondary navigation (common to all roles)
const navSecondary = [{ title: "Support", url: "#", icon: LifeBuoy }]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="w-64 bg-[#161A26] border-r border-[#2A2F3F] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="w-64 bg-[#161A26] border-r border-[#2A2F3F] flex items-center justify-center p-4 text-center">
        <div>
          <Badge className="mb-2 bg-red-600">Not Authenticated</Badge>
          <p className="text-sm text-gray-400">You must be logged in to view this page.</p>
        </div>
      </div>
    )
  }

  const userRole = (session.user.role || "Client") as keyof typeof roleNavigation

  // User data
  const user = {
    name: session.user.username || "Guest",
    email: session.user.email || "guest@example.com",
    avatar: "https://xou955y8kd.ufs.sh/f/zvC4KODelhDMocOo5C1QG2gQlCFT3p1uBrVD6nOs0ivq5Ley",
    role: userRole,
  }

  return (
    <Sidebar collapsible="icon" variant="inset" className="bg-[#161A26] border-r border-[#2A2F3F]" {...props}>
      <SidebarHeader className="border-b border-[#2A2F3F] bg-[#1A1E2C]">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* Display projects based on user role */}
        <NavProjects projects={roleNavigation[userRole]?.mainNav || []} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t border-[#2A2F3F] bg-[#1A1E2C]">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
