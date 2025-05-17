import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly"
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    let revenueData = []

    if (period === "daily") {
      // Get daily revenue for the current month
      const month = Number.parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

      // Create date range for the month
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0) // Last day of the month

      // Get all orders in the date range
      const orders = await db.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
          price: true,
        },
      })

      // Create a map for daily revenue
      const dailyRevenue = new Map()
      const daysInMonth = endDate.getDate()

      // Initialize all days with zero
      for (let day = 1; day <= daysInMonth; day++) {
        dailyRevenue.set(day, 0)
      }

      // Sum up revenue by day
      for (const order of orders) {
        const day = order.createdAt.getDate()
        const currentAmount = dailyRevenue.get(day) || 0
        dailyRevenue.set(day, currentAmount + Number(order.price || 0))
      }

      // Convert to array format
      revenueData = Array.from(dailyRevenue.entries()).map(([day, amount]) => ({
        period: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
        amount,
      }))
    } else if (period === "monthly") {
      // Get monthly revenue for the selected year
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59)

      // Create a map for monthly revenue
      const monthlyRevenue = new Map()

      // Initialize all months with zero
      for (let month = 1; month <= 12; month++) {
        monthlyRevenue.set(month, 0)
      }

      // Get all orders in the date range
      const orders = await db.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
          price: true,
        },
      })

      // Sum up revenue by month
      for (const order of orders) {
        const month = order.createdAt.getMonth() + 1
        const currentAmount = monthlyRevenue.get(month) || 0
        monthlyRevenue.set(month, currentAmount + Number(order.price || 0))
      }

      // Convert to array format
      revenueData = Array.from(monthlyRevenue.entries()).map(([month, amount]) => ({
        period: `${year}-${month.toString().padStart(2, "0")}`,
        amount,
      }))
    } else if (period === "yearly") {
      // Get yearly revenue for the last 5 years
      const currentYear = new Date().getFullYear()
      const startYear = currentYear - 4
      const startDate = new Date(startYear, 0, 1)

      // Create a map for yearly revenue
      const yearlyRevenue = new Map()

      // Initialize all years with zero
      for (let year = startYear; year <= currentYear; year++) {
        yearlyRevenue.set(year, 0)
      }

      // Get all orders in the date range
      const orders = await db.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
          price: true,
        },
      })

      // Sum up revenue by year
      for (const order of orders) {
        const year = order.createdAt.getFullYear()
        if (year >= startYear) {
          const currentAmount = yearlyRevenue.get(year) || 0
          yearlyRevenue.set(year, currentAmount + Number(order.price || 0))
        }
      }

      // Convert to array format
      revenueData = Array.from(yearlyRevenue.entries()).map(([year, amount]) => ({
        period: year.toString(),
        amount,
      }))
    }

    return NextResponse.json({
      period,
      data: revenueData,
    })
  } catch (error) {
    console.error("Error fetching revenue statistics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch revenue statistics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
