import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ApiResponse, GameType } from "@/lib/types"
import { parseGameTypes } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } },
): Promise<NextResponse<ApiResponse<GameType[]>>> {
  try {
    const gameId = Number.parseInt(params.gameId)

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const gameTypes = parseGameTypes(game.gameTypes, [])

    return NextResponse.json({ data: gameTypes })
  } catch (error) {
    console.error("Error fetching game types:", error)
    return NextResponse.json({ error: "Failed to fetch game types" }, { status: 500 })
  }
}
