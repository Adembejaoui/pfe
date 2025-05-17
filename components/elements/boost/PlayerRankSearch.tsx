"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface PlayerRankSearchProps {
  onRankFound: (data: any) => void
  server: string
  gameType: string
  onSearchComplete: () => void
}

export default function PlayerRankSearch({ onRankFound, server, gameType, onSearchComplete }: PlayerRankSearchProps) {
  const [gameName, setGameName] = useState("")
  const [tagLine, setTagLine] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!gameName.trim()) {
      setError("Please enter a username")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Map the component gameType to the API's game parameter
      const gameParam =
        gameType === "league-of-legends"
          ? "lol"
          : gameType === "valorant"
            ? "valorant"
            : gameType === "teamfight-tactics"
              ? "tft"
              : gameType

      // Use a unified API endpoint that matches the route handler
      const response = await fetch(
        `/api/riot/league-oflegend/player-data?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(server)}&game=${encodeURIComponent(gameParam)}`,
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Invalid response from server" }))
        throw new Error(errorData.error || `Error ${response.status}: Failed to fetch player data`)
      }

      const data = await response.json()
      console.log("API response:", data)

      // Transform the data based on game type
      let transformedData
      if (gameType === "valorant") {
        transformedData = {
          username: data.account?.gameName || gameName,
          tagLine: data.account?.tagLine || tagLine,
          server: server,
          tier: data.rankData?.tier || "Unranked",
          rr: data.rankData?.ranking_in_tier || 0,
          accountLevel: data.account?.accountLevel,
          card: data.account?.card?.small,
        }
      } else if (gameType === "league-of-legends") {
        // For League of Legends, map the API tier to our tier system
        const apiTier = data.soloQueue?.tier || "UNRANKED"
        const apiRank = data.soloQueue?.rank || ""
        const apiLp = data.soloQueue?.leaguePoints || 0

        // Convert API tier (e.g., "GOLD") to our tier ID (e.g., "gold")
        const tierId = apiTier.toLowerCase()

        transformedData = {
          username: data.account?.gameName || gameName,
          tagLine: data.account?.tagLine || tagLine,
          server: server,
          tier: tierId,
          division: apiRank,
          lp: apiLp,
          wins: data.soloQueue?.wins || 0,
          losses: data.soloQueue?.losses || 0,
          soloQueue: {
            tier: tierId,
            division: apiRank,
            lp: apiLp,
          },
        }
      } else if (gameType === "teamfight-tactics") {
        const apiTier = data.soloQueue?.tier || "UNRANKED"
        const apiRank = data.soloQueue?.rank || ""
        const apiLp = data.soloQueue?.leaguePoints || 0

        transformedData = {
          username: data.account?.gameName || gameName,
          tagLine: data.account?.tagLine || tagLine,
          server: server,
          tier: apiTier.toLowerCase(),
          division: apiRank,
          lp: apiLp,
          wins: data.soloQueue?.wins || 0,
          losses: data.soloQueue?.losses || 0,
        }
      } else {
        // Generic transformation for other games
        transformedData = {
          username: data.account?.gameName || gameName,
          tagLine: data.account?.tagLine || tagLine,
          server: server,
          tier: (data.soloQueue?.tier || "unknown").toLowerCase(),
          division: data.soloQueue?.rank,
          game: data.game,
        }
      }

      onRankFound(transformedData)
      onSearchComplete() // Hide the search component
    } catch (err) {
      console.error("Error fetching player data:", err)
      setError(err instanceof Error ? err.message : "Failed to find player. Please check the username and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Get placeholder text based on game type and region
  const getTagLinePlaceholder = () => {
    // Check if the server is a short code that matches a region
    const lowerServer = server.toLowerCase()
    if (["euw", "eune", "na", "br", "lan", "las", "oce", "ru", "tr", "jp", "kr"].includes(lowerServer)) {
      return lowerServer.toUpperCase()
    }

    switch (gameType) {
      case "valorant":
        return "EUW"
      case "league-of-legends":
        return "EUW"
      case "teamfight-tactics":
        return "EUW"
      default:
        return "Tag Line"
    }
  }

  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Find Your Account</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gameName" className="text-sm font-medium block mb-1">
              Game Name
            </label>
            <Input
              id="gameName"
              type="text"
              placeholder="Enter your in-game name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="bg-[#0f0f1a] border-[#333355] text-white"
            />
          </div>
          <div>
            <label htmlFor="tagLine" className="text-sm font-medium block mb-1">
              {gameType === "valorant" ? "Tag Line (e.g. #EUW)" : "Tag Line"}
            </label>
            <Input
              id="tagLine"
              type="text"
              placeholder={getTagLinePlaceholder()}
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              className="bg-[#0f0f1a] border-[#333355] text-white"
            />
          </div>
        </div>

        <Button onClick={handleSearch} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find Account
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-800">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Enter your in-game username {gameType === "valorant" ? "and tag" : "and region"} to find your current rank
      </p>
    </div>
  )
}
