"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface PlayerData {
  username?: string
  tagLine?: string
  server?: string
  playerInfo?: {
    username?: string
    tagLine?: string
  }
}

interface MatchHistoryItem {
  champion: string
  result: "Win" | "Loss" | "Remake"
  date: string
  kda: string
  spells: string[]
  championImageUrl?: string
}

interface MatchHistoryProps {
  playerData: PlayerData
  gameType?: string
}

export function MatchHistory({ playerData, gameType = "lol" }: MatchHistoryProps) {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loginSubmitted, setLoginSubmitted] = useState(false)
  const [champions, setChampions] = useState<Record<string, any>>({})

  // Fetch match data based on the game parameter and player data
  useEffect(() => {
    const fetchMatchData = async () => {
      // Check if we have the required player information
      // Handle both direct properties and nested playerInfo structure
      const username = playerData.username || playerData.playerInfo?.username
      const tagLine = playerData.tagLine || playerData.playerInfo?.tagLine
      const server = playerData.server

      if (!username || !tagLine || !server) {
        setError("Missing player information")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      // Debug the playerData
      console.log("Player data received:", JSON.stringify(playerData, null, 2))

      try {
        // Map game type to the API game parameter
        // This mapping should match your API's expected values
        const gameParam =
          gameType.toLowerCase().includes("league") || gameType.toLowerCase().includes("lol")
            ? "lol"
            : gameType.toLowerCase().includes("valorant")
              ? "valorant"
              : gameType.toLowerCase().includes("tft")
                ? "tft"
                : "lol" // Default to lol if unknown

        // Construct the API URL with player data and game parameter
        const apiUrl = `/api/riot/league-oflegend/matches?game=${gameParam}&gameName=${encodeURIComponent(username)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(server)}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch match data: ${response.status}`)
        }

        const data = await response.json()

        // Check if we have matches in the response
        if (data.matches && Array.isArray(data.matches)) {
          // Add champion image URLs to matches
          const matchesWithImages = data.matches.map((match: MatchHistoryItem) => {
            // Try to find the champion in our champions data
            const championData = champions[match.champion]
            return {
              ...match,
              championImageUrl: championData ? championData.imageUrl : undefined,
            }
          })
          setMatches(matchesWithImages)
        } else {
          setMatches([])
        }
      } catch (err) {
        console.error("Error fetching match data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch match data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatchData()
  }, [gameType, playerData, champions])

  // Listen for custom event from login component
  useEffect(() => {
    const handleLoginSubmit = () => {
      setLoginSubmitted(true)
    }

    window.addEventListener("loginSubmitted", handleLoginSubmit)

    return () => {
      window.removeEventListener("loginSubmitted", handleLoginSubmit)
    }
  }, [])

  useEffect(() => {
    const fetchChampionData = async () => {
      try {
        const res = await fetch("https://ddragon.leagueoflegends.com/cdn/15.9.1/data/en_US/champion.json")
        const data = await res.json()

        // Create a lookup object with champion names as keys for easier access
        const championsData: Record<string, any> = {}
        Object.values(data.data).forEach((champion: any) => {
          championsData[champion.name] = {
            id: champion.id,
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/15.9.1/img/champion/${champion.image.full}`,
          }
        })

        setChampions(championsData)
      } catch (err) {
        console.error("Error fetching champion data:", err)
      }
    }

    fetchChampionData()
  }, [])

  // Always show the match history component

  return (
    <section className="bg-white bg-opacity-5 rounded-lg border border-[#1f2330] overflow-hidden">
      <header className="px-4 py-3 border-b border-[#1f2330]">
        <h2 className="text-lg font-semibold">Match History</h2>
      </header>
      <div className="p-4 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : matches.length === 0 ? (
          <div className="text-gray-400 text-center py-4">No match history found for {gameType}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 uppercase text-xs">
              <tr>
                <th></th>
                <th className="text-left p-2">Champion</th>
                <th className="text-center p-2">Date</th>
                <th className="text-center p-2">Result</th>
                <th className="text-center p-2">Spells</th>
                <th className="text-center p-2">KDA</th>
               
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2330]">
              {matches.map((match, index) => (
                <tr key={index} className="text-white">
                  <td className="p-2 text-center">
                    {match.result === "Win" ? "🏆" : match.result === "Loss" ? "❌" : "⟳"}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-[#1f2330] rounded-full flex items-center justify-center overflow-hidden">
                        <Image
                          src={match.championImageUrl || "/placeholder.svg?width=32&height=32"}
                          alt={match.champion}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <span className="text-white">{match.champion}</span>
                    </div>
                  </td>
                  <td className="p-2 text-center text-white text-xs">{match.date}</td>
                  <td
                    className={`p-2 text-center ${
                      match.result === "Win"
                        ? "text-green-500"
                        : match.result === "Loss"
                          ? "text-red-500"
                          : "text-gray-400"
                    }`}
                  >
                    {match.result}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {match.spells.map((spell, i) => (
                        <div key={i} className="w-5 h-5 bg-[#1f2330] rounded-sm"></div>
                      ))}
                    </div>
                  </td>
                  <td className="p-2 text-center text-white">{match.kda}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
