import { type NextRequest, NextResponse } from "next/server"

// Region mapping for different API endpoints
const REGION_ROUTING = {
  "Europe West": "euw1",
  "Europe Nordic & East": "eun1",
  "North America": "na1",
  Korea: "kr",
  Brazil: "br1",
  Japan: "jp1",
  Russia: "ru",
  Turkey: "tr1",
  "Latin America North": "la1",
  "Latin America South": "la2",
  Oceania: "oc1",
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameName = searchParams.get("gameName")
  const tagLine = searchParams.get("tagLine")
  const region = searchParams.get("region") || "Europe West"

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Game name and tag line are required" }, { status: 400 })
  }

  try {
    // For development without API access, return mock data
    if (!process.env.RIOT_API_KEY) {
      return NextResponse.json({
        account: {
          puuid: "mock-puuid",
          gameName: gameName,
          tagLine: tagLine,
        },
        rankData: [],
        soloQueue: {
          tier: "GOLD",
          rank: "II",
          leaguePoints: 75,
          wins: 120,
          losses: 100,
        },
      })
    }

    // Step 1: Get account info to retrieve puuid
    const encodedGameName = encodeURIComponent(gameName)
    const encodedTagLine = encodeURIComponent(tagLine)

    // Get the region code
    const regionCode = REGION_ROUTING[region as keyof typeof REGION_ROUTING] || "euw1"

    // Get the continental routing
    const continentalRoute = CONTINENTAL_ROUTING[regionCode] || "europe"

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
      const errorData = await rankResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: "Failed to fetch rank data",
          status: rankResponse.status,
          details: errorData,
        },
        { status: rankResponse.status },
      )
    }

    const rankData = await rankResponse.json()

    // Find solo queue rank data
    const soloQueueData = rankData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") || null

    // Return combined data
    return NextResponse.json({
      account: accountData,
      rankData: rankData,
      soloQueue: soloQueueData,
    })
  } catch (error) {
    console.error("Error fetching player data:", error)
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 })
  }
}
