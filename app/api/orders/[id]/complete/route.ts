import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id

  try {
    // Get the request body
    const body = await request.json()
    const { actualRank, completedAt } = body

    console.log(`🏆 Completing order ${orderId} with rank:`, actualRank)

    // Make sure we have the API URL
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error("NEXT_PUBLIC_API_URL is not defined")
      return NextResponse.json({ error: "API URL is not configured" }, { status: 500 })
    }

    // Log the request we're about to make
    console.log(`Making request to: ${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}`)
    console.log(
      "Request body:",
      JSON.stringify({
        status: "COMPLETED",
        actualRank,
        completedAt,
      }),
    )

    // Call your API to update the order status
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        status: "COMPLETED",
        actualRank,
        completedAt,
      }),
    })

    // Log the response status
    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      // Try to get the error response as text first
      const errorText = await response.text()
      console.error("Error response text:", errorText)

      // Try to parse it as JSON if possible
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        // If it's not valid JSON, use the text as is
        errorData = { message: errorText }
      }

      console.error("Error completing order:", errorData)
      return NextResponse.json(
        {
          error: "Failed to complete order",
          details: errorData,
          status: response.status,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Success response:", data)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order completed successfully",
      data,
    })
  } catch (error) {
    console.error("Error in complete order API:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
