"use client"
import { Shield } from "lucide-react"

import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { data: session, status } = useSession()

  // Get role color based on role name
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-600"
      case "BOOSTER":
        return "bg-green-600"
      case "CLIENT":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#232838] hover:bg-[#232838] focus:bg-[#232838]"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Legend Boost</span>
                <span className="truncate text-xs text-gray-400">
                  <Badge className={`${getRoleColor(session?.user.role || "")}`}>{session?.user.role}</Badge>
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
