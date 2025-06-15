import { NextResponse } from "next/server"

// Test endpoint that returns mock data for testing the rank update functionality
export async function GET() {
  // Return mock data
  return NextResponse.json({
    account: {
      gameName: "TestPlayer",
      tagLine: "EUW",
    },
    rank: {
      tier: "platinum",
      division: "II",
      lp: 75,
      wins: 120,
      losses: 100,
    },
    lastUpdated: new Date().toISOString(),
  })
}
