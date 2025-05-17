import { type NextRequest, NextResponse } from "next/server"
import { db, parseGameTypes } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string; typeId: string } }) {
  try {
    const gameId = Number.parseInt(params.id)
    const typeId = params.typeId

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const game = await db.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        slug: true,
        gameTypes: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Add null check for gameTypes
    const gameTypes = parseGameTypes(game.gameTypes || [], [])
    const gameType = gameTypes.find((gt: any) => gt.id === typeId)

    if (!gameType) {
      return NextResponse.json({ error: "Game type not found" }, { status: 404 })
    }

    // Count orders for this game type
    const ordersCount = await db.order.count({
      where: {
        gameId,
        gameTypeId: typeId,
      },
    })

    return NextResponse.json({
      ...gameType,
      game: {
        id: game.id,
        name: game.name,
        slug: game.slug,
      },
      _count: {
        orders: ordersCount,
      },
    })
  } catch (error) {
    console.error("Error fetching game type:", error)
    return NextResponse.json({ error: "Failed to fetch game type" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string; typeId: string } }) {
  try {
    const gameId = Number.parseInt(params.id)
    const typeId = params.typeId

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, slug, description, options } = body

    // Get the game
    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Add null check for gameTypes
    const gameTypes = parseGameTypes(game.gameTypes || [], [])
    const gameTypeIndex = gameTypes.findIndex((gt: any) => gt.id === typeId)

    if (gameTypeIndex === -1) {
      return NextResponse.json({ error: "Game type not found" }, { status: 404 })
    }

    // If slug is being updated, check for conflicts
    if (slug && slug !== gameTypes[gameTypeIndex].slug) {
      const conflictingGameType = gameTypes.find(
        (gt: any, index: number) => index !== gameTypeIndex && gt.slug === slug,
      )
      if (conflictingGameType) {
        return NextResponse.json({ error: "Game type with this slug already exists for this game" }, { status: 409 })
      }
    }

    // Update game type
    gameTypes[gameTypeIndex] = {
      ...gameTypes[gameTypeIndex],
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(options !== undefined && { options }),
      updatedAt: new Date().toISOString(),
    }

    // Update the game
    await db.game.update({
      where: { id: gameId },
      data: {
        gameTypes,
      },
    })

    // Count orders for this game type
    const ordersCount = await db.order.count({
      where: {
        gameId,
        gameTypeId: typeId,
      },
    })

    return NextResponse.json({
      ...gameTypes[gameTypeIndex],
      game: {
        id: gameId,
        name: game.name,
        slug: game.slug,
      },
      _count: {
        orders: ordersCount,
      },
    })
  } catch (error) {
    console.error("Error updating game type:", error)
    return NextResponse.json({ error: "Failed to update game type" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; typeId: string } }) {
  try {
    const gameId = Number.parseInt(params.id)
    const typeId = params.typeId

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
    }

    // Get the game
    const game = await db.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Add null check for gameTypes
    const gameTypes = parseGameTypes(game.gameTypes || [], [])
    const gameTypeIndex = gameTypes.findIndex((gt: any) => gt.id === typeId)

    if (gameTypeIndex === -1) {
      return NextResponse.json({ error: "Game type not found" }, { status: 404 })
    }

    // Check if game type has related orders
    const ordersCount = await db.order.count({
      where: {
        gameId,
        gameTypeId: typeId,
      },
    })

    if (ordersCount > 0) {
      return NextResponse.json({ error: "Cannot delete game type with existing orders" }, { status: 400 })
    }

    // Remove game type
    gameTypes.splice(gameTypeIndex, 1)

    // Update the game
    await db.game.update({
      where: { id: gameId },
      data: {
        gameTypes,
      },
    })

    return NextResponse.json({ message: "Game type deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting game type:", error)
    return NextResponse.json({ error: "Failed to delete game type" }, { status: 500 })
  }
}
