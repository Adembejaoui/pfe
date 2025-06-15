import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const tier = searchParams.get("tier") || "platinum"
    const division = searchParams.get("division") || "II"
    const lp = Number.parseInt(searchParams.get("lp") || "75")

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

    // Create rank data
    const rankData = {
      tier: tier.toLowerCase(),
      division: division,
      lp: lp,
      wins: 120,
      losses: 100,
      lastUpdated: new Date().toISOString(),
    }

    // Update attributes
    attributes.actualRank = rankData
    attributes.lastRankUpdate = new Date().toISOString()

    // Save to database
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        attributes: attributes,
      },
    })

    // Return updated data
    return NextResponse.json({
      message: "Rank updated successfully",
      rankData: rankData,
      lastUpdated: rankData.lastUpdated,
      updatedAttributes: attributes,
      beforeUpdate: order.attributes,
      afterUpdate: updatedOrder.attributes,
    })
  } catch (error) {
    console.error("Error setting rank:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
