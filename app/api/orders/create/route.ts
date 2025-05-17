// app/api/orders/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, parseGameAttributes } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // coerce to number
    const clientId =
      typeof session.user.id === "string"
        ? parseInt(session.user.id, 10)
        : session.user.id

    // 2. Payload
    const { gameId, gameTypeId, price, attributes } = await req.json()
    if (
      typeof gameId !== "number" ||
      typeof gameTypeId !== "string" ||
      typeof price !== "number"
    ) {
      return NextResponse.json(
        { error: "gameId (number), gameTypeId (string), and price (number) are required" },
        { status: 400 }
      )
    }

    // 3. Create
    const order = await db.order.create({
      data: {
        gameId,
        gameTypeId,
        price,
        clientId,
        attributes: parseGameAttributes(attributes, {}),
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
