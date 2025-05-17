import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { OrderStatus } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = Number(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Check if the user is assigned to this order
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { boosterId: true, clientId: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get the user ID from the session and ensure it's a number
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id
    
    // Log the IDs for debugging
    console.log(`User ID (${typeof userId}):`, userId)
    console.log(`Booster ID (${typeof order.boosterId}):`, order.boosterId)

    // Check if the user is the booster assigned to this order
    // Convert both to strings for comparison to avoid type issues
    if (String(order.boosterId) !== String(userId)) {
      return NextResponse.json({ error: "You are not assigned to this order" }, { status: 403 })
    }

    // Update the order status
    await db.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PENDING,
        boosterId: null,
      },
    })

    // Add a system message
    await db.message.create({
      data: {
        content: "Booster has abandoned this order. Waiting for a new booster to be assigned.",
        orderId,
        senderId: userId,
      },
    })

    // Revalidate the order page
    revalidatePath(`/orders/${orderId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error abandoning order:", error)
    return NextResponse.json({ error: "Failed to abandon order" }, { status: 500 })
  }
}
