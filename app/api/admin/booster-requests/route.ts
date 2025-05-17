import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "You must be logged in to access this resource" }, { status: 401 })
    }

    // Ensure user is an admin
    const user = await db.user.findUnique({
      where: { id: Number.parseInt(session.user.id) },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "You must be an admin to access this resource" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const status = url.searchParams.get("status") || undefined
    const search = url.searchParams.get("search") || undefined
    const game = url.searchParams.get("game") || undefined

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Filter by status if provided
    if (status && status !== "ALL") {
      where.status = status
    }

    // Search by user email or username
    if (search) {
      where.OR = [
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ]
    }

    // Filter by game
    if (game) {
      // This is a bit tricky with Prisma and JSON fields
      // We need to use a raw query or a workaround
      // For now, we'll fetch all and filter in memory
    }

    // Get total count
    const total = await db.boosterRequest.count({ where })

    // Get requests with pagination
    let requests = await db.boosterRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Filter by game if needed (in-memory filtering for JSON fields)
    if (game) {
      requests = requests.filter((request) => {
        const preferredGames = request.attributes?.preferredGames || []
        return Array.isArray(preferredGames) && preferredGames.includes(game)
      })
    }

    return NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching booster requests:", error)
    return NextResponse.json({ message: "Failed to fetch booster requests" }, { status: 500 })
  }
}
