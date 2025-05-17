"use client"

import type { LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects = [], // Ensure projects always has a default empty array
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-gray-400">Legends Boost</SidebarGroupLabel>
      <SidebarMenu>
        {projects.length > 0 ? (
          projects.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                className="hover:bg-[#232838] focus:bg-[#232838] data-[active=true]:bg-[#232838] data-[active=true]:text-purple-400"
              >
                <a href={item.url} className="flex items-center gap-2">
                  <item.icon className="size-4 text-gray-400" />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="opacity-50">
              No Projects Available
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
