"use client"

import { BadgeCheck, Bell, ChevronsUpDown, LogOut, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { signOut } from "next-auth/react"
import { useParams } from "next/navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role: string // Ensure role exists and is valid
  }
}) {
  const { isMobile } = useSidebar()

  const params = useParams()
  const roleU = params?.Role as string

  // Ensure role is always defined to avoid navigation errors
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : ""
  const navItems = [
    // Show "Upgrade to Booster" only if the user is not already a Booster
    ...(userRole == "Client"
      ? [
          {
            label: "Upgrade to Booster",
            icon: <Sparkles className="mr-2 h-4 w-4 text-purple-400" />,
            action: () => (window.location.href = "/booster"),
          },
        ]
      : []),
    {
      label: "Account",
      icon: <BadgeCheck className="mr-2 h-4 w-4 text-blue-400" />,
      action: () => (window.location.href = `/dashboard/${userRole}/profile`),
    },
    {
      label: "News",
      icon: <Bell className="mr-2 h-4 w-4 text-yellow-400" />,
      action: () => (window.location.href = "/notifications"),
    },
    {
      label: "Log out",
      icon: <LogOut className="mr-2 h-4 w-4 text-red-400" />,
      action: () =>
        signOut({
          redirect: true,
          callbackUrl: `${window.location.origin}/authentification`,
        }),
    },
  ]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#232838] hover:bg-[#232838] focus:bg-[#232838]"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-[#2A2F3F]">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-gray-400">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#1A1E2C] border-[#2A2F3F]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg border border-[#2A2F3F]">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-gray-400">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2A2F3F]" />
            <DropdownMenuGroup>
              {navItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={item.action}
                  className="hover:bg-[#232838] focus:bg-[#232838] cursor-pointer"
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
