"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import Image from "next/image"

interface MatchDetailsProps {
  match: {
    matchId: string
    champion: string
    result: string
    date: string
    kda: string
    score: number
    spells: string[]
    championImageUrl?: string
    gameType?: string
    gameMode?: string
    gameDuration?: number
  }
}

export function MatchDetails({ match }: MatchDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchMatchDetails = async () => {
    if (matchDetails) return // Already loaded

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/riot/matches?matchId=${match.matchId}&game=${match.gameType || "lol"}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch match details: ${response.statusText}`)
      }

      const data = await response.json()
      setMatchDetails(data)
    } catch (err) {
      console.error("Error fetching match details:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch match details")
    } finally {
      setIsLoading(false)
    }
  }

  const getGameModeLabel = (gameMode: string, gameType = "lol") => {
    if (gameType === "lol") {
      switch (gameMode) {
        case "CLASSIC":
          return "Summoner's Rift"
        case "ARAM":
          return "ARAM"
        case "URF":
          return "URF"
        case "NEXUSBLITZ":
          return "Nexus Blitz"
        default:
          return gameMode
      }
    } else if (gameType === "valorant") {
      switch (gameMode) {
        case "competitive":
          return "Competitive"
        case "unrated":
          return "Unrated"
        case "spikerush":
          return "Spike Rush"
        case "deathmatch":
          return "Deathmatch"
        default:
          return gameMode
      }
    } else if (gameType === "tft") {
      switch (gameMode) {
        case "1090":
          return "Normal"
        case "1100":
          return "Ranked"
        case "1130":
          return "Hyper Roll"
        case "1160":
          return "Double Up"
        default:
          return `Queue ${gameMode}`
      }
    }
    return gameMode
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0" onClick={fetchMatchDetails}>
          <Info className="h-4 w-4" />
          <span className="sr-only">View match details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#0a0c14] border-[#1f2330]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1f2330] rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src={match.championImageUrl || "/placeholder.svg?width=32&height=32"}
                alt={match.champion}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span>
              {match.champion} - {match.result}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Date</p>
            <p className="text-sm">{match.date}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Duration</p>
            <p className="text-sm">{match.gameDuration || "Unknown"} minutes</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Game Mode</p>
            <p className="text-sm">{getGameModeLabel(match.gameMode || "", match.gameType)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">KDA</p>
            <p className="text-sm">{match.kda}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-4 text-center">Loading match details...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : matchDetails ? (
          <div className="border-t border-[#1f2330] pt-4">
            <h3 className="text-sm font-medium mb-2">Match Details</h3>
            {/* Display game-specific details here */}
            {match.gameType === "lol" && (
              <div className="text-xs space-y-2">
                <p>Match ID: {match.matchId}</p>
                <p>Game Version: {matchDetails.info?.gameVersion || "Unknown"}</p>
                {/* Add more details as needed */}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
