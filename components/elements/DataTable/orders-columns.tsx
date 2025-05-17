"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreHorizontal, Eye, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type Order = {
  id: string
  game: string
  service: string
  currentLevel: string | number
  desiredLevel: string | number
  price: number
  status: string
  createdAt: string
  clientId?: string
  boosterId?: string | null
  clientName?: string
  boosterName?: string | null
  currentTier?: string
  currentDivision?: string
  currentLP?: number
  desiredTier?: string
  desiredDivision?: string
  server?: string
  username?: string
  tagLine?: string
  user?: {
    username: string
  }
  wins?: number
  placements?: number
  options?: {
    ghostDuo?: boolean
    priority?: boolean
    voiceDuo?: boolean
    vipBooster?: boolean
    streamGames?: boolean
  }
  rawAttributes?: any // For debugging
}

export const orderColumns = (
  onClaim: (order: Order) => void,
  onViewDetails: (order: Order) => void,
  showClaimButton = false,
  role?: "admin" | "booster" | "client",
): ColumnDef<Order>[] => {
  const columns: ColumnDef<Order>[] = [
    {
      header: "ID",
      accessorKey: "id",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div
            className="font-medium text-primary hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(order)
            }}
          >
            #{order.id}
          </div>
        )
      },
    },
    {
      header: "Game",
      accessorKey: "game",
      cell: ({ row }) => <div>{row.original.game || "League of Legends"}</div>,
    },
    {
      header: "Service",
      accessorKey: "service",
      cell: ({ row }) => <div>{row.original.service}</div>,
    },
  ]

  // Add rank information if available
  if (role === "booster") {
    columns.push({
      header: "Rank Progress",
      accessorKey: "currentLevel",
      cell: ({ row }) => {
        const order = row.original

        const currentLevel = order.currentLevel || "Unknown"
        const desiredLevel = order.desiredLevel || "Unknown"
        const service = order.service || ""

        // Get wins or placements from the order data
        const winsCount = order.wins || (order.rawAttributes?.wins as number) || 0
        const placementsCount = order.placements || (order.rawAttributes?.placements as number) || 0

        let displayText = ""

        if (service === "rank-boost") {
          displayText = `${currentLevel} → ${desiredLevel}`
        } else if (service === "win-boost") {
          displayText = `${currentLevel} → ${winsCount} wins`
        } else if (service === "placement-boost") {
          displayText = `${currentLevel} → ${placementsCount} placements`
        } else {
          displayText = `${currentLevel} → ?`
        }

        return <div className="text-sm">{displayText}</div>
      },
    })
  } else {
    columns.push({
      header: "From → To",
      accessorKey: "currentLevel",
      cell: ({ row }) => {
        const order = row.original

        const currentLevel = order.currentLevel || "Unknown"
        const desiredLevel = order.desiredLevel || "Unknown"
        const service = order.service || ""

        // Get wins or placements from the order data
        const winsCount = order.wins || (order.rawAttributes?.wins as number) || 0
        const placementsCount = order.placements || (order.rawAttributes?.placements as number) || 0

        let displayText = ""

        if (service === "rank-boost") {
          displayText = `${currentLevel} → ${desiredLevel}`
        } else if (service === "win-boost") {
          displayText = `${currentLevel} → ${winsCount} wins`
        } else if (service === "placement-boost") {
          displayText = `${currentLevel} → ${placementsCount} placements`
        } else {
          displayText = `${currentLevel} → ?`
        }

        return <div>{displayText}</div>
      },
    })
  }

  columns.push({
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => {
      const price = Number.parseFloat(row.getValue("price") as string) || 0
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price)
    },
  })

  columns.push({
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const colorMap: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      }
      return <Badge className={colorMap[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
    },
  })

  columns.push({
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = row.getValue("createdAt")
      if (!date) return "N/A"
      try {
        return format(new Date(date as string), "PPp")
      } catch (error) {
        console.error("Date formatting error:", error)
        return String(date)
      }
    },
  })

  if (role === "admin") {
    columns.push({
      header: "Client",
      accessorKey: "clientName",
      cell: ({ row }) => {
        const clientName = row.original.clientName || row.original.user?.username
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[150px] truncate" title={clientName || "Unknown"}>
                  {clientName || "Unknown"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{clientName || "Unknown"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    })
  }

  if (role === "admin") {
    columns.push({
      header: "Booster",
      accessorKey: "boosterName",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[150px] truncate" title={row.original.boosterName || "Unassigned"}>
                  {row.original.boosterName || "Unassigned"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.original.boosterName || "Unassigned"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    })
  }

  columns.push({
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(order)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {showClaimButton && order.status === "PENDING" && !order.boosterId && (
                <DropdownMenuItem onClick={() => onClaim(order)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Claim
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  })

  return columns
}
