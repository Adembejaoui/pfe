import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid request ID" }, { status: 400 })
    }

    // Check authentication and admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "You must be logged in to access this resource" }, { status: 401 })
    }

    // Ensure user is an admin
    const admin = await db.user.findUnique({
      where: { id: Number.parseInt(session.user.id) },
    })

    if (!admin) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json({ message: "You must be an admin to access this resource" }, { status: 403 })
    }

    // Get the request body
    const { status } = await request.json()

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ message: "Invalid status value" }, { status: 400 })
    }

    // Find the booster request
    const boosterRequest = await db.boosterRequest.findUnique({
      where: { id },
    })

    if (!boosterRequest) {
      return NextResponse.json({ message: "Booster request not found" }, { status: 404 })
    }

    // Check if request is already processed
    if (boosterRequest.status !== "PENDING") {
      return NextResponse.json({ message: "This request has already been processed" }, { status: 400 })
    }

    // Start a transaction to update request and user role if approved
    const result = await db.$transaction(async (prisma) => {
      // Update the request status
      const updatedRequest = await prisma.boosterRequest.update({
        where: { id },
        data: { status },
      })

      // If approved, update the user role to BOOSTER
      if (status === "APPROVED") {
        await prisma.user.update({
          where: { id: boosterRequest.userId },
          data: { role: "BOOSTER" },
        })
      }

      return updatedRequest
    })

    return NextResponse.json({
      message: `Request ${status.toLowerCase()} successfully`,
      request: result,
    })
  } catch (error) {
    console.error("Error processing booster request:", error)
    return NextResponse.json({ message: "Failed to process booster request" }, { status: 500 })
  }
}
