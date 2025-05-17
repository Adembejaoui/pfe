import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ApiResponse, Game } from "@/lib/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
): Promise<NextResponse<ApiResponse<Game>>> {
  try {
    const slug = params.slug

    if (!slug) {
      return NextResponse.json({ error: "Game slug is required" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { slug },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json({ data: game })
  } catch (error) {
    console.error("Error fetching game by slug:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}
