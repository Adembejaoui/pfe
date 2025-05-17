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

    // Get the user's most recent booster request
    const recentRequest = await db.boosterRequest.findFirst({
      where: {
        userId: Number.parseInt(session.user.id),
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    if (!recentRequest) {
      return NextResponse.json({
        hasRequest: false,
        message: "No booster request found",
      })
    }

    // Check if the request was recently processed (within the last 7 days)
    const now = new Date()
    const updatedAt = new Date(recentRequest.updatedAt)
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

    // Only consider it "recently processed" if:
    // 1. Status is APPROVED or REJECTED
    // 2. It was updated within the last 7 days
    const recentlyProcessed =
      (recentRequest.status === "APPROVED" || recentRequest.status === "REJECTED") && daysSinceUpdate <= 7

    // Get the current user to check if their role matches the request status
    const user = await db.user.findUnique({
      where: { id: Number.parseInt(session.user.id) },
      select: { role: true },
    })

    // Check if the role needs updating in the session
    const roleNeedsUpdate =
      recentRequest.status === "APPROVED" && user?.role === "BOOSTER" && session.user.role !== "BOOSTER"

    return NextResponse.json({
      hasRequest: true,
      status: recentRequest.status,
      updatedAt: recentRequest.updatedAt,
      recentlyProcessed,
      roleNeedsUpdate,
      currentRole: user?.role,
      sessionRole: session.user.role,
    })
  } catch (error) {
    console.error("Error checking booster request status:", error)
    return NextResponse.json({ message: "Failed to check booster request status" }, { status: 500 })
  }
}
