import type { NextRequest } from "next/server"

import { db } from "@/lib/db"
import { generateAIResponse } from "@/lib/ai-assistant"

// Helper function to check if a booster is active
async function isBoosterActive(orderId: number): Promise<boolean> {
  try {
    // Get the order with the booster information
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        boosterId: true,
        status: true,
        booster: {
          select: {
            id: true,
            messages: {
              select: {
                createdAt: true,
                isAI: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              where: {
                isAI: false, // Only consider non-AI messages
              },
            },
          },
        },
      },
    })

    // If no booster is assigned, they can't be active
    if (!order?.boosterId || !order.booster) {
      return false
    }

    // If the order is IN_PROGRESS, consider the booster active
    if (order.status === "IN_PROGRESS") {
      // Check if the booster has sent a message in the last 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

      // If the booster has recent messages, they're considered active
      if (order.booster.messages.length > 0) {
        const lastMessage = order.booster.messages[0]
        return lastMessage.createdAt > thirtyMinutesAgo
      }
    }

    return false
  } catch (error) {
    console.error("Error checking booster activity status:", error)
    return false // Default to inactive if there's an error
  }
}

// Helper function to find or create an AI system user
async function getOrCreateAISystemUser() {
  try {
    // Try to find an existing AI system user
    let systemUser = await db.user.findFirst({
      where: {
        email: "ai-assistant@system.local",
        role: "ADMIN", // Using ADMIN role for system users
      },
    })

    // If no system user exists, create one
    if (!systemUser) {
      systemUser = await db.user.create({
        data: {
          email: "ai-assistant@system.local",
          username: "AI Assistant",
          password: "SYSTEM_USER_" + Date.now(), // Generate a random password
          role: "ADMIN",
          emailVerified: true,
        },
      })
      console.log("Created AI system user:", systemUser.id)
    }

    return systemUser
  } catch (error) {
    console.error("Error getting or creating AI system user:", error)
    throw new Error("Failed to get or create AI system user")
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, message, messageHistory } = await req.json()

    if (!orderId || !message) {
      return new Response(JSON.stringify({ error: "Order ID and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch order details for context
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        gameTypeId: true,
        attributes: true,
        boosterId: true,
        status: true,
        booster: {
          select: {
            id: true,
            username: true,
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

    // Parse attributes
    const attributes = order.attributes
      ? typeof order.attributes === "string"
        ? JSON.parse(order.attributes)
        : order.attributes
      : {}

    // Check if the booster is active
    const boosterActive = await isBoosterActive(orderId)

    // Prepare context for the AI
    const orderContext = {
      orderId: order.id,
      service: order.gameTypeId,
      currentRank: attributes.currentRank,
      desiredRank: attributes.desiredRank,
      wins: attributes.wins,
      placements: attributes.placements,
      isBoosterActive: boosterActive,
    }

    // Format message history for the AI
    const formattedHistory =
      messageHistory?.map((msg: any) => ({
        role: msg.isAI ? "assistant" : "user",
        content: msg.content,
      })) || []

    // Add the current message
    formattedHistory.push({
      role: "user",
      content: message,
    })

    // Generate AI response
    const aiResponse = await generateAIResponse(formattedHistory, orderContext)

    // If the booster is active, don't save an AI message
    if (boosterActive) {
      return new Response(
        JSON.stringify({
          message: aiResponse,
          boosterActive: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Get or create the AI system user
    const aiSystemUser = await getOrCreateAISystemUser()

    // Save the AI message to the database using the AI system user
    const aiMessage = await db.message.create({
      data: {
        content: aiResponse,
        orderId,
        senderId: aiSystemUser.id, // Use the AI system user ID
        isAI: true,
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
      id: aiMessage.id,
      content: aiMessage.content,
      orderId: aiMessage.orderId,
      senderId: aiMessage.sender.id,
      senderName: "AI Assistant",
      createdAt: aiMessage.createdAt,
      isClient: false,
      isAI: true,
    }

    return new Response(JSON.stringify(formattedMessage), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return new Response(JSON.stringify({ error: "Failed to generate AI response", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
