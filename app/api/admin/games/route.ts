import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameTypes } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Build filter conditions
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    // Get games with pagination
    const [games, totalCount] = await Promise.all([
      db.game.findMany({
        where,
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      db.game.count({ where }),
    ])

    // Process games to include parsed gameTypes
    const processedGames = games.map((game) => {
      const gameTypes = parseGameTypes(game.gameTypes, [])
      return {
        ...game,
        gameTypes,
        _count: {
          ...game._count,
          gameTypes: Array.isArray(gameTypes) ? gameTypes.length : 0,
        },
      }
    })

    return NextResponse.json({
      games: processedGames,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, imageUrl, attributes, gameTypes } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if game with same name or slug already exists
    const existingGame = await db.game.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    })

    if (existingGame) {
      return NextResponse.json({ error: "Game with this name or slug already exists" }, { status: 409 })
    }

    // Create new game
    const newGame = await db.game.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        attributes, // Now directly accepts the attributes object
        gameTypes: gameTypes || [], // Initialize with empty array if not provided
      },
    })

    return NextResponse.json(newGame, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}
