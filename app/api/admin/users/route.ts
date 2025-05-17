import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Role } from "@prisma/client"
import { hash } from "bcrypt"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role") as Role | null
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {}

    // Only add role filter if it's provided and not "ALL"
    if (role && role !== "ALL") {
      where.role = role
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ]
    }

    try {
      // Check database connection first
      try {
        await db.$queryRaw`SELECT 1`
      } catch (connectionError) {
        console.error("Database connection error:", connectionError)
        return NextResponse.json(
          {
            error: "Database connection error",
            details: "Could not connect to the database. Please try again later.",
          },
          { status: 503 },
        )
      }

      // Get users with pagination
      const [users, totalCount] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                ordersAsClient: true,
                ordersAsBooster: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.user.count({ where }),
      ])

      return NextResponse.json({
        users,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      })
    } catch (dbError) {
      console.error("Database error fetching users:", dbError)
      return NextResponse.json(
        {
          error: "Database error fetching users",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, role } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // In a real app, you would hash the password here
    // For example: const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPassword = await hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: role || "CLIENT",
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
