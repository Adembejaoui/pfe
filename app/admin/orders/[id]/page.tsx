"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
  id: number
  status: string
  price: number
  createdAt: string
  updatedAt: string
  game: {
    id: number
    name: string
    slug: string
    attributes: any // Game attributes
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
  messages: Array<{
    id: number
    content: string
    createdAt: string
    sender: {
      id: number
      email: string
      username: string | null
      role: string
    }
  }>
  review: {
    id: number
    rating: number
    comment: string | null
    createdAt: string
    author: {
      id: number
      email: string
      username: string | null
    }
  } | null
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()
      setOrder(data)
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError("Failed to load order details")
    } finally {
      setLoading(false)
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
    return <div className="flex justify-center py-8">Loading order details...</div>
  }

  if (error) {
    return <div className="flex justify-center py-8 text-red-500">{error}</div>
  }

  if (!order) {
    return <div className="flex justify-center py-8">Order not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/orders/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>Basic information about this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
                  <p>{order.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Game</h3>
                <p>{order.game.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Game Type</h3>
                <p>{order.gameTypeId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                <p>${order.price.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(order.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Client and booster details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Client</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Name: </span>
                    <span>{order.client.username || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Email: </span>
                    <span>{order.client.email}</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" asChild className="mt-1">
                      <Link href={`/admin/users/${order.client.id}`}>View Client Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Booster</h3>
                {order.booster ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Name: </span>
                      <span>{order.booster.username || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Email: </span>
                      <span>{order.booster.email}</span>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" asChild className="mt-1">
                        <Link href={`/admin/users/${order.booster.id}`}>View Booster Profile</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No booster assigned to this order yet.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Attributes</CardTitle>
          <CardDescription>Game-specific details for this order.</CardDescription>
        </CardHeader>
        <CardContent>
          {order.game.attributes ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(order.game.attributes, null, 2)}
            </pre>
          ) : (
            <div className="text-muted-foreground">No attributes for this game.</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communication between client and booster.</CardDescription>
            </CardHeader>
            <CardContent>
              {order.messages.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No messages for this order yet.</div>
              ) : (
                <div className="space-y-4">
                  {order.messages.map((message) => (
                    <div key={message.id} className="flex flex-col p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{message.sender.username || message.sender.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.sender.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
              <CardDescription>Client's feedback on the completed order.</CardDescription>
            </CardHeader>
            <CardContent>
              {order.review ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < order.review!.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-medium">{order.review.rating} out of 5</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Comment</h3>
                    <p className="mt-1">{order.review.comment || "No comment provided."}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Reviewer</h3>
                    <p className="mt-1">{order.review.author.username || order.review.author.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                    <p className="mt-1">{new Date(order.review.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No review for this order yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
