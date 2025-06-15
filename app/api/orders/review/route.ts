import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("🔍 Review API called")
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.log("❌ Unauthorized - no session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("📝 Review API request body:", body)

    const { orderId, boosterId, authorId, rating, comment, tags } = body

    // Validate required fields
    if (!orderId || !rating || rating < 1 || rating > 5) {
      console.log("❌ Invalid request - missing required fields")
      return NextResponse.json({ error: "Invalid request. Order ID and rating (1-5) are required." }, { status: 400 })
    }

    // Check if the user is the client of this order
    console.log(`🔍 Finding order with ID: ${Number(orderId)}`)
    const order = await db.order.findUnique({
      where: { id: Number(orderId) },
      select: { clientId: true, status: true, review: true },
    })

    if (!order) {
      console.log("❌ Order not found")
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("✅ Order found:", order)

    // Only allow clients to review their own orders (or admins)
    if (session.user.role !== "ADMIN" && Number(session.user.id) !== order.clientId) {
      console.log("❌ Permission denied - not owner or admin")
      return NextResponse.json({ error: "You can only review your own orders" }, { status: 403 })
    }

    // Check if order is completed
    if (order.status !== "COMPLETED") {
      console.log("❌ Order not completed")
      return NextResponse.json({ error: "You can only review completed orders" }, { status: 400 })
    }

    // Check if review already exists
    if (order.review) {
      console.log("❌ Review already exists")
      return NextResponse.json({ error: "You have already reviewed this order" }, { status: 400 })
    }

    // Prepare comment with tags
    let finalComment = comment || ""
    if (tags && tags.length > 0) {
      finalComment = tags.length > 0 ? `${tags.join(", ")}${comment ? `: ${comment}` : ""}` : comment
    }

    console.log("💾 Creating review with data:", {
      rating: Number(rating),
      comment: finalComment,
      orderId: Number(orderId),
      authorId: Number(authorId || session.user.id),
    })

    // Create the review
    try {
      const review = await db.review.create({
        data: {
          rating: Number(rating),
          comment: finalComment,
          orderId: Number(orderId),
          authorId: Number(authorId || session.user.id),
        },
      })

      console.log("✅ Review created successfully:", review)
      return NextResponse.json({ success: true, review }, { status: 201 })
    } catch (dbError) {
      console.error("💥 Database error creating review:", dbError)
      return NextResponse.json(
        {
          error: "Database error creating review",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 Error creating review:", error)
    return NextResponse.json(
      {
        error: "Failed to create review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
