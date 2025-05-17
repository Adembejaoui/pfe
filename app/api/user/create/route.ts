import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { getServerSession } from "next-auth/next";

// Schema for creating a user
const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().optional(),
  role: z.enum(["CLIENT", "BOOSTER", "ADMIN"]).default("CLIENT"),
});

// Schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  role: z.enum(["CLIENT", "BOOSTER", "ADMIN"]).optional(),
  search: z.string().optional(),
});
// POST create a new user
export async function POST(req: Request) {
  try {
    // For user creation, we need to check if it's an admin creating a user
    // or if it's a public registration
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Parse and validate the request body
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);
    
    // If not admin, force role to be CLIENT
    if (!isAdmin && validatedData.role !== "CLIENT") {
      validatedData.role = "CLIENT";
    }

    const { email, password, username, role } = validatedData;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}