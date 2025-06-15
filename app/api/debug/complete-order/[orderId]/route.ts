import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = Number(params.orderId)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    console.log("🧪 Debug: Manually completing order", orderId)

    // Update the order status to COMPLETED
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
      },
      include: {
        review: true,
      },
    })

    console.log("🧪 Debug: Order updated", {
      id: updatedOrder.id,
      status: updatedOrder.status,
      hasReview: !!updatedOrder.review,
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        hasReview: !!updatedOrder.review,
      },
      message: "Order manually completed for testing",
    })
  } catch (error) {
    console.error("🧪 Debug: Error completing order:", error)
    return NextResponse.json({ error: "Failed to complete order" }, { status: 500 })
  }
}
