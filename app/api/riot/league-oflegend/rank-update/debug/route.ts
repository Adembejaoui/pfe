import { NextResponse } from "next/server"

// Debug endpoint that returns detailed mock data for testing
export async function GET() {
  console.log("[DEBUG] Debug rank update endpoint called")

  // Return mock data with detailed information
  return NextResponse.json({
    debug: true,
    timestamp: new Date().toISOString(),
    account: {
      gameName: "TestPlayer",
      tagLine: "EUW",
      puuid: "test-puuid-12345",
    },
    rank: {
      tier: "platinum",
      division: "II",
      lp: 75,
      wins: 120,
      losses: 100,
      winRate: "54.5%",
    },
    lastUpdated: new Date().toISOString(),
    apiInfo: {
      endpoint: "/api/riot/rank-update/debug",
      method: "GET",
      environment: process.env.NODE_ENV,
    },
  })
}
