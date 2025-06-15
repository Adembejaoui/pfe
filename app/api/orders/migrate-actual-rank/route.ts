import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// This endpoint is for migrating existing orders to include actualRank
// It should be run once to update all existing orders

export async function POST(req: Request) {
  try {
    // 1. Auth - only admins can run this
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    // 2. Get all orders without actualRank
    const orders = await db.order.findMany()

    // 3. Track results
    const results = {
      total: orders.length,
      updated: 0,
      skipped: 0,
      errors: 0,
    }

    // 4. Process each order
    for (const order of orders) {
      try {
        // Parse attributes
        const attributes = order.attributes
          ? typeof order.attributes === "string"
            ? JSON.parse(order.attributes as string)
            : order.attributes
          : {}

        // Skip if actualRank already exists
        if (attributes.actualRank) {
          results.skipped++
          continue
        }

        // If currentRank exists, add actualRank
        if (attributes.currentRank) {
          attributes.actualRank = {
            ...attributes.currentRank,
            lastUpdated: new Date().toISOString(),
          }

          // Update the order
          await db.order.update({
            where: { id: order.id },
            data: {
              attributes: attributes,
            },
          })

          results.updated++
        } else {
          // No currentRank to copy from
          results.skipped++
        }
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      message: "Migration completed",
      results,
    })
  } catch (error) {
    console.error("POST /api/orders/migrate-actual-rank error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
