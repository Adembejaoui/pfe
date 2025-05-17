import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameName = searchParams.get("gameName")
  const tagLine = searchParams.get("tagLine")

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Game name and tag line are required" }, { status: 400 })
  }

  try {
    const encodedGameName = encodeURIComponent(gameName)
    const encodedTagLine = encodeURIComponent(tagLine)

    // Use an external Valorant account API such as henrikdev's.
    // For development without API access, return mock data
    if (!process.env.VALORANT_API_KEY) {
      return NextResponse.json({
        data: {
          name: gameName,
          tag: tagLine,
          account_level: 150,
          card: {
            small: "/placeholder.svg?height=80&width=80",
          },
          current_data: {
            currenttierpatched: "Platinum 2",
            ranking_in_tier: 65,
          },
        },
      })
    }

    const accountResponse = await fetch(
      `https://api.henrikdev.xyz/valorant/v1/account/${encodedGameName}/${encodedTagLine}`,
    )

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: "Failed to fetch Valorant account data",
          details: errorData,
        },
        { status: accountResponse.status },
      )
    }

    const accountData = await accountResponse.json()

    // Now fetch the MMR data to get rank information
    const mmrResponse = await fetch(`https://api.henrikdev.xyz/valorant/v1/mmr/eu/${encodedGameName}/${encodedTagLine}`)

    let mmrData = null

    if (mmrResponse.ok) {
      mmrData = await mmrResponse.json()
    }

    // Combine the data
    return NextResponse.json({
      data: {
        ...accountData.data,
        current_data: mmrData?.data?.current_data || null,
      },
    })
  } catch (error) {
    console.error("Error fetching Valorant account data:", error)
    return NextResponse.json({ error: "Failed to fetch Valorant account data" }, { status: 500 })
  }
}
