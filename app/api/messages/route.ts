import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const url = new URL(req.url)
  const orderId = url.searchParams.get("orderId")
  const after = url.searchParams.get("after")

  if (!orderId) {
    return new Response(JSON.stringify({ error: "Order ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const orderIdNum = Number.parseInt(orderId)
    const afterIdNum = after ? Number.parseInt(after) : undefined

    // Check if user has access to this order
    const order = await db.order.findUnique({
      where: { id: orderIdNum },
      select: {
        id: true,
        clientId: true,
        boosterId: true,
        client: {
          select: {
            id: true,
            email: true,
          },
        },
        booster: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user ID from session and ensure it's a number
    const userId = typeof session.user.id === "string" ? Number.parseInt(session.user.id) : session.user.id
    const userEmail = session.user.email

    // Log the values for debugging
    console.log("Authorization check:", {
      userId,
      userIdType: typeof userId,
      userEmail,
      clientId: order.clientId,
      clientIdType: typeof order.clientId,
      clientEmail: order.client?.email,
      boosterId: order.boosterId,
      boosterIdType: typeof order.boosterId,
      boosterEmail: order.booster?.email,
      isClient: userId === order.clientId,
      isBooster: order.boosterId !== null && userId === order.boosterId,
      // Check by email as fallback
      isClientByEmail: userEmail === order.client?.email,
      isBoosterByEmail: order.booster && userEmail === order.booster.email,
    })

    // Check if user is either the client or the booster for this order
    // First try by ID with loose comparison
    const isAuthorizedById = userId == order.clientId || (order.boosterId !== null && userId == order.boosterId)

    // If ID check fails, try by email as fallback
    const isAuthorizedByEmail =
      userEmail === order.client?.email || (order.booster && userEmail === order.booster.email)

    if (!isAuthorizedById && !isAuthorizedByEmail) {
      return new Response(
        JSON.stringify({
          error: "Access denied",
          debug: {
            userId,
            userEmail,
            clientId: order.clientId,
            clientEmail: order.client?.email,
            boosterId: order.boosterId,
            boosterEmail: order.booster?.email,
            isAuthorizedById,
            isAuthorizedByEmail,
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Fetch messages
    const messages = await db.message.findMany({
      where: {
        orderId: orderIdNum,
        ...(afterIdNum && { id: { gt: afterIdNum } }),
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Format messages
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      orderId: message.orderId,
      senderId: message.sender.id,
      senderName: message.sender.username || message.sender.email,
      createdAt: message.createdAt,
      isClient: message.sender.role === "CLIENT",
    }))

    return new Response(JSON.stringify(formattedMessages), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const { content, orderId, tempId } = await req.json()

    if (!content || content.trim() === "") {
      return new Response(JSON.stringify({ error: "Message content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if user has access to this order
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        clientId: true,
        boosterId: true,
        client: {
          select: {
            id: true,
            email: true,
          },
        },
        booster: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user ID from session and ensure it's a number
    const userId = typeof session.user.id === "string" ? Number.parseInt(session.user.id) : session.user.id
    const userEmail = session.user.email

    // Log the values for debugging
    console.log("Authorization check for POST:", {
      userId,
      userIdType: typeof userId,
      userEmail,
      clientId: order.clientId,
      clientIdType: typeof order.clientId,
      clientEmail: order.client?.email,
      boosterId: order.boosterId,
      boosterIdType: typeof order.boosterId,
      boosterEmail: order.booster?.email,
      isClient: userId === order.clientId,
      isBooster: order.boosterId !== null && userId === order.boosterId,
      // Check by email as fallback
      isClientByEmail: userEmail === order.client?.email,
      isBoosterByEmail: order.booster && userEmail === order.booster.email,
    })

    // Check if user is either the client or the booster for this order
    // First try by ID with loose comparison
    const isAuthorizedById = userId == order.clientId || (order.boosterId !== null && userId == order.boosterId)

    // If ID check fails, try by email as fallback
    const isAuthorizedByEmail =
      userEmail === order.client?.email || (order.booster && userEmail === order.booster.email)

    if (!isAuthorizedById && !isAuthorizedByEmail) {
      return new Response(
        JSON.stringify({
          error: "Access denied",
          debug: {
            userId,
            userEmail,
            clientId: order.clientId,
            clientEmail: order.client?.email,
            boosterId: order.boosterId,
            boosterEmail: order.booster?.email,
            isAuthorizedById,
            isAuthorizedByEmail,
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content,
        orderId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Format the response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      orderId: message.orderId,
      senderId: message.sender.id,
      senderName: message.sender.username || message.sender.email,
      createdAt: message.createdAt,
      isClient: message.sender.role === "CLIENT",
      tempId,
    }

    return new Response(JSON.stringify(formattedMessage), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return new Response(JSON.stringify({ error: "Failed to create message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
