import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameAttributes, parseGameTypes } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
            attributes: true,
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
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                username: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        review: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse game attributes
    if (order.game.attributes) {
      order.game.attributes = parseGameAttributes(order.game.attributes, {})
    }

    // Find the game type from the game's gameTypes array
    const gameTypes = parseGameTypes(order.game.gameTypes, [])
    const gameType = gameTypes.find((gt: any) => gt.id === order.gameTypeId) || null

    // Create a processed order with the game type information
    const processedOrder = {
      ...order,
      gameType: gameType
        ? {
            id: gameType.id,
            name: gameType.name,
            slug: gameType.slug,
            description: gameType.description,
          }
        : null,
      game: {
        ...order.game,
        gameTypes: undefined, // Remove the full gameTypes array from the response
      },
    }

    return NextResponse.json(processedOrder)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status, boosterId, price } = body

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // If boosterId is provided, check if user exists and is a booster
    if (boosterId !== undefined) {
      if (boosterId !== null) {
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
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(boosterId !== undefined && { boosterId }),
        ...(price !== undefined && { price }),
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
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
    })

    // Find the game type from the game's gameTypes array
    const gameTypes = parseGameTypes(updatedOrder.game.gameTypes, [])
    const gameType = gameTypes.find((gt: any) => gt.id === updatedOrder.gameTypeId) || null

    // Create a processed order with the game type information
    const processedOrder = {
      ...updatedOrder,
      gameType: gameType
        ? {
            id: gameType.id,
            name: gameType.name,
            slug: gameType.slug,
          }
        : null,
      game: {
        id: updatedOrder.game.id,
        name: updatedOrder.game.name,
      },
    }

    return NextResponse.json(processedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: {
        messages: true,
        review: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Delete related messages and review first
    if (existingOrder.messages.length > 0) {
      await db.message.deleteMany({
        where: { orderId: id },
      })
    }

    if (existingOrder.review) {
      await db.review.delete({
        where: { orderId: id },
      })
    }

    // Delete order
    await db.order.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
