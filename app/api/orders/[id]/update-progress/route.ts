import { type NextRequest, NextResponse } from "next/server"

// Region mapping for different API endpoints
const REGION_ROUTING: Record<string, string> = {
  euw: "euw1",
  eune: "eun1",
  na: "na1",
  kr: "kr",
  br: "br1",
  jp: "jp1",
  ru: "ru",
  tr: "tr1",
  lan: "la1",
  las: "la2",
  oce: "oc1",
}

// Region to continental routing
const CONTINENTAL_ROUTING: Record<string, string> = {
  euw1: "europe",
  eun1: "europe",
  ru: "europe",
  tr1: "europe",
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id

  try {
    // Fetch order data to get player info
    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
    })

    if (!orderResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch order data" }, { status: orderResponse.status })
    }

    const orderData = await orderResponse.json()

    // Extract player info from order data
    const playerInfo = orderData.playerInfo || {}
    const username = playerInfo.username
    const tagLine = playerInfo.tagLine
    const server = playerInfo.server || "euw"

    if (!username || !tagLine) {
      return NextResponse.json({ error: "Player information not found in order" }, { status: 400 })
    }

    // Get the region code
    const regionCode = REGION_ROUTING[server.toLowerCase()] || "euw1"

    // Get the continental routing
    const continentalRoute = CONTINENTAL_ROUTING[regionCode] || "europe"

    // Step 1: Get account info to retrieve puuid
    const accountResponse = await fetch(
      `https://${continentalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(username)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      },
    )

    if (!accountResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch account data from Riot API" },
        { status: accountResponse.status },
      )
    }

    const accountData = await accountResponse.json()
    const puuid = accountData.puuid

    // Step 2: Get rank information using puuid
    const rankResponse = await fetch(
      `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      },
    )

    if (!rankResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch rank data from Riot API" }, { status: rankResponse.status })
    }

    const rankData = await rankResponse.json()

    // Find solo queue rank data
    const soloQueueData = rankData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") || null

    if (!soloQueueData) {
      return NextResponse.json({ error: "No solo queue rank data found" }, { status: 404 })
    }

    // Convert Riot API format to our format
    const actualRank = {
      tier: soloQueueData.tier.toLowerCase(),
      division: soloQueueData.rank,
      lp: soloQueueData.leaguePoints,
      lastUpdated: new Date().toISOString(),
    }

    // Update the order with the new rank data
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        actualRank: actualRank,
      }),
    })

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: "Failed to update order with new rank data" },
        { status: updateResponse.status },
      )
    }

    return NextResponse.json({
      success: true,
      rankData: actualRank,
      lastUpdated: actualRank.lastUpdated,
    })
  } catch (error) {
    console.error("Error updating rank progress:", error)
    return NextResponse.json({ error: "Failed to update rank progress" }, { status: 500 })
  }
}
