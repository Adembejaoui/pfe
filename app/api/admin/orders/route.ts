import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameTypes } from "@/lib/db"
import type { OrderStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") as OrderStatus | null
    const gameId = searchParams.get("gameId") ? Number.parseInt(searchParams.get("gameId")!) : null
    const gameTypeId = searchParams.get("gameTypeId") || null
    const clientId = searchParams.get("clientId") ? Number.parseInt(searchParams.get("clientId")!) : null
    const boosterId = searchParams.get("boosterId") ? Number.parseInt(searchParams.get("boosterId")!) : null
    const hasBooster =
      searchParams.get("hasBooster") === "true" ? true : searchParams.get("hasBooster") === "false" ? false : null

    const skip = (page - 1) * limit

    // Build filter conditions
    const where = {
      ...(status && status !== "ALL" && { status }),
      ...(gameId && { gameId }),
      ...(gameTypeId && { gameTypeId }),
      ...(clientId && { clientId }),
      ...(boosterId && { boosterId }),
      ...(hasBooster === true && { boosterId: { not: null } }),
      ...(hasBooster === false && { boosterId: null }),
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              gameTypes: true,
            },
          },
          client: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          booster: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.order.count({ where }),
    ])

    // Process orders to include game type information
    const processedOrders = orders.map((order) => {
      const gameTypes = parseGameTypes(order.game.gameTypes, [])
      const gameType = gameTypes.find((gt: any) => gt.id === order.gameTypeId) || null

      return {
        ...order,
        gameType: gameType
          ? {
              id: gameType.id,
              name: gameType.name,
              slug: gameType.slug,
            }
          : null,
        game: {
          id: order.game.id,
          name: order.game.name,
          slug: order.game.slug,
        },
      }
    })

    return NextResponse.json({
      orders: processedOrders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, gameTypeId, clientId, boosterId, status, price } = body

    // Validate required fields
    if (!gameId || !gameTypeId || !clientId || !price) {
      return NextResponse.json({ error: "Game ID, game type ID, client ID, and price are required" }, { status: 400 })
    }

    // Check if game exists
    const game = await db.game.findUnique({
      where: { id: gameId },
      select: { gameTypes: true },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if game type exists
    const gameTypes = parseGameTypes(game.gameTypes, [])
    const gameType = gameTypes.find((gt: any) => gt.id === gameTypeId)

    if (!gameType) {
      return NextResponse.json({ error: "Game type not found" }, { status: 404 })
    }

    // Check if client exists
    const client = await db.user.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check if booster exists if provided
    if (boosterId) {
      const booster = await db.user.findUnique({
        where: { id: boosterId },
      })

      if (!booster) {
        return NextResponse.json({ error: "Booster not found" }, { status: 404 })
      }

      if (booster.role !== "BOOSTER" && booster.role !== "ADMIN") {
        return NextResponse.json({ error: "Assigned user must be a booster or admin" }, { status: 400 })
      }
    }

    // Create new order
    const newOrder = await db.order.create({
      data: {
        gameId,
        gameTypeId,
        clientId,
        boosterId,
        status: status || "PENDING",
        price,
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        client: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        booster: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...newOrder,
        gameType: {
          id: gameTypeId,
          name: gameType.name,
          slug: gameType.slug,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
