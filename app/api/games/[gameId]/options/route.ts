import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"
import { parseGameAttributes } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } },
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const gameId = Number.parseInt(params.gameId)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        slug: true,
        attributes: true,
        gameTypes: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Parse attributes if they're stored as a string
    const attributes = parseGameAttributes(game.attributes, {})

    // Add supportsRoleChampion flag for specific games
    if (game.slug === "league-of-legends" || game.slug === "valorant") {
      attributes.supportsRoleChampion = true
    }

    // Return the game with parsed attributes
    return NextResponse.json({
      data: {
        ...game,
        attributes,
      },
    })
  } catch (error) {
    console.error("Error fetching game options:", error)
    return NextResponse.json({ error: "Failed to fetch game options" }, { status: 500 })
  }
}
