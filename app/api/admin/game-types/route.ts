import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameTypes } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gameId = Number.parseInt(params.id)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { id: gameId },
      select: {
        gameTypes: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const gameTypes = parseGameTypes(game.gameTypes, [])

    return NextResponse.json({ gameTypes })
  } catch (error) {
    console.error("Error fetching game types:", error)
    return NextResponse.json({ error: "Failed to fetch game types" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gameId = Number.parseInt(params.id)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, slug, description, options } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Get the game
    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Parse existing game types
    const gameTypes = parseGameTypes(game.gameTypes, [])

    // Check if game type with same slug already exists
    const existingGameType = gameTypes.find((gt: any) => gt.slug === slug)
    if (existingGameType) {
      return NextResponse.json({ error: "Game type with this slug already exists for this game" }, { status: 409 })
    }

    // Create new game type with UUID
    const newGameType = {
      id: uuidv4(),
      name,
      slug,
      description: description || null,
      options: options || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to game types array
    gameTypes.push(newGameType)

    // Update the game
    await db.game.update({
      where: { id: gameId },
      data: {
        gameTypes,
      },
    })

    return NextResponse.json(newGameType, { status: 201 })
  } catch (error) {
    console.error("Error creating game type:", error)
    return NextResponse.json({ error: "Failed to create game type" }, { status: 500 })
  }
}
