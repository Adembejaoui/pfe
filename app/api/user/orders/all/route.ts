import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import type { OrderStatus } from "@prisma/client"

export async function GET(req: Request) {
  // 1) Only BOOSTER (we’ll use this for your “available to claim” view)
  const sess = await getServerSession(authOptions)
  if (!sess?.user?.id || sess.user.role !== "BOOSTER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2) Optional `?status=` filter (defaults to all statuses if omitted)
  const url         = new URL(req.url)
  const statusParam = url.searchParams.get("status") as OrderStatus | null

  // 3) Find orders matching that status AND no booster assigned
  const raw = await db.order.findMany({
    where: {
      boosterId: null,
      ...(statusParam ? { status: statusParam } : {}),
    },
    include: { game: true, client: true },
    orderBy: { createdAt: "desc" },
  })

  // 4) Flatten & expose same fields as above
  const orders = raw.map(o => ({
    id:             o.id,
    game:            o.game.name, 
    boostType:      o.gameTypeId,
    server:         o.attributes?.server ?? null,
    price:          o.price,
    status:         o.status,
    createdAt:      o.createdAt,
    client:         { username: o.client.username, email: o.client.email },
  }))

  return NextResponse.json({ orders })
}
