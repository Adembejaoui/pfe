"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: number
  email: string
  username: string | null
  role: string
  createdAt: string
  updatedAt: string
  ordersAsClient: Array<{
    id: number
    status: string
    price: number
    createdAt: string
    game: { name: string }
    gameTypeId:string 
  }>
  ordersAsBooster: Array<{
    id: number
    status: string
    price: number
    createdAt: string
    game: { name: string }
    gameTypeId: string 
  }>
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch user details")
      }

      const data = await response.json()
      setUser(data)
    } catch (err) {
      console.error("Error fetching user details:", err)
      setError("Failed to load user details")
      toast.error("Failed to load user details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete user")
      }

      toast.success("User deleted successfully")
      router.push("/admin/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "BOOSTER":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
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

  if (loading) {
    return <div className="flex justify-center py-8">Loading user details...</div>
  }

  if (error) {
    return <div className="flex justify-center py-8 text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="flex justify-center py-8">User not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Detailed information about the user.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p>{user.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                <p>{user.username || "-"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p>{new Date(user.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(user.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="client" className="space-y-4">
        <TabsList>
          <TabsTrigger value="client">Client Orders</TabsTrigger>
          <TabsTrigger value="booster">Booster Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Orders</CardTitle>
              <CardDescription>Orders placed by this user as a client.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.ordersAsClient.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No client orders found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.ordersAsClient.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                              {order.id}
                            </Link>
                          </TableCell>
                          <TableCell>{order.game.name}</TableCell>
                          <TableCell>{order.gameTypeId}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>${order.price.toFixed(2)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="booster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booster Orders</CardTitle>
              <CardDescription>Orders assigned to this user as a booster.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.ordersAsBooster.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No booster orders found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.ordersAsBooster.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                              {order.id}
                            </Link>
                          </TableCell>
                          <TableCell>{order.game.name}</TableCell>
                          <TableCell>{order.gameTypeId}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>${order.price.toFixed(2)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
