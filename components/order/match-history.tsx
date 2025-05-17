"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Filter, ChevronDown, AlertTriangle } from "lucide-react"
import { MatchDetails } from "./match-details"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface PlayerData {
  username?: string
  tagLine?: string
  server?: string
}

interface MatchHistoryProps {
  playerData?: PlayerData
  gameType?: string
}

export function MatchHistory({ playerData, gameType = "lol" }: MatchHistoryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)

  const fetchMatches = async () => {
    if (!playerData?.username || !playerData?.tagLine) {
      setError("No player data available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const username = playerData.username
      const tagLine = playerData.tagLine
      const region = playerData.server || "euw"

      const response = await fetch(
        `/api/riot/league-oflegend/matches?gameName=${encodeURIComponent(username)}&tagLine=${encodeURIComponent(
          tagLine,
        )}&region=${region}&game=${gameType}&count=20`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`)
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (err) {
      console.error("Error fetching matches:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch match history")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [playerData, gameType])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMatches()
    setRefreshing(false)
  }

  const filteredMatches = matches.filter((match) => {
    if (filter === "all") return true
    if (filter === "wins") return match.result === "Win"
    if (filter === "losses") return match.result === "Loss"
    return true
  })

  const winRate = matches.length
    ? Math.round((matches.filter((match) => match.result === "Win").length / matches.length) * 100)
    : 0

  return (
    <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
      <CardHeader className="px-4 py-3 border-b border-[#2A2F3F] bg-[#1A1E2C] flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Match History</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-[#1E2230] border-[#2A2F3F]">
            Win Rate: {winRate}%
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="h-8 w-8 p-0 bg-[#1E2230] border-[#2A2F3F] hover:bg-[#232838]"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 flex items-center bg-[#1E2230] border-[#2A2F3F] hover:bg-[#232838]"
              >
                <Filter className="h-4 w-4 mr-1" />
                {filter === "all" ? "All" : filter === "wins" ? "Wins" : "Losses"}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1E2C] border-[#2A2F3F]">
              <DropdownMenuItem onClick={() => setFilter("all")}>All Matches</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("wins")}>Wins Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("losses")}>Losses Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading match history...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-red-400">{error}</p>
            {playerData?.username && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-4 bg-[#1E2230] border-[#2A2F3F] hover:bg-[#232838]"
              >
                Try Again
              </Button>
            )}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            {matches.length > 0 ? "No matches match the current filter" : "No match history available"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMatches.map((match, index) => (
              <div
                key={match.matchId || index}
                className={`p-3 rounded-lg border ${
                  match.result === "Win" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-[#1E2230] flex items-center justify-center overflow-hidden">
                      <img
                        src={match.championImageUrl || "/placeholder.svg?width=40&height=40"}
                        alt={match.champion || "Champion"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{match.champion || "Unknown"}</div>
                      <div className="text-xs text-gray-400">{match.kda || "0/0/0"}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge
                      variant="outline"
                      className={`${
                        match.result === "Win"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {match.result}
                    </Badge>
                    <MatchDetails match={match} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
