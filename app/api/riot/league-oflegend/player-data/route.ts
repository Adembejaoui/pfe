import { type NextRequest, NextResponse } from "next/server"
import { getRegionInfo } from "@/lib/riot-api-utils"

// Simple in-memory cache
const cache = {
  data: {} as Record<string, { timestamp: number; data: any }>,
  get: function (key: string) {
    const item = this.data[key]
    if (!item) return null

    // Cache for 5 minutes
    if (Date.now() - item.timestamp > 5 * 60 * 1000) {
      delete this.data[key]
      return null
    }

    return item.data
  },
  set: function (key: string, data: any) {
    this.data[key] = {
      timestamp: Date.now(),
      data,
    }
  },
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameName = searchParams.get("gameName")
  const tagLine = searchParams.get("tagLine")
  const region = searchParams.get("region") || "Europe West"
  const game = searchParams.get("game") || "lol" // Default to League of Legends

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Game name and tag line are required" }, { status: 400 })
  }

  // Check cache
  const cacheKey = `player-${game}-${gameName}-${tagLine}-${region}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    console.log("Returning cached player data")
    return NextResponse.json(cachedData)
  }

  try {
    // For development without API access, return mock data
    // Step 1: Get account info to retrieve puuid
    const encodedGameName = encodeURIComponent(gameName)
    const encodedTagLine = encodeURIComponent(tagLine)

    // Get the region code and continental routing
    const { regionCode, continentalRoute } = getRegionInfo(region)

    const accountResponse = await fetch(
      `https://${continentalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      },
    )

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: "Failed to fetch account data",
          status: accountResponse.status,
          details: errorData,
        },
        { status: accountResponse.status },
      )
    }

    const accountData = await accountResponse.json()
    const puuid = accountData.puuid

    // Step 2: Get rank information based on game type
    let rankData = []
    let soloQueueData = null

    if (game === "lol") {
      // For League of Legends, fetch rank data
      const rankResponse = await fetch(
        `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY || "",
          },
        },
      )

      if (rankResponse.ok) {
        rankData = await rankResponse.json()
        // Find solo queue rank data
        soloQueueData = rankData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") || null
      }
    } else if (game === "valorant") {
      // For Valorant, fetch rank data
      // Note: Valorant API structure is different
      const rankResponse = await fetch(
        `https://${regionCode}.api.riotgames.com/val/ranked/v1/leaderboards/by-puuid/${puuid}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY || "",
          },
        },
      )

      if (rankResponse.ok) {
        rankData = await rankResponse.json()
      }
    } else if (game === "tft") {
      // For TFT, fetch rank data
      const rankResponse = await fetch(
        `https://${regionCode}.api.riotgames.com/tft/league/v1/entries/by-puuid/${puuid}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY || "",
          },
        },
      )

      if (rankResponse.ok) {
        rankData = await rankResponse.json()
        // Find ranked TFT data
        soloQueueData = rankData.find((entry: any) => entry.queueType === "RANKED_TFT") || null
      }
    }

    // Store in cache
    const responseData = {
      account: accountData,
      rankData: rankData,
      soloQueue: soloQueueData,
      game: game,
    }
    cache.set(cacheKey, responseData)

    // Return combined data
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching player data:", error)
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 })
  }
}
