import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build where clause
    const where = role ? { role: role as any } : {};

    // Get users with pagination
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const total = await db.user.count({ where });

    return NextResponse.json(
      {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}