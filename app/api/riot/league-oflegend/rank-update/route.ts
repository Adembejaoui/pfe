import { type NextRequest, NextResponse } from "next/server"
import { getRegionInfo } from "@/lib/riot-api-utils"
import { db } from "@/lib/db"

// Debug flag - set to true to enable detailed logging
const DEBUG = true

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[DEBUG] [Riot Rank API]", ...args)
  }
}

// Cache implementation to reduce API calls
const cache = {
  data: {} as Record<string, { timestamp: number; data: any }>,
  get: function (key: string) {
    const item = this.data[key]
    if (!item) return null

    // Cache for 2 minutes
    if (Date.now() - item.timestamp > 2 * 60 * 1000) {
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
  const region = searchParams.get("region") || "euw"
  const orderId = searchParams.get("orderId")

  debugLog("Request received", { gameName, tagLine, region, orderId })

  if (!gameName || !tagLine) {
    debugLog("Missing required parameters")
    return NextResponse.json({ error: "Game name and tag line are required" }, { status: 400 })
  }

  // Check cache
  const cacheKey = `rank-update-${gameName}-${tagLine}-${region}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    debugLog("Returning cached rank data")
    return NextResponse.json(cachedData)
  }

  try {
    // For development without API access, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.RIOT_API_KEY) {
      debugLog("Using mock data (development mode)")
      const mockData = {
        account: {
          gameName: gameName,
          tagLine: tagLine,
        },
        rank: {
          tier: "gold",
          division: "IV",
          lp: 25,
          wins: 120,
          losses: 100,
        },
        lastUpdated: new Date().toISOString(),
      }

      // If we have an order ID, update the order with mock data
      if (orderId) {
        await updateOrderWithRankData(Number(orderId), mockData.rank)
      }

      return NextResponse.json(mockData)
    }

    // Get the region code and continental routing
    const { regionCode, continentalRoute } = getRegionInfo(region)
    debugLog("Region info", { regionCode, continentalRoute })

    // Step 1: Get account info to retrieve puuid
    const encodedGameName = encodeURIComponent(gameName)
    const encodedTagLine = encodeURIComponent(tagLine)

    debugLog("Fetching account data from Riot API")
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
      debugLog("Account API error", { status: accountResponse.status, details: errorData })
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
    debugLog("Account data received", { puuid })

    // Step 2: Get rank information
    debugLog("Fetching rank data from Riot API")
    const rankResponse = await fetch(
      `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      },
    )

    if (!rankResponse.ok) {
      debugLog("Rank API error", { status: rankResponse.status })
      return NextResponse.json(
        { error: "Failed to fetch rank data", status: rankResponse.status },
        { status: rankResponse.status },
      )
    }

    const rankData = await rankResponse.json()
    debugLog("Rank data received", rankData)

    // Find solo queue rank data
    const soloQueueData = rankData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") || null
    debugLog("Solo queue data", soloQueueData)

    // Format the rank data
    const formattedRankData = {
      tier: soloQueueData?.tier?.toLowerCase() || "unranked",
      division: soloQueueData?.rank || null,
      lp: soloQueueData?.leaguePoints || 0,
      wins: soloQueueData?.wins || 0,
      losses: soloQueueData?.losses || 0,
    }

    // Step 3: Update the order with the latest rank data
    if (orderId) {
      await updateOrderWithRankData(Number(orderId), formattedRankData)
    }

    // Store in cache
    const responseData = {
      account: {
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
      },
      rank: formattedRankData,
      lastUpdated: new Date().toISOString(),
    }
    cache.set(cacheKey, responseData)

    // Return the rank data
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching rank data:", error)
    debugLog("Error fetching rank data", error)
    return NextResponse.json({ error: "Failed to fetch rank data" }, { status: 500 })
  }
}

// Helper function to update order with rank data
async function updateOrderWithRankData(orderId: number, rankData: any) {
  if (isNaN(orderId)) {
    debugLog("Invalid order ID", orderId)
    return
  }

  try {
    debugLog("Updating order with rank data", { orderId, rankData })
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (order) {
      // Parse existing attributes
      const attributes = order.attributes
        ? typeof order.attributes === "string"
          ? JSON.parse(order.attributes as string)
          : order.attributes
        : {}

      // Update the actualRank in attributes (new field to track current rank)
      const updatedAttributes = {
        ...attributes,
        actualRank: rankData,
        lastRankUpdate: new Date().toISOString(),
      }

      // Save the updated attributes back to the order
      await db.order.update({
        where: { id: orderId },
        data: {
          attributes: updatedAttributes,
        },
      })
      debugLog("Order updated successfully")
    } else {
      debugLog("Order not found", orderId)
    }
  } catch (dbError) {
    console.error("Error updating order with rank data:", dbError)
    debugLog("Error updating order", dbError)
  }
}
