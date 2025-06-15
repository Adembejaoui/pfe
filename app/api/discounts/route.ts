import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Function to generate a unique discount code
function generateDiscountCode(clientId: number): string {
  const prefix = "FEEDBACK"
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}${randomPart}`
}

export async function GET() {
  return NextResponse.json({ message: "Discounts API is working!" }, { status: 200 })
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Discount API called")

    const body = await request.json()
    console.log("📝 Discount API request body:", body)

    const { orderId, clientId, surveyAnswers, websiteFeedback } = body

    // Validate required fields
    if (!orderId || !clientId || !surveyAnswers) {
      console.log("❌ Invalid request - missing required fields")
      return NextResponse.json(
        {
          error: "Order ID, client ID, and survey answers are required",
        },
        { status: 400 },
      )
    }

    // Step 1: Store survey answers as website feedback
    let surveyFeedbackRecord = null
    try {
      console.log("📤 Storing survey answers as website feedback...")

      // Format survey answers into readable text
      const surveyText = Object.entries(surveyAnswers)
        .map(([question, answer]) => `${question}: ${answer ? "Yes" : "No"}`)
        .join("\n")

      const surveyFeedbackContent = `Survey Responses:\n${surveyText}`

      const surveyFeedbackResponse = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/website-feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback: surveyFeedbackContent,
            userId: Number(clientId),
            orderId: Number(orderId),
            type: "survey_responses",
          }),
        },
      )

      if (surveyFeedbackResponse.ok) {
        const surveyFeedbackData = await surveyFeedbackResponse.json()
        surveyFeedbackRecord = surveyFeedbackData.feedback
        console.log("✅ Survey answers stored as feedback with ID:", surveyFeedbackRecord.id)
      } else {
        console.error("⚠️ Failed to store survey answers:", await surveyFeedbackResponse.text())
      }
    } catch (surveyError) {
      console.error("⚠️ Error storing survey answers:", surveyError)
    }

    // Step 2: Store additional website feedback if provided
    let websiteFeedbackRecord = null
    if (websiteFeedback && websiteFeedback.trim()) {
      try {
        console.log("📤 Storing additional website feedback...")
        const feedbackResponse = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/website-feedback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              feedback: websiteFeedback.trim(),
              userId: Number(clientId),
              orderId: Number(orderId),
              type: "website_improvement",
            }),
          },
        )

        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json()
          websiteFeedbackRecord = feedbackData.feedback
          console.log("✅ Website feedback stored with ID:", websiteFeedbackRecord.id)
        } else {
          console.error("⚠️ Failed to store website feedback:", await feedbackResponse.text())
        }
      } catch (feedbackError) {
        console.error("⚠️ Error calling website feedback API:", feedbackError)
      }
    }

    // Step 3: Generate unique discount code
    const discountCode = generateDiscountCode(Number(clientId))

    // Step 4: Calculate discount percentage
    const yesCount = Object.values(surveyAnswers).filter((answer) => answer === true).length
    const totalQuestions = Object.keys(surveyAnswers).length

    // Calculate discount:
    // - Base: 5%
    // - +1% per "Yes" answer
    // - +2% if website feedback provided
    // - Max: 15%
    let discountPercentage = 5 + yesCount
    if (websiteFeedback && websiteFeedback.trim()) {
      discountPercentage += 2
    }
    discountPercentage = Math.min(15, discountPercentage)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Step 5: Create discount record in database (without survey responses)
    const discountRecord = await db.discount.create({
      data: {
        code: discountCode,
        percentage: discountPercentage,
        clientId: Number(clientId),
        orderId: Number(orderId),
        websiteFeedback: websiteFeedback || null, // Only store the additional feedback text
        used: false,
        expiresAt: expiresAt,
      },
    })

    console.log("💾 Discount record created in database:", discountRecord)

    return NextResponse.json(
      {
        success: true,
        code: discountCode,
        percentage: discountPercentage,
        expiresAt: expiresAt.toISOString(),
        details: {
          yesAnswers: yesCount,
          totalQuestions: totalQuestions,
          surveyResponsesStored: !!surveyFeedbackRecord,
          surveyFeedbackId: surveyFeedbackRecord?.id,
          websiteFeedbackStored: !!websiteFeedbackRecord,
          websiteFeedbackId: websiteFeedbackRecord?.id,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("💥 Error creating discount:", error)
    return NextResponse.json(
      {
        error: "Failed to create discount",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
