import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ApiResponse, CreateOrderRequest, Order } from "@/lib/types"
import { parseGameTypes } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string; typeId: string } },
): Promise<NextResponse<ApiResponse<Order[]>>> {
  try {
    const gameId = Number.parseInt(params.gameId)
    const typeId = params.typeId

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    // Verify game exists
    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Verify game type exists
    const gameTypes = parseGameTypes(game.gameTypes, [])
    const gameType = gameTypes.find((type) => type.id === typeId)

    if (!gameType) {
      return NextResponse.json({ error: "Game type not found" }, { status: 404 })
    }

    // Get orders for this game and type
    const orders = await db.order.findMany({
      where: {
        gameId,
        gameTypeId: typeId,
      },
      include: {
        game: true,
        client: true,
        booster: true,
        messages: true,
        review: true,
      },
    })

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string; typeId: string } },
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const gameId = Number.parseInt(params.gameId)
    const typeId = params.typeId

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const body: CreateOrderRequest = await request.json()

    // Validate required fields
    if (!body.clientId || !body.price) {
      return NextResponse.json({ error: "Client ID and price are required" }, { status: 400 })
    }

    // Verify game exists
    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Verify game type exists
    const gameTypes = parseGameTypes(game.gameTypes, [])
    const gameType = gameTypes.find((type) => type.id === typeId)

    if (!gameType) {
      return NextResponse.json({ error: "Game type not found" }, { status: 404 })
    }

    // Verify client exists
    const client = await db.user.findUnique({
      where: { id: body.clientId },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Verify booster exists if provided
    if (body.boosterId) {
      const booster = await db.user.findUnique({
        where: { id: body.boosterId },
      })

      if (!booster) {
        return NextResponse.json({ error: "Booster not found" }, { status: 404 })
      }

      // Verify booster is a BOOSTER or ADMIN
      if (booster.role !== "BOOSTER" && booster.role !== "ADMIN") {
        return NextResponse.json({ error: "User is not a booster" }, { status: 400 })
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        gameId,
        gameTypeId: typeId,
        clientId: body.clientId,
        boosterId: body.boosterId,
        attributes: body.attributes || {},
        price: body.price,
      },
      include: {
        game: true,
        client: true,
        booster: true,
      },
    })

    return NextResponse.json({ data: order, message: "Order created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
