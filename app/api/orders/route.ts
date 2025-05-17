import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Update the GET function to handle undefined role parameter
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email as string },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const statusParams = url.searchParams.getAll("status")
    const roleParam = url.searchParams.get("role")

    // Default to user's role if not specified
    const role = roleParam?.toLowerCase()

    console.log("Fetching orders with params:", { statusParams, role, userId: user.id, userRole: user.role })

    // Build the where clause
    const where: any = {}

    // Filter by status if provided
    if (statusParams.length > 0) {
      where.status = { in: statusParams.map((s) => s.toUpperCase()) }
    }

    // Filter by user role
    if (role === "client") {
      where.clientId = user.id
    } else if (role === "booster") {
      // For boosters, show both assigned orders and available orders
      if (statusParams.includes("PENDING")) {
        // For pending orders, show all available ones (no booster assigned)
        where.OR = [{ boosterId: user.id }, { boosterId: null, status: "PENDING" }]
      } else {
        // For other statuses, only show assigned orders
        where.boosterId = user.id
      }
    }
    // For admin, don't add any user filters

    console.log("Query where clause:", where)

    // Get orders
    const orders = await db.order.findMany({
      where,
      include: {
        game: true,
        client: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        booster: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`Found ${orders.length} orders`)

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
