import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const boosterId = Number.parseInt(params.id)
    const now = new Date()

    // Get booster with all related data
    const booster = await db.user.findUnique({
      where: {
        id: boosterId,
        role: "BOOSTER",
      },
      include: {
        ordersAsBooster: {
          include: {
            game: true,
            client: true,
            review: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!booster) {
      return NextResponse.json({ error: "Booster not found" }, { status: 404 })
    }

    const orders = booster.ordersAsBooster
    const completedOrders = orders.filter((order) => order.status === "COMPLETED")
    const cancelledOrders = orders.filter((order) => order.status === "CANCELLED")
    const inProgressOrders = orders.filter((order) => order.status === "IN_PROGRESS")

    const completionRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0

    const reviews = orders.map((order) => order.review).filter(Boolean)
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review!.rating, 0) / reviews.length : 0

    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.price * 0.7, 0)

    // Calculate completion and response times
    const completedOrdersWithTime = completedOrders.filter((order) => order.updatedAt)
    const averageCompletionTime =
      completedOrdersWithTime.length > 0
        ? completedOrdersWithTime.reduce((sum, order) => {
            const completionTime =
              (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
            return sum + completionTime
          }, 0) / completedOrdersWithTime.length
        : 0

    const averageResponseTime =
      orders.length > 0
        ? orders.reduce((sum, order) => {
            const responseTime =
              (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
            return sum + responseTime
          }, 0) / orders.length
        : 0

    // Check activity
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const isActive = orders.some((order) => new Date(order.createdAt) >= thirtyDaysAgo)
    const lastActiveDate = orders.length > 0 ? orders[0].createdAt : null

    // Calculate streak (simplified - consecutive days with activity)
    let streakDays = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const hasActivity = orders.some((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === checkDate.toDateString()
      })
      if (hasActivity) {
        streakDays++
      } else {
        break
      }
    }

    // Monthly trend
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

    // Performance history (last 12 months)
    const performanceHistory = []
    for (let i = 11; i >= 0; i--) {
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

      const monthCompletionTimes = monthCompleted.filter((order) => order.updatedAt)
      const monthAvgCompletionTime =
        monthCompletionTimes.length > 0
          ? monthCompletionTimes.reduce((sum, order) => {
              const completionTime =
                (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
              return sum + completionTime
            }, 0) / monthCompletionTimes.length
          : 0

      performanceHistory.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        orders: monthOrders.length,
        completed: monthCompleted.length,
        earnings: monthEarnings,
        rating: monthRating,
        completionTime: monthAvgCompletionTime,
      })
    }

    // Find best and worst months
    const monthsWithData = performanceHistory.filter((month) => month.orders > 0)
    const bestMonth = monthsWithData.reduce(
      (best, month) => (month.completed > best.completed ? month : best),
      monthsWithData[0] || { month: "N/A" },
    )
    const worstMonth = monthsWithData.reduce(
      (worst, month) => (month.completed < worst.completed ? month : worst),
      monthsWithData[0] || { month: "N/A" },
    )

    // Game performance
    const gameStats = orders.reduce((acc, order) => {
      const gameId = order.game.id
      if (!acc[gameId]) {
        acc[gameId] = {
          gameId,
          gameName: order.game.name,
          orders: 0,
          completed: 0,
          totalRating: 0,
          ratingCount: 0,
          earnings: 0,
        }
      }
      acc[gameId].orders++
      if (order.status === "COMPLETED") {
        acc[gameId].completed++
        acc[gameId].earnings += order.price * 0.7
      }
      if (order.review) {
        acc[gameId].totalRating += order.review.rating
        acc[gameId].ratingCount++
      }
      return acc
    }, {} as any)

    const gamePerformance = Object.values(gameStats)
      .map((game: any) => ({
        gameId: game.gameId,
        gameName: game.gameName,
        orders: game.orders,
        completionRate: game.orders > 0 ? (game.completed / game.orders) * 100 : 0,
        averageRating: game.ratingCount > 0 ? game.totalRating / game.ratingCount : 0,
        earnings: game.earnings,
      }))
      .sort((a: any, b: any) => b.orders - a.orders)

    // Recent orders (last 20)
    const recentOrders = orders.slice(0, 20).map((order) => ({
      id: order.id,
      gameId: order.game.id,
      gameName: order.game.name,
      gameTypeId: order.gameTypeId,
      status: order.status,
      price: order.price,
      createdAt: order.createdAt,
      completedAt: order.status === "COMPLETED" ? order.updatedAt : null,
      rating: order.review?.rating || null,
      clientUsername: order.client.username,
      clientEmail: order.client.email,
    }))

    // Reviews with details
    const reviewsWithDetails = reviews
      .map((review) => {
        const order = orders.find((o) => o.review?.id === review!.id)
        return {
          id: review!.id,
          rating: review!.rating,
          comment: review!.comment,
          createdAt: review!.createdAt,
          orderId: order!.id,
          gameName: order!.game.name,
          clientUsername: order!.client.username,
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const profile = {
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
        streakDays,
        bestMonth: bestMonth.month,
        worstMonth: worstMonth.month,
      },
      performanceHistory,
      gamePerformance,
      recentOrders,
      reviews: reviewsWithDetails,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching booster profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch booster profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
