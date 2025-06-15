"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, Clock, DollarSign, TrendingUp, Calendar, MessageSquare, Award } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BoosterProfile {
  id: number
  username: string | null
  email: string
  createdAt: string
  bio?: string
  skills?: string
  experience?: string
  metrics: {
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    inProgressOrders: number
    completionRate: number
    averageRating: number
    totalRatings: number
    totalEarnings: number
    averageCompletionTime: number
    averageResponseTime: number
    monthlyTrend: number
    lastActiveDate: string | null
    isActive: boolean
    streakDays: number
    bestMonth: string
    worstMonth: string
  }
  performanceHistory: Array<{
    month: string
    orders: number
    completed: number
    earnings: number
    rating: number
    completionTime: number
  }>
  gamePerformance: Array<{
    gameId: number
    gameName: string
    orders: number
    completionRate: number
    averageRating: number
    earnings: number
  }>
  recentOrders: Array<{
    id: number
    gameId: number
    gameName: string
    gameTypeId: string
    status: string
    price: number
    createdAt: string
    completedAt: string | null
    rating: number | null
    clientUsername: string | null
    clientEmail: string
  }>
  reviews: Array<{
    id: number
    rating: number
    comment: string | null
    createdAt: string
    orderId: number
    gameName: string
    clientUsername: string | null
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function BoosterProfilePage() {
  const params = useParams()
  const router = useRouter()
  const boosterId = params.id as string

  const [booster, setBooster] = useState<BoosterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoosterProfile()
  }, [boosterId])

  const fetchBoosterProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/boosters/${boosterId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch booster profile")
      }

      const data = await response.json()
      setBooster(data)
    } catch (err) {
      console.error("Error fetching booster profile:", err)
      setError("Failed to load booster profile")
      toast.error("Failed to load booster profile")
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceBadge = (completionRate: number) => {
    if (completionRate >= 95) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (completionRate >= 85) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (completionRate >= 70) return { label: "Average", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Poor", color: "bg-red-100 text-red-800" }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Loading booster profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booster) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Error</h1>
            <p className="text-muted-foreground">{error || "Booster not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  const performanceBadge = getPerformanceBadge(booster.metrics.completionRate)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booster Profile</h1>
          <p className="text-muted-foreground">Detailed analytics and performance metrics</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`/avatars/${booster.id}.png`} />
                <AvatarFallback className="text-lg">
                  {(booster.username || booster.email).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{booster.username || booster.email.split("@")[0]}</h2>
                  <Badge className={performanceBadge.color}>{performanceBadge.label}</Badge>
                  {booster.metrics.isActive && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{booster.email}</p>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(booster.createdAt).toLocaleDateString()}
                </p>
                {booster.metrics.lastActiveDate && (
                  <p className="text-sm text-muted-foreground">
                    Last active: {new Date(booster.metrics.lastActiveDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">{booster.metrics.streakDays} day streak</span>
              </div>
              <Button>Send Message</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booster.metrics.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{booster.metrics.completedOrders} completed</span>
              <span className="mx-1">•</span>
              <span className="text-red-600">{booster.metrics.cancelledOrders} cancelled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booster.metrics.completionRate.toFixed(1)}%</div>
            <Progress value={booster.metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booster.metrics.averageRating.toFixed(1)}/5</div>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(booster.metrics.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2">({booster.metrics.totalRatings} reviews)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${booster.metrics.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${(booster.metrics.totalEarnings / Math.max(booster.metrics.completedOrders, 1)).toFixed(2)} per
              order
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Monthly performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={booster.performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#8884d8" name="Completed Orders" />
                    <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#82ca9d" name="Average Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
                <CardDescription>Monthly earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={booster.performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Earnings"]} />
                    <Bar dataKey="earnings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{booster.metrics.averageCompletionTime.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">Time to complete orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{booster.metrics.averageResponseTime.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">Time to accept orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{booster.metrics.bestMonth}</div>
                <p className="text-xs text-muted-foreground">Highest performance</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Performance</CardTitle>
              <CardDescription>Performance breakdown by game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Avg. Rating</TableHead>
                      <TableHead>Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booster.gamePerformance.map((game) => (
                      <TableRow key={game.gameId}>
                        <TableCell className="font-medium">{game.gameName}</TableCell>
                        <TableCell>{game.orders}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{game.completionRate.toFixed(1)}%</span>
                            <Progress value={game.completionRate} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            {game.averageRating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>${game.earnings.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders handled by this booster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booster.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.gameName}</TableCell>
                        <TableCell>{order.clientUsername || order.clientEmail}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>${order.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {order.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              {order.rating}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>Feedback from clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booster.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.rating}/5</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.clientUsername || "Anonymous"} • {review.gameName}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
