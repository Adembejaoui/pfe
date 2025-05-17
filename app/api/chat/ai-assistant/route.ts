import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// System prompt to control AI behavior
const SYSTEM_PROMPT = `
You are an AI assistant for a game boosting service. Your role is to help clients with questions about their orders and the boosting service.

GUIDELINES:
- Be helpful, friendly, and professional
- Only answer questions related to the boosting service and orders
- Do not provide any sensitive information like passwords or payment details
- If asked about order details, only share information that is provided to you
- For technical issues or complex requests, suggest contacting human support
- Keep responses concise and to the point
- Do not make up information about the order that isn't provided to you

You can help with:
- Explaining how the boosting service works
- Clarifying order status and progress
- Explaining different service options
- General questions about games and ranking systems
- Basic troubleshooting
`

export async function POST(req: Request) {
  try {
    const { orderId, message, history } = await req.json()

    if (!message || !orderId) {
      return NextResponse.json({ error: "Message and orderId are required" }, { status: 400 })
    }

    // Get order details to provide context to the AI
    let orderContext = ""
    try {
      const order = await db.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          game: true,
          client: {
            select: {
              username: true,
            },
          },
          booster: {
            select: {
              username: true,
            },
          },
        },
      })

      if (order) {
        // Parse attributes using the helper function if needed
        let attributes = order.attributes || {}

        // If attributes is a string, parse it
        if (typeof attributes === "string") {
          try {
            attributes = JSON.parse(attributes)
          } catch (e) {
            console.error("Error parsing order attributes:", e)
            attributes = {}
          }
        }

        // Create context string with order details
        orderContext = `
          ORDER CONTEXT:
          - Order ID: ${order.id}
          - Game: ${order.game?.name || "Unknown game"}
          - Service Type: ${order.gameTypeId || "Unknown service"}
          - Status: ${order.status}
          - Client: ${order.client?.username || "Unknown client"}
          - Booster: ${order.booster?.username || "Not assigned yet"}
          ${attributes.currentRank ? `- Current Rank: ${JSON.stringify(attributes.currentRank)}` : ""}
          ${attributes.desiredRank ? `- Desired Rank: ${JSON.stringify(attributes.desiredRank)}` : ""}
          ${attributes.wins ? `- Wins: ${attributes.wins}` : ""}
          ${attributes.placements ? `- Placements: ${attributes.placements}` : ""}
        `
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      // Continue without order context if there's an error
    }

    // Format conversation history for the AI
    const formattedHistory = history || []

    // Use generateText instead of streamText to avoid object response issues
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `${SYSTEM_PROMPT}\n${orderContext}`,
      messages: [...formattedHistory, { role: "user", content: message }],
    })

    // Ensure we have a valid string response
    if (!text || typeof text !== "string") {
      console.error("Invalid response from AI:", text)
      return NextResponse.json({ error: "Failed to generate a valid response" }, { status: 500 })
    }

    // Store the AI message in the database
    try {
      const newMessage = await db.message.create({
        data: {
          content: text, // This is now guaranteed to be a string
          orderId: Number(orderId),
          senderId: 0, // Use 0 or a special system user ID for AI messages
          isAI: true,
        },
      })

      console.log("Successfully created AI message:", newMessage.id)
    } catch (error) {
      console.error("Error storing AI message in database:", error)
      // Continue even if database storage fails
    }

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("AI Assistant error:", error)
    return NextResponse.json(
      { error: "Failed to generate AI response", message: (error as Error).message },
      { status: 500 },
    )
  }
}
