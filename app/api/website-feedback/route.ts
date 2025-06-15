import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // Adjust path to your auth config

export async function GET() {
  return NextResponse.json({ message: "Website Feedback API is working!" }, { status: 200 })
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Website Feedback API called")

    const body = await request.json()
    console.log("📝 Website Feedback API request body:", body)

    const { feedback, userId, orderId, type } = body

    // Validate required fields
    if (!feedback) {
      console.log("❌ Invalid request - missing feedback")
      return NextResponse.json({ error: "Feedback is required" }, { status: 400 })
    }

    // Get session to verify user
    const session = await getServerSession(authOptions)

    let finalUserId: number | null = null

    if (session?.user?.id) {
      // Use authenticated user's ID
      finalUserId = Number(session.user.id)
    } else if (userId) {
      // Verify the provided userId exists in the database
      const userExists = await db.user.findUnique({
        where: { id: Number(userId) },
      })

      if (!userExists) {
        console.log("❌ User not found with ID:", userId)
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
      }

      finalUserId = Number(userId)
    } else {
      // No user provided - create anonymous feedback
      console.log("ℹ️ Creating anonymous feedback")
    }

    // Add type prefix to content for better organization
    const contentWithType = type ? `[${type.toUpperCase()}]\n${feedback}` : feedback

    // Store website feedback in database
    const feedbackData: any = {
      content: contentWithType,
      orderId: orderId ? Number(orderId) : null,
    }

    // Only add userId if we have a valid one
    if (finalUserId) {
      feedbackData.userId = finalUserId
    }

    const feedbackRecord = await db.websiteFeedback.create({
      data: feedbackData,
    })

    console.log("✅ Website feedback stored in database:", feedbackRecord)

    return NextResponse.json(
      {
        success: true,
        feedback: feedbackRecord,
        message: "Website feedback stored successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("💥 Error storing website feedback:", error)

    // Handle specific Prisma errors
    if (error instanceof Error && "code" in error) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error: "Invalid user reference",
            details: "The provided user ID does not exist",
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to store website feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
