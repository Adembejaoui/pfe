import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameTypes } from "@/lib/db"
import { $Enums, Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // Get basic counts with individual try/catch blocks to prevent one failure from breaking everything
    let totalUsers = 0
    let totalGames = 0
    let totalOrders = 0
    let totalRevenue = 0
    let usersByRole: (Prisma.PickEnumerable<Prisma.UserGroupByOutputType, "role"[]> & { _count: { id: number } })[] = []
    let ordersByStatus: { _sum: { price: number }; status: $Enums.OrderStatus; _count: { id: number } }[] = []
    let recentOrders: { price: number; gameType: { name: any } | null; client: { email: string; username: string | null }; game: { name: string; gameTypes: Prisma.JsonValue }; booster: { email: string; username: string | null } | null; id: number; createdAt: Date; updatedAt: Date; gameId: number; gameTypeId: string; clientId: number; boosterId: number | null; status: $Enums.OrderStatus; attributes: Prisma.JsonValue | null }[] = []
    let topGames: ({ _count: { orders: number } } & { id: number; createdAt: Date; updatedAt: Date; name: string; attributes: Prisma.JsonValue | null; slug: string; description: string | null; imageUrl: string | null; gameTypes: Prisma.JsonValue | null })[] = []
    let topBoosters: ({ _count: { ordersAsBooster: number } } & { role: $Enums.Role; id: number; email: string; password: string; username: string | null; emailVerified: boolean; verificationToken: string | null; verificationTokenExpiry: Date | null; createdAt: Date; updatedAt: Date })[] = []

    try {
      totalUsers = await db.user.count()
    } catch (error) {
      console.error("Error counting users:", error)
    }

    try {
      totalGames = await db.game.count()
    } catch (error) {
      console.error("Error counting games:", error)
    }

    try {
      totalOrders = await db.order.count()
    } catch (error) {
      console.error("Error counting orders:", error)
    }

    // Total revenue
    try {
      const revenueResult = await db.order.aggregate({
        _sum: {
          price: true,
        },
      })
      totalRevenue = Number(revenueResult._sum.price || 0)
    } catch (error) {
      console.error("Error calculating total revenue:", error)
    }

    // Users by role
    try {
      const userRoleResult = await db.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      })
      usersByRole = userRoleResult
    } catch (error) {
      console.error("Error grouping users by role:", error)
    }

    // Orders by status
    try {
      const orderStatusResult = await db.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        _sum: {
          price: true,
        },
      })

      // Convert Decimal to number for JSON serialization
      ordersByStatus = orderStatusResult.map((item) => ({
        ...item,
        _sum: {
          price: item._sum.price ? Number(item._sum.price) : 0,
        },
      }))
    } catch (error) {
      console.error("Error grouping orders by status:", error)
    }

    // Recent orders
    try {
      const recentOrdersResult = await db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          game: {
            select: {
              name: true,
              gameTypes: true,
            },
          },
          client: {
            select: {
              email: true,
              username: true,
            },
          },
          booster: {
            select: {
              email: true,
              username: true,
            },
          },
        },
      })

      // Process orders to include game type information
      recentOrders = recentOrdersResult.map((order) => {
        const gameTypes = parseGameTypes(order.game.gameTypes, [])
        const gameType = gameTypes.find((gt: any) => gt.id === order.gameTypeId) || null

        return {
          ...order,
          price: Number(order.price),
          gameType: gameType
            ? {
                name: gameType.name,
              }
            : null,
        }
      })
    } catch (error) {
      console.error("Error fetching recent orders:", error)
    }

    // Top games
    try {
      const topGamesResult = await db.game.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          orders: {
            _count: "desc",
          },
        },
      })
      topGames = topGamesResult
    } catch (error) {
      console.error("Error fetching top games:", error)
    }

    // Top boosters
    try {
      const topBoostersResult = await db.user.findMany({
        where: {
          role: "BOOSTER",
          ordersAsBooster: {
            some: {
              status: "COMPLETED",
            },
          },
        },
        take: 5,
        include: {
          _count: {
            select: {
              ordersAsBooster: {
                where: {
                  status: "COMPLETED",
                },
              },
            },
          },
        },
        orderBy: {
          ordersAsBooster: {
            _count: "desc",
          },
        },
      })
      topBoosters = topBoostersResult
    } catch (error) {
      console.error("Error fetching top boosters:", error)
    }

    return NextResponse.json({
      counts: {
        users: totalUsers,
        games: totalGames,
        orders: totalOrders,
      },
      revenue: {
        total: totalRevenue,
      },
      usersByRole,
      ordersByStatus,
      recentOrders,
      topGames,
      topBoosters,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
