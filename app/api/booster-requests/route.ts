import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Ensure user is a client
    const user = await db.user.findUnique({
      where: { id: Number.parseInt(session.user.id) },
    })

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can request to become boosters" }, { status: 403 })
    }

    // Check if user already has a pending request
    const existingRequest = await db.boosterRequest.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    })

    if (existingRequest) {
      return NextResponse.json({ message: "You already have a pending request" }, { status: 400 })
    }

    // Parse request body
    const {
      bio,
      skills,
      experience,
      languages,
      availability,
      availableHours,
      preferredGames,
      achievements,
      socialLinks,
      hourlyRate,
      boostingStyle,
      communicationPreference,
    } = await request.json()

    // Validate required fields
    if (!bio || !skills || !experience || !availability || !preferredGames || preferredGames.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create booster request with all attributes
    const boosterRequest = await db.boosterRequest.create({
      data: {
        userId: user.id,
        bio,
        skills,
        experience,
        attributes: {
          languages: languages || [],
          availability,
          availableHours: availableHours || "",
          preferredGames: preferredGames || [],
          achievements: achievements || "",
          socialLinks: socialLinks || "",
          hourlyRate: hourlyRate || "",
          boostingStyle: boostingStyle || "",
          communicationPreference: communicationPreference || "",
        },
        status: "PENDING",
      },
    })

    return NextResponse.json(
      { message: "Booster request submitted successfully", id: boosterRequest.id },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating booster request:", error)
    return NextResponse.json({ message: "Failed to submit booster request" }, { status: 500 })
  }
}
