import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user has a pending request
    const pendingRequest = await db.boosterRequest.findFirst({
      where: {
        userId: Number.parseInt(session.user.id),
        status: "PENDING",
      },
    })

    return NextResponse.json({
      hasPendingRequest: !!pendingRequest,
      requestId: pendingRequest?.id || null,
    })
  } catch (error) {
    console.error("Error checking booster request:", error)
    return NextResponse.json({ message: "Failed to check booster request status" }, { status: 500 })
  }
}
