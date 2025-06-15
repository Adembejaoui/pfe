import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { JsonObject, JsonArray } from "@prisma/client/runtime/library"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        game: true,
        gameType: true,
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
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        review: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse the JSON attributes
    const attributes = parseOrderAttributes(order.attributes, {})

    // Return the order with parsed attributes
    return NextResponse.json({
      ...order,
      attributes,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Extract updatable fields
    const {
      status,
      boosterId,
      // If updating attributes
      attributes,
    } = body

    // Prepare update data
    const updateData: any = {}

    if (status) updateData.status = status
    if (boosterId !== undefined) updateData.boosterId = boosterId || null

    // If updating attributes, merge with existing attributes
    if (attributes) {
      const existingAttributes = parseOrderAttributes(existingOrder.attributes, {})
      updateData.attributes = { ...existingAttributes, ...attributes }
    }

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
function parseOrderAttributes(attributes: string | number | boolean | JsonObject | JsonArray | null, arg1: {}) {
  throw new Error("Function not implemented.")
}

