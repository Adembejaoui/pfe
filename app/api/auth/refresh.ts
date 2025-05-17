import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "No valid session found." }, { status: 401 })
    }

    // Return the current session
    return NextResponse.json({ session }, { status: 200 })
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json({ message: "Error refreshing session" }, { status: 500 })
  }
}

