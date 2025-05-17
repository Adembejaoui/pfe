import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ApiResponse, CreateGameRequest, Game } from "@/lib/types"
import { generateSlug } from "@/lib/utils"

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Game[]>>> {
  try {
    const games = await db.game.findMany({
      include: {
        orders: true,
      },
    })

    return NextResponse.json({ data: games })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Game>>> {
  try {
    const body: CreateGameRequest = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Game name is required" }, { status: 400 })
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.name)

    // Check if game with name or slug already exists
    const existingGame = await db.game.findFirst({
      where: {
        OR: [{ name: body.name }, { slug }],
      },
    })

    if (existingGame) {
      return NextResponse.json({ error: "Game with this name or slug already exists" }, { status: 409 })
    }

    // Create game
    const game = await db.game.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        imageUrl: body.imageUrl,
        attributes: body.attributes || {},
        gameTypes: body.gameTypes || [],
      },
    })

    return NextResponse.json({ data: game, message: "Game created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}
