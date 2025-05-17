"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, GamepadIcon, ListTodo, DollarSign, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define types for our statistics
interface Stats {
  counts: {
    users: number
    games: number
    gameTypes: number
    orders: number
  }
  revenue: {
    total: number
  }
  usersByRole: Array<{
    role: string
    _count: {
      id: number
    }
  }>
  ordersByStatus: Array<{
    status: string
    _count: {
      id: number
    }
    _sum: {
      price: number
    }
  }>
  recentOrders: Array<any>
  topGames: Array<any>
  topGameTypes: Array<any>
  topBoosters: Array<any>
}

interface RevenueData {
  period: string
  data: Array<{
    period: string
    amount: number
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [revenueError, setRevenueError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/admin/stats")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.details || errorData.error || "Failed to fetch statistics")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error loading statistics"
        setError(errorMessage)
        console.error(err)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    fetchRevenueData("monthly")
  }, [])

  const fetchRevenueData = async (period: string) => {
    try {
      setRevenueLoading(true)
      setRevenueError(null)
      const response = await fetch(`/api/admin/stats/revenue?period=${period}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || "Failed to fetch revenue data")
      }

      const data = await response.json()
      setRevenueData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error loading revenue data"
      setRevenueError(errorMessage)
      console.error(err)
      toast.error(errorMessage)
    } finally {
      setRevenueLoading(false)
    }
  }

  const handlePeriodChange = async (period: string) => {
    fetchRevenueData(period)
  }

  // Prepare data for pie charts
  const userRoleData =
    stats?.usersByRole.map((item) => ({
      name: item.role,
      value: item._count.id,
    })) || []

  const orderStatusData =
    stats?.ordersByStatus.map((item) => ({
      name: item.status,
      value: item._count.id,
    })) || []

  if (loading && error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform statistics and performance.</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}. Please check your database connection and try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform statistics and performance.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading statistics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 animate-pulse bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.counts.users || 0}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <GamepadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 animate-pulse bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.counts.games || 0}</div>
                <p className="text-xs text-muted-foreground">+4 new games this month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 animate-pulse bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.counts.orders || 0}</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 animate-pulse bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">${stats?.revenue.total.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">+10% from last month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4" onValueChange={handlePeriodChange}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Revenue Over Time</h2>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {revenueLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Loading revenue data...</p>
                </div>
              ) : revenueError ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  <p>{revenueError}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {revenueLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Loading revenue data...</p>
                </div>
              ) : revenueError ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  <p>{revenueError}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {revenueLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Loading revenue data...</p>
                </div>
              ) : revenueError ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  <p>{revenueError}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading user data...</p>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center text-red-500">
                <p>{error}</p>
              </div>
            ) : userRoleData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>No user data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Users"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading order data...</p>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center text-red-500">
                <p>{error}</p>
              </div>
            ) : orderStatusData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>No order data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Orders"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders placed on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-muted rounded"></div>
                  ))}
              </div>
            ) : error ? (
              <div className="flex justify-center py-8 text-red-500">{error}</div>
            ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No recent orders found</div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-muted">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.game.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Client: {order.client.username || order.client.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium">${order.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Games</CardTitle>
            <CardDescription>Most popular games by order count</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-10 animate-pulse bg-muted rounded"></div>
                  ))}
              </div>
            ) : error ? (
              <div className="flex justify-center py-8 text-red-500">{error}</div>
            ) : !stats?.topGames || stats.topGames.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No games found</div>
            ) : (
              <div className="space-y-4">
                {stats.topGames.map((game) => (
                  <div key={game.id} className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-muted">
                      <GamepadIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{game.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{game._count.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
