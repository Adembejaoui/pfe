"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Award,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface BoosterAnalytics {
  id: number
  username: string | null
  email: string
  createdAt: string
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
  }
  recentPerformance: Array<{
    month: string
    orders: number
    earnings: number
    rating: number
  }>
  topGames: Array<{
    gameId: number
    gameName: string
    orders: number
    averageRating: number
  }>
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

interface BoostersResponse {
  boosters: BoosterAnalytics[]
  pagination: PaginationData
  summary: {
    totalBoosters: number
    activeBoosters: number
    averageCompletionRate: number
    averageRating: number
    totalEarnings: number
  }
}

export default function BoosterAnalyticsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [boosters, setBoosters] = useState<BoosterAnalytics[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [summary, setSummary] = useState({
    totalBoosters: 0,
    activeBoosters: 0,
    averageCompletionRate: 0,
    averageRating: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "completionRate")
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")

  useEffect(() => {
    fetchBoosters()
  }, [page, limit, searchTerm, sortBy, filterStatus])

  const fetchBoosters = async () => {
    try {
      setLoading(true)

      let url = `/api/admin/boosters/analytics?page=${page}&limit=${limit}`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`
      if (filterStatus && filterStatus !== "all") url += `&status=${encodeURIComponent(filterStatus)}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch booster analytics")
      }

      const data: BoostersResponse = await response.json()
      setBoosters(data.boosters)
      setPagination(data.pagination)
      setSummary(data.summary)
    } catch (err) {
      console.error("Error fetching booster analytics:", err)
      setError("Failed to load booster analytics")
      toast.error("Failed to load booster analytics")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ page: 1 })
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

    router.push(`/admin/boosters?${newParams.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage })
  }

  const getPerformanceBadge = (completionRate: number) => {
    if (completionRate >= 95) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (completionRate >= 85) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (completionRate >= 70) return { label: "Average", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Poor", color: "bg-red-100 text-red-800" }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booster Analytics</h1>
          <p className="text-muted-foreground">Detailed performance analytics for all boosters on your platform.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boosters</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBoosters}</div>
            <p className="text-xs text-muted-foreground">{summary.activeBoosters} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageCompletionRate.toFixed(1)}%</div>
            <Progress value={summary.averageCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageRating.toFixed(1)}/5</div>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(summary.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid to boosters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalBoosters > 0 ? ((summary.activeBoosters / summary.totalBoosters) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booster Performance</CardTitle>
          <CardDescription>
            Detailed analytics for each booster including performance metrics and trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completionRate">Completion Rate</SelectItem>
                <SelectItem value="averageRating">Average Rating</SelectItem>
                <SelectItem value="totalEarnings">Total Earnings</SelectItem>
                <SelectItem value="totalOrders">Total Orders</SelectItem>
                <SelectItem value="lastActive">Last Active</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boosters</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">Loading booster analytics...</div>
          ) : error ? (
            <div className="flex justify-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {boosters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No boosters found</div>
              ) : (
                boosters.map((booster) => {
                  const performanceBadge = getPerformanceBadge(booster.metrics.completionRate)
                  return (
                    <Card key={booster.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/avatars/${booster.id}.png`} />
                            <AvatarFallback>
                              {(booster.username || booster.email).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                {booster.username || booster.email.split("@")[0]}
                              </h3>
                              <Badge className={performanceBadge.color}>{performanceBadge.label}</Badge>
                              {booster.metrics.isActive && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{booster.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(booster.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/boosters/${booster.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/boosters/${booster.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/boosters/${booster.id}/orders`}>View Orders</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{booster.metrics.totalOrders}</div>
                          <div className="text-xs text-muted-foreground">Total Orders</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-2xl font-bold text-green-600">
                              {booster.metrics.completionRate.toFixed(1)}%
                            </span>
                            {getTrendIcon(booster.metrics.monthlyTrend)}
                          </div>
                          <div className="text-xs text-muted-foreground">Completion Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-2xl font-bold text-yellow-600">
                              {booster.metrics.averageRating.toFixed(1)}
                            </span>
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          </div>
                          <div className="text-xs text-muted-foreground">{booster.metrics.totalRatings} reviews</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            ${booster.metrics.totalEarnings.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Earnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {booster.metrics.averageCompletionTime.toFixed(1)}h
                          </div>
                          <div className="text-xs text-muted-foreground">Avg. Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {booster.metrics.averageResponseTime.toFixed(1)}h
                          </div>
                          <div className="text-xs text-muted-foreground">Avg. Response</div>
                        </div>
                      </div>

                      {booster.topGames.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Top Games</h4>
                          <div className="flex flex-wrap gap-2">
                            {booster.topGames.slice(0, 3).map((game) => (
                              <Badge key={game.gameId} variant="secondary" className="text-xs">
                                {game.gameName} ({game.orders} orders)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {boosters.length} of {pagination.total} boosters
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
        </div>
      )}
    </div>
  )
}
