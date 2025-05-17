"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type Order, orderColumns } from "./orders-columns"
import { DataTable } from "./data-table"
import { useSession } from "next-auth/react"
import { formatRank } from "@/lib/format-utils" // Import the formatRank utility

interface OrdersTableProps {
  role: string
  status: string[]
  showClaimButton: boolean
  enableRowClick?: boolean 
}

interface PlayerAttributes {
  server?: string
  options?: {
    ghostDuo?: boolean
    priority?: boolean
    voiceDuo?: boolean
    vipBooster?: boolean
    streamGames?: boolean
  }
  playerData?: {
    lp?: number
    tier?: string
    wins?: number
    losses?: number
    server?: string
    tagLine?: string
    division?: string
    username?: string
    soloQueue?: {
      lp?: number
      tier?: string
      division?: string
    }
  }
  currentRank?: {
    lp?: number
    tier?: string
    division?: string
  }
  desiredRank?: {
    tier?: string
    division?: string
  }
  wins?: number
  placements?: number
}

export function OrdersTable({ role, status, showClaimButton,enableRowClick=true }: OrdersTableProps) {
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build the query parameters
        const params = new URLSearchParams()

        // Add status filter
        if (status && status.length > 0) {
          status.forEach((s) => params.append("status", s))
        }

        // Add role filter
        params.append("role", role)
        const url = `/api/orders?${params.toString()}`
        console.log("Fetching orders from:", url)

        // Fetch orders from API
        const response = await fetch(url)

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error")
          throw new Error(`Failed to fetch orders: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (!Array.isArray(data.data)) {
          throw new Error("Received invalid data format from server")
        }

        // Transform the data to match the Order type
        const transformedOrders: Order[] = data.data.map((order: any) => {
          // Parse attributes if it's a string
          let attributes: PlayerAttributes = {}

          try {
            attributes = typeof order.attributes === "string" ? JSON.parse(order.attributes) : order.attributes || {}
            console.log(`Parsed attributes for order ${order.id}:`, JSON.stringify(attributes, null, 2))
          } catch (e) {
            console.error(`Error parsing attributes for order ${order.id}:`, e)
            attributes = {}
          }

          // Extract current rank information
          const currentRank = attributes.currentRank || {}

          // Extract desired rank information
          const desiredRank = attributes.desiredRank || {}

          // Format the ranks using the utility function
          const currentLevelFormatted = formatRank(currentRank)
          const desiredLevelFormatted = formatRank(desiredRank)

          console.log(`Order ${order.id} ranks:`, {
            currentRank,
            desiredRank,
            currentFormatted: currentLevelFormatted,
            desiredFormatted: desiredLevelFormatted,
          })

          // Extract player data
          const playerData = attributes.playerData || {}
          const username = playerData.username || "Unknown"
          const wins = playerData.wins || 0
          const losses = playerData.losses || 0
          const tagLine = playerData.tagLine || ""

          // Extract options
          const options = attributes.options || {}
          const ghostDuo = options.ghostDuo || false
          const priority = options.priority || false
          const voiceDuo = options.voiceDuo || false
          const vipBooster = options.vipBooster || false
          const streamGames = options.streamGames || false

          // Get wins or placements count from attributes
          const winsCount = attributes.wins || 0
          const placementsCount = attributes.placements || 0

          return {
            id: order.id?.toString() || "",
            game: order.game?.name || "League of Legends",
            service: order.gameTypeId || "Rank Boost",
            currentLevel: currentLevelFormatted || "Unknown",
            desiredLevel: desiredLevelFormatted || "Unknown",
            price: order.price || 0,
            status: order.status || "PENDING",
            createdAt: order.createdAt || new Date().toISOString(),
            clientId: order.clientId?.toString() || "",
            boosterId: order.boosterId?.toString() || null,
            clientName: order.client?.username || order.client?.email || "Unknown Client",
            boosterName: order.booster?.username || order.booster?.email || null,
            currentTier: currentRank.tier || "",
            currentDivision: currentRank.division || "",
            currentLP: currentRank.lp || 0,
            desiredTier: desiredRank.tier || "",
            desiredDivision: desiredRank.division || "",
            server: attributes.server || playerData.server || "Unknown",
            username,
            tagLine,
            wins: winsCount,
            placements: placementsCount,
            options: {
              ghostDuo,
              priority,
              voiceDuo,
              vipBooster,
              streamGames,
            },
            // Store the raw attributes for debugging
            rawAttributes: attributes,
          }
        })

        console.log("Transformed orders:", transformedOrders)
        setOrders(transformedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [role, status])

  const handleViewDetails = (order: Order) => {
    if (order.status === "IN_PROGRESS") {
      router.push(`/dashboard/${session?.user?.role}/orders/active/${order.id}`)
    } else if (role === "booster" && order.status === "PENDING") {
      router.push(`/dashboard/${session?.user?.role}/orders/available/${order.id}`)
    } else {
      router.push(`/dashboard/${session?.user?.role}/orders/active/${order.id}`)
    }
  }

  const handleClaimOrder = async (order: Order) => {
    try {
      console.log("Claiming order:", order.id)

      // Call API to claim the order
      const response = await fetch(`/api/user/orders/${order.id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`Failed to claim order: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Refresh the orders list
      router.refresh()

      // Navigate to the order details page after claiming
      router.push(`/dashboard/${session?.user?.role}/orders/active/${order.id}`)
    } catch (error) {
      console.error("Error claiming order:", error)
      alert(error instanceof Error ? error.message : "Failed to claim order")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={orderColumns(handleClaimOrder, handleViewDetails, showClaimButton, role as any)}
      data={orders}
      searchKey="id"
      searchPlaceholder="Search orders..."
      onRowClick={handleViewDetails}
      isClickable={enableRowClick}
    />
  )
}
