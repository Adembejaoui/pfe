import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
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

    const { content } = await request.json()

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Check if the user is related to this order (client or booster)
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { clientId: true, boosterId: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Assuming the user ID is stored in session.user.id
    if (order.clientId !== session.user.id && order.boosterId !== session.user.id) {
      return NextResponse.json({ error: "You are not related to this order" }, { status: 403 })
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content,
        orderId,
        senderId: session.user.id,
      },
    })

    // Revalidate the order page
    revalidatePath(`/orders/${orderId}`)

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
