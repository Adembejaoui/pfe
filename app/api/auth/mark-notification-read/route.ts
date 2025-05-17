import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const { notificationId, type } = await request.json()

    if (notificationId) {
      // Mark specific notification as read
      await db.userNotification.update({
        where: {
          id: notificationId,
          userId, // Ensure the notification belongs to the user
        },
        data: {
          read: true,
        },
      })
    } else if (type) {
      // Mark all notifications of a specific type as read
      await db.userNotification.updateMany({
        where: {
          userId,
          type,
        },
        data: {
          read: true,
        },
      })
    } else {
      // Mark all user's notifications as read
      await db.userNotification.updateMany({
        where: {
          userId,
        },
        data: {
          read: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ success: false, error: "Failed to mark notification as read" }, { status: 500 })
  }
}
