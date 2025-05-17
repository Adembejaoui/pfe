// app/api/user/orders/[orderId]/assign/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(req: Request, { params }: { params: { orderId: string } }) {
  // 1) Auth + role
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "BOOSTER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const boosterId = parseInt(session.user.id as string, 10)

  // 2) Grab body if you want to override boosterId
  //    but here we just use the logged‑in booster
  const orderId = parseInt(params.orderId, 10)

  // 3) Update
  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      boosterId,
      status: "IN_PROGRESS",
    },
    include: { game: true, client: true, booster: true },
  })

  return NextResponse.json({ order: updated })
}
