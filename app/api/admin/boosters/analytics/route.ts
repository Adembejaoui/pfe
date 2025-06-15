import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "completionRate"
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Build where clause
    const whereClause: any = {
      role: "BOOSTER",
    }

    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status === "active") {
      whereClause.ordersAsBooster = {
        some: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }
    } else if (status === "inactive") {
      whereClause.NOT = {
        ordersAsBooster: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      }
    }

    // Get total count
    const total = await db.user.count({ where: whereClause })

    // Get boosters with their order data
    const boosters = await db.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        ordersAsBooster: {
          include: {
            game: true,
            review: true,
          },
        },
      },
    })

    // Calculate analytics for each booster
    const boostersWithAnalytics = await Promise.all(
      boosters.map(async (booster) => {
        const orders = booster.ordersAsBooster
        const completedOrders = orders.filter((order) => order.status === "COMPLETED")
        const cancelledOrders = orders.filter((order) => order.status === "CANCELLED")
        const inProgressOrders = orders.filter((order) => order.status === "IN_PROGRESS")

        const completionRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0

        const reviews = orders.map((order) => order.review).filter(Boolean)
        const averageRating =
          reviews.length > 0 ? reviews.reduce((sum, review) => sum + review!.rating, 0) / reviews.length : 0

        const totalEarnings = completedOrders.reduce((sum, order) => sum + order.price * 0.7, 0) // Assuming 70% commission

        // Calculate average completion time
        const completedOrdersWithTime = completedOrders.filter((order) => order.updatedAt)
        const averageCompletionTime =
          completedOrdersWithTime.length > 0
            ? completedOrdersWithTime.reduce((sum, order) => {
                const completionTime =
                  (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
                return sum + completionTime
              }, 0) / completedOrdersWithTime.length
            : 0

        // Calculate average response time (simplified - using updatedAt as proxy for acceptance time)
        const averageResponseTime =
          orders.length > 0
            ? orders.reduce((sum, order) => {
                const responseTime =
                  (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
                return sum + responseTime
              }, 0) / orders.length
            : 0

        // Check if active (has orders in last 30 days)
        const isActive = orders.some((order) => new Date(order.createdAt) >= thirtyDaysAgo)
        const lastActiveDate =
          orders.length > 0
            ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
            : null

        // Calculate monthly trend (simplified)
        const lastMonthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return orderDate >= lastMonth && orderDate < thisMonth
        })
        const thisMonthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return orderDate >= thisMonth
        })
        const monthlyTrend =
          lastMonthOrders.length > 0
            ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
            : 0

        // Get recent performance (last 6 months)
        const recentPerformance = []
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

          const monthOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt)
            return orderDate >= monthStart && orderDate < monthEnd
          })

          const monthCompleted = monthOrders.filter((order) => order.status === "COMPLETED")
          const monthEarnings = monthCompleted.reduce((sum, order) => sum + order.price * 0.7, 0)
          const monthReviews = monthOrders.map((order) => order.review).filter(Boolean)
          const monthRating =
            monthReviews.length > 0
              ? monthReviews.reduce((sum, review) => sum + review!.rating, 0) / monthReviews.length
              : 0

          recentPerformance.push({
            month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            orders: monthOrders.length,
            earnings: monthEarnings,
            rating: monthRating,
          })
        }

        // Get top games
        const gameStats = orders.reduce((acc, order) => {
          const gameId = order.game.id
          if (!acc[gameId]) {
            acc[gameId] = {
              gameId,
              gameName: order.game.name,
              orders: 0,
              averageRating: 0,
              totalRating: 0,
              ratingCount: 0,
            }
          }
          acc[gameId].orders++
          if (order.review) {
            acc[gameId].totalRating += order.review.rating
            acc[gameId].ratingCount++
            acc[gameId].averageRating = acc[gameId].totalRating / acc[gameId].ratingCount
          }
          return acc
        }, {} as any)

        const topGames = Object.values(gameStats)
          .sort((a: any, b: any) => b.orders - a.orders)
          .slice(0, 3)

        return {
          id: booster.id,
          username: booster.username,
          email: booster.email,
          createdAt: booster.createdAt,
          metrics: {
            totalOrders: orders.length,
            completedOrders: completedOrders.length,
            cancelledOrders: cancelledOrders.length,
            inProgressOrders: inProgressOrders.length,
            completionRate,
            averageRating,
            totalRatings: reviews.length,
            totalEarnings,
            averageCompletionTime,
            averageResponseTime,
            monthlyTrend,
            lastActiveDate,
            isActive,
          },
          recentPerformance,
          topGames,
        }
      }),
    )

    // Sort boosters
    const sortedBoosters = boostersWithAnalytics.sort((a, b) => {
      switch (sortBy) {
        case "completionRate":
          return b.metrics.completionRate - a.metrics.completionRate
        case "averageRating":
          return b.metrics.averageRating - a.metrics.averageRating
        case "totalEarnings":
          return b.metrics.totalEarnings - a.metrics.totalEarnings
        case "totalOrders":
          return b.metrics.totalOrders - a.metrics.totalOrders
        case "lastActive":
          return new Date(b.metrics.lastActiveDate || 0).getTime() - new Date(a.metrics.lastActiveDate || 0).getTime()
        default:
          return b.metrics.completionRate - a.metrics.completionRate
      }
    })

    // Calculate summary statistics
    const summary = {
      totalBoosters: total,
      activeBoosters: boostersWithAnalytics.filter((b) => b.metrics.isActive).length,
      averageCompletionRate:
        boostersWithAnalytics.reduce((sum, b) => sum + b.metrics.completionRate, 0) / boostersWithAnalytics.length || 0,
      averageRating:
        boostersWithAnalytics.reduce((sum, b) => sum + b.metrics.averageRating, 0) / boostersWithAnalytics.length || 0,
      totalEarnings: boostersWithAnalytics.reduce((sum, b) => sum + b.metrics.totalEarnings, 0),
    }

    return NextResponse.json({
      boosters: sortedBoosters,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      summary,
    })
  } catch (error) {
    console.error("Error fetching booster analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch booster analytics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
