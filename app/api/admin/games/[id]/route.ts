import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            gameTypeId: true,
            status: true,
            price: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
            booster: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Parse attributes and gameTypes if they exist
    const attributes = game.attributes ? game.attributes : {}
    const gameTypes = game.gameTypes ? game.gameTypes : []

    return NextResponse.json({
      ...game,
      attributes,
      gameTypes,
    })
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, slug, description, imageUrl, attributes } = body

    // Check if game exists
    const existingGame = await db.game.findUnique({
      where: { id },
    })

    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // If name or slug is being updated, check for conflicts
    if ((name && name !== existingGame.name) || (slug && slug !== existingGame.slug)) {
      const conflictingGame = await db.game.findFirst({
        where: {
          id: { not: id },
          OR: [...(name ? [{ name }] : []), ...(slug ? [{ slug }] : [])],
        },
      })

      if (conflictingGame) {
        return NextResponse.json({ error: "Game with this name or slug already exists" }, { status: 409 })
      }
    }

    // Update game
    const updatedGame = await db.game.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(attributes !== undefined && { attributes }),
      },
    })

    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    // Check if game exists
    const existingGame = await db.game.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if game has related orders
    if (existingGame._count.orders > 0) {
      return NextResponse.json(
        { error: "Cannot delete game with existing orders. Delete orders first." },
        { status: 400 },
      )
    }

    // Delete game
    await db.game.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Game deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 })
  }
}
