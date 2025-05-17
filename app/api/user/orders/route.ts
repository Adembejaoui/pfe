// app/api/user/orders/client/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  // 1) Auth
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const userId = typeof session.user.id === "string"
    ? parseInt(session.user.id, 10)
    : session.user.id

  // 2) Fetch this client’s orders
  const raw = await db.order.findMany({
    where: { clientId: userId },
    include: { game: true, client: true, booster: true },
    orderBy: { createdAt: "desc" },
  })

  // 3) Map to the shape the front‑end expects
  const orders = raw.map((o) => ({
    id: o.id,
    game: { id: o.game.id, name: o.game.name, slug: o.game.slug },
    boostType: o.gameTypeId,
    currentLevel: o.attributes?.currentRank?.tier ?? null,
    desiredLevel: o.attributes?.desiredRank?.tier ?? null,
    price: o.price,
    status: o.status,
    createdAt: o.createdAt,
    clientId: o.clientId,
    boosterId: o.boosterId,
    client: { username: o.client.username, email: o.client.email },
    booster: o.booster
      ? { username: o.booster.username, email: o.booster.email }
      : null,
  }))

  return NextResponse.json({ orders })
}
