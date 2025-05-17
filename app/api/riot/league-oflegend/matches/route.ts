import { type NextRequest, NextResponse } from "next/server"
import {
  GAME_ENDPOINTS,
  getRegionInfo,
  processLoLMatch,
  processValorantMatch,
  processTFTMatch,
} from "@/lib/riot-api-utils"

// Simple rate limiting helper
const rateLimiter = {
  requests: {} as Record<string, number[]>,
  isRateLimited: function (endpoint: string): boolean {
    const now = Date.now()
    const windowMs = 10000 // 10 second window
    const maxRequests = 20 // Max 20 requests per window

    // Initialize or clean up old requests
    this.requests[endpoint] = (this.requests[endpoint] || []).filter((timestamp) => now - timestamp < windowMs)

    // Check if we've hit the limit
    if (this.requests[endpoint].length >= maxRequests) {
      return true
    }

    // Add this request
    this.requests[endpoint].push(now)
    return false
  },
}

// Mock data for development without API key
const MOCK_MATCH_DATA = {
  lol: [
    {
      matchId: "EUW1_6789012",
      champion: "Tristana",
      result: "Win",
      date: "2024-07-18 22:49",
      kda: "9/7/5",
      score: 215,
      spells: ["flash", "ignite"],
      championImageUrl: "/placeholder.svg?width=32&height=32",
    },
    {
      matchId: "EUW1_6789011",
      champion: "Jinx",
      result: "Loss",
      date: "2024-07-18 22:25",
      kda: "8/2/5",
      score: 139,
      spells: ["flash", "heal"],
      championImageUrl: "/placeholder.svg?width=32&height=32",
    },
  ],
  valorant: [
    {
      matchId: "VAL_123456",
      champion: "Jett",
      result: "Win",
      date: "2024-07-18 21:30",
      kda: "24/12/8",
      score: 315,
      spells: ["dash", "updraft"],
      championImageUrl: "/placeholder.svg?width=32&height=32",
    },
  ],
  tft: [
    {
      matchId: "TFT_789012",
      champion: "Set 9",
      result: "Win",
      date: "2024-07-18 20:15",
      kda: "N/A",
      score: 100,
      spells: [],
      championImageUrl: "/placeholder.svg?width=32&height=32",
    },
  ],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameName = searchParams.get("gameName")
  const tagLine = searchParams.get("tagLine")
  const region = searchParams.get("region") || "Europe West"
  const game = searchParams.get("game") || "lol" // Default to League of Legends
  const count = Number.parseInt(searchParams.get("count") || "5") // Number of matches to fetch

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Game name and tag line are required" }, { status: 400 })
  }

  try {
    // For development without API access, return mock data
    if (!process.env.RIOT_API_KEY) {
      // Return mock match list
      return NextResponse.json({
        matches: MOCK_MATCH_DATA[game as keyof typeof MOCK_MATCH_DATA] || [],
      })
    }

    // Get the region code and continental routing
    const { regionCode, continentalRoute } = getRegionInfo(region)

    // Step 1: Get account info to retrieve puuid
    const encodedGameName = encodeURIComponent(gameName)
    const encodedTagLine = encodeURIComponent(tagLine)

    const accountResponse = await fetch(
      `https://${continentalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      },
    )

    if (!accountResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch account data", status: accountResponse.status },
        { status: accountResponse.status },
      )
    }

    const accountData = await accountResponse.json()
    const puuid = accountData.puuid

    // Get the appropriate endpoints for the selected game
    const endpoints = GAME_ENDPOINTS[game as keyof typeof GAME_ENDPOINTS]
    if (!endpoints) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 })
    }

    // Check rate limiting
    const endpointKey = `${game}-list`
    if (rateLimiter.isRateLimited(endpointKey)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    // Fetch match list
    const matchListResponse = await fetch(`${endpoints.matchList(continentalRoute, puuid)}?count=${count}`, {
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY || "",
      },
    })

    if (!matchListResponse.ok) {
      const status = matchListResponse.status
      let errorMessage = "Failed to fetch match list"

      if (status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later."
      } else if (status === 403) {
        errorMessage = "API key unauthorized or expired"
      }

      return NextResponse.json({ error: errorMessage, status: status }, { status: status === 429 ? 429 : 500 })
    }

    const matchList = await matchListResponse.json()

    // For LoL and TFT, the response is an array of match IDs
    // For Valorant, the response is an object with a matches array
    const matchIds = game === "valorant" ? matchList.matches.map((match: any) => match.matchId) : matchList

    // Fetch details for each match (limited to first 5 for performance)
    const matchDetailsPromises = matchIds.slice(0, count).map(async (matchId: string) => {
      const matchResponse = await fetch(endpoints.matchDetails(continentalRoute, matchId), {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      })

      if (!matchResponse.ok) {
        console.error(`Failed to fetch details for match ${matchId}`)
        return null
      }

      return await matchResponse.json()
    })

    const matchDetails = await Promise.all(matchDetailsPromises)
    const validMatches = matchDetails.filter((match) => match !== null)

    // Process the match data into a consistent format
    const processedMatches = validMatches.map((match) => {
      // Process based on game type
      if (game === "lol") {
        return processLoLMatch(match, puuid)
      } else if (game === "valorant") {
        return processValorantMatch(match, puuid)
      } else if (game === "tft") {
        return processTFTMatch(match, puuid)
      }
      return match
    })

    return NextResponse.json({ matches: processedMatches })
  } catch (error) {
    console.error("Error fetching match data:", error)
    return NextResponse.json({ error: "Failed to fetch match data" }, { status: 500 })
  }
}
