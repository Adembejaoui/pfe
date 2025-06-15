import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Get the order
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse attributes
    const attributes = order.attributes
      ? typeof order.attributes === "string"
        ? JSON.parse(order.attributes as string)
        : order.attributes
      : {}

    // Return all data for debugging
    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        boosterId: order.boosterId,
      },
      attributes: attributes,
      actualRank: attributes.actualRank || null,
      lastRankUpdate: attributes.lastRankUpdate || null,
      playerData: attributes.playerData || attributes.playerInfo || {},
      rawAttributes: order.attributes, // Return the raw attributes for debugging
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
