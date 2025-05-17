// app/api/user/orders/booster/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  // 1) Auth + role check
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "BOOSTER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const boosterId = parseInt(session.user.id as string, 10)

  // 2) Optional status filter (e.g. ?status=IN_PROGRESS)
  const url = new URL(req.url)
  const statusFilter = url.searchParams.get("status")

  // 3) Fetch
  const raw = await db.order.findMany({
    where: {
      boosterId,
      ...(statusFilter ? { status: statusFilter as any } : {}),
    },
    include: { game: true, client: true, booster: true },
    orderBy: { createdAt: "desc" },
  })

  // 4) Map
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
    booster: { username: o.booster.username, email: o.booster.email },
  }))

  return NextResponse.json({ orders })
}
