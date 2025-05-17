"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Define types
interface Order {
  id: number
  status: string
  price: number
  createdAt: string
  game: {
    id: number
    name: string
    slug: string
  }
  gameTypeId: string
  client: {
    id: number
    email: string
    username: string | null
  }
  booster: {
    id: number
    email: string
    username: string | null
  } | null
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

interface OrdersResponse {
  orders: Order[]
  pagination: PaginationData
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [hasBooster, setHasBooster] = useState(searchParams.get("hasBooster") || "")

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")

  useEffect(() => {
    fetchOrders()
  }, [page, limit, status, hasBooster])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      let url = `/api/admin/orders?page=${page}&limit=${limit}`
      if (status) url += `&status=${encodeURIComponent(status)}`
      if (hasBooster) url += `&hasBooster=${encodeURIComponent(hasBooster)}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data: OrdersResponse = await response.json()
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const updateSearchParams = (params: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }
    })

    router.push(`/admin/orders?${newParams.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateSearchParams({ status: value, page: 1 })
  }

  const handleHasBoosterChange = (value: string) => {
    setHasBooster(value)
    updateSearchParams({ hasBooster: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage all boosting orders on your platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A list of all orders in your platform including their status and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hasBooster} onValueChange={handleHasBoosterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Booster assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="true">Has Booster</SelectItem>
                <SelectItem value="false">No Booster</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">Loading orders...</div>
          ) : error ? (
            <div className="flex justify-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Booster</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.game.name}</TableCell>
                        <TableCell>{order.gameTypeId}</TableCell>
                        <TableCell>{order.client.username || order.client.email}</TableCell>
                        <TableCell>{order.booster ? order.booster.username || order.booster.email : "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>${order.price.toFixed(2)}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/orders/${order.id}/edit`}>Edit Order</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {orders.length} of {pagination.total} orders
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={pagination.page <= 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
