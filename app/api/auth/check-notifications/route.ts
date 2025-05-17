import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ hasNotifications: false }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Check for unread notifications
    const notifications = await db.userNotification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get booster approval/rejection notifications
    const boosterApproval = notifications.find((n) => n.type === "BOOSTER_APPROVAL")
    const boosterRejection = notifications.find((n) => n.type === "BOOSTER_REJECTION")

    return NextResponse.json({
      hasNotifications: notifications.length > 0,
      notifications,
      boosterStatus: boosterApproval ? "APPROVED" : boosterRejection ? "REJECTED" : null,
    })
  } catch (error) {
    console.error("Error checking notifications:", error)
    return NextResponse.json({ hasNotifications: false, error: "Failed to check notifications" }, { status: 500 })
  }
}
