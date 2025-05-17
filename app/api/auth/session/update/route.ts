import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// This endpoint allows updating the current user's session data
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      )
    }

    // Get the user from the database to ensure we have the latest role
    const user = await db.user.findUnique({
      where: { id: Number.parseInt(session.user.id) },
      select: { id: true, email: true, username: true, role: true },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found in database",
        },
        { status: 404 },
      )
    }

    // Return the latest user data for session update
    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update session",
      },
      { status: 500 },
    )
  }
}
