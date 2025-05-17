import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameTypes } from "@/lib/db"

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

    // Parse game types from JSON
    const gameTypes = parseGameTypes(game.gameTypes, [])

    return NextResponse.json(gameTypes)
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

    // Check if the game exists
    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Parse existing game types
    const existingGameTypes = parseGameTypes(game.gameTypes, [])

    // Check if the name is already taken
    const gameTypeWithSameName = existingGameTypes.find((type) => type.name === name)
    if (gameTypeWithSameName) {
      return NextResponse.json({ error: "Game type name already exists" }, { status: 400 })
    }

    // Check if the slug is already taken
    const gameTypeWithSameSlug = existingGameTypes.find((type) => type.slug === slug)
    if (gameTypeWithSameSlug) {
      return NextResponse.json({ error: "Game type slug already exists" }, { status: 400 })
    }

    // Create a new game type
    const newGameType = {
      id: crypto.randomUUID(),
      name,
      slug,
      description,
      options: options || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the new game type to the existing ones
    const updatedGameTypes = [...existingGameTypes, newGameType]

    // Update the game with the new game types
    await db.game.update({
      where: { id: gameId },
      data: {
        gameTypes: updatedGameTypes,
      },
    })

    return NextResponse.json(newGameType)
  } catch (error) {
    console.error("Error creating game type:", error)
    return NextResponse.json({ error: "Failed to create game type" }, { status: 500 })
  }
}
