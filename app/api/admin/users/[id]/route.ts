import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ordersAsClient: {
          select: {
            id: true,
            status: true,
            price: true,
            createdAt: true,
            game: { select: { name: true } },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        ordersAsBooster: {
          select: {
            id: true,
            status: true,
            price: true,
            createdAt: true,
            game: { select: { name: true } },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { username, role } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(username !== undefined && { username }),
        ...(role !== undefined && { role }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ordersAsClient: true,
            ordersAsBooster: true,
          },
        },
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has orders
    if (existingUser._count.ordersAsClient > 0 || existingUser._count.ordersAsBooster > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with existing orders. Delete orders first." },
        { status: 400 },
      )
    }

    // Delete user
    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
