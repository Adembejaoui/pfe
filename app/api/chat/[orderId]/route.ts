import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes max duration for long polling

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const orderId = Number.parseInt(params.orderId)
  if (isNaN(orderId)) {
    return new Response("Invalid order ID", { status: 400 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get the last event ID to fetch messages after this ID
  const lastEventId = req.headers.get("Last-Event-ID") || "0"
  const lastMessageId = Number.parseInt(lastEventId)

  try {
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
      return new Response("Order not found", { status: 404 })
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

    // Create a stream for sending messages
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Flag to track if the controller is active
        let isControllerActive = true

        // Function to fetch and send new messages
        const fetchAndSendMessages = async () => {
          // Skip if controller is no longer active
          if (!isControllerActive) return

          try {
            const messages = await db.message.findMany({
              where: {
                orderId,
                id: { gt: lastMessageId },
              },
              orderBy: { id: "asc" },
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

            // Send each message as an event
            for (const message of messages) {
              // Skip if controller is no longer active
              if (!isControllerActive) return

              try {
                const formattedMessage = {
                  id: message.id,
                  content: message.content,
                  orderId: message.orderId,
                  senderId: message.sender.id,
                  senderName: message.sender.username || message.sender.email,
                  createdAt: message.createdAt,
                  isClient: message.sender.role === "CLIENT",
                }

                const event = `id: ${message.id}\ndata: ${JSON.stringify(formattedMessage)}\n\n`
                controller.enqueue(encoder.encode(event))
              } catch (error) {
                console.error("Error sending message event:", error)
                // If we get an invalid state error, mark controller as inactive
                if (error instanceof TypeError && error.message.includes("Controller is already closed")) {
                  isControllerActive = false
                  return
                }
              }
            }
          } catch (error) {
            console.error("Error fetching messages:", error)
            // If there's an error, send a comment to keep the connection alive
            if (isControllerActive) {
              try {
                controller.enqueue(encoder.encode(": keep-alive\n\n"))
              } catch (e) {
                // If we can't send the keep-alive, the controller is probably closed
                isControllerActive = false
              }
            }
          }
        }

        // Send initial connection message
        controller.enqueue(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'))

        // Send initial messages
        await fetchAndSendMessages()

        // Set up interval to check for new messages
        const interval = setInterval(async () => {
          if (!isControllerActive) {
            clearInterval(interval)
            return
          }

          try {
            await fetchAndSendMessages()
          } catch (error) {
            console.error("Error in fetchAndSendMessages:", error)
            // If there's an unrecoverable error, clean up
            if (error instanceof TypeError && error.message.includes("Controller is already closed")) {
              isControllerActive = false
              clearInterval(interval)
            }
          }
        }, 3000)

        // Clean up on close
        req.signal.addEventListener("abort", () => {
          isControllerActive = false
          clearInterval(interval)
          try {
            controller.close()
          } catch (error) {
            console.error("Error closing controller:", error)
          }
        })
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in chat stream:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  const orderId = Number.parseInt(params.orderId)
  if (isNaN(orderId)) {
    return new Response("Invalid order ID", { status: 400 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const { content, tempId } = await req.json()

    if (!content || content.trim() === "") {
      return new Response(JSON.stringify({ error: "Message content is required" }), {
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
