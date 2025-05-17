import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ApiResponse, Game, UpdateGameRequest } from "@/lib/types"
import { generateSlug } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } },
): Promise<NextResponse<ApiResponse<Game>>> {
  try {
    const gameId = Number.parseInt(params.gameId)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        orders: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json({ data: game })
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { gameId: string } },
): Promise<NextResponse<ApiResponse<Game>>> {
  try {
    const gameId = Number.parseInt(params.gameId)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const body: UpdateGameRequest = await request.json()

    // Check if game exists
    const existingGame = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (body.name) updateData.name = body.name
    if (body.slug) updateData.slug = body.slug
    else if (body.name) updateData.slug = generateSlug(body.name)
    if (body.description !== undefined) updateData.description = body.description
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.attributes !== undefined) updateData.attributes = body.attributes
    if (body.gameTypes !== undefined) updateData.gameTypes = body.gameTypes

    // Update game
    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: updateData,
    })

    return NextResponse.json({ data: updatedGame, message: "Game updated successfully" })
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { gameId: string } },
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const gameId = Number.parseInt(params.gameId)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    // Check if game exists
    const existingGame = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Delete game
    await db.game.delete({
      where: { id: gameId },
    })

    return NextResponse.json({ message: "Game deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 })
  }
}
