"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getRankColor } from "@/lib/format-utils"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface RankInfo {
  tier: string
  division?: string
  lp?: number
}

interface PlayerData {
  username?: string
  tagLine?: string
  server?: string
}

interface OrderProgressProps {
  currentRank: RankInfo
  desiredRank: RankInfo
  orderId: number
  abandonActionUrl: string
  serviceType?: string
  wins?: number
  placements?: number
  playerData?: PlayerData
}

export function OrderProgress({
  currentRank,
  desiredRank,
  orderId,
  abandonActionUrl,
  serviceType = "rank-boost",
  wins = 0,
  placements = 0,
  playerData,
}: OrderProgressProps) {
  const [isAbandoning, setIsAbandoning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [playerRankData, setPlayerRankData] = useState<any>(null)
  const [matchHistory, setMatchHistory] = useState<any[]>([])
  const router = useRouter()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  // Generate rank badges based on current and desired ranks
  const rankBadges = generateRankBadges(currentRank, desiredRank)
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleBadges = rankBadges.slice(activeIndex, activeIndex + 2)

  // Fetch player data and match history from Riot API
  useEffect(() => {
    if (!playerData?.username || !playerData?.tagLine) return

    const fetchPlayerData = async () => {
      setIsLoading(true)
      try {
        // Make sure username and tagLine are strings before encoding
        const username = playerData?.username || ""
        const tagLine = playerData?.tagLine || ""
        const region = playerData?.server || "euw"

        // Fetch player rank data
        const playerResponse = await fetch(
          `/api/riot/league-oflegend/player-data?gameName=${encodeURIComponent(username)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&game=lol`,
        )

        if (playerResponse.ok) {
          const data = await playerResponse.json()
          setPlayerRankData(data)
        }

        // Fetch match history
        const matchResponse = await fetch(
          `/api/riot/league-oflegend/matches?gameName=${encodeURIComponent(username)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&game=lol&count=10`,
        )

        if (matchResponse.ok) {
          const data = await matchResponse.json()
          setMatchHistory(data.matches || [])
        }
      } catch (error) {
        console.error("Error fetching Riot API data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayerData()

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchPlayerData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [playerData])

  // Calculate progress percentage based on service type
  const calculateProgress = () => {
    if (serviceType === "rank-boost") {
      // For rank boost, calculate progress through rank badges
      if (!currentRank || !desiredRank || rankBadges.length <= 1) {
        return 0
      }

      // If we have real-time data, use it to calculate more accurate progress
      if (playerRankData?.soloQueue) {
        const currentTier = playerRankData.soloQueue.tier?.toLowerCase() || currentRank.tier
        const currentDiv = playerRankData.soloQueue.rank || currentRank.division || "IV"
        const currentLP = playerRankData.soloQueue.leaguePoints || currentRank.lp || 0

        // Find position in rank badges
        const currentPosition = findPositionInRankBadges(rankBadges, currentTier, currentDiv, currentLP)
        return Math.round((currentPosition / (rankBadges.length - 1)) * 100)
      }

      // Fallback to simple calculation
      return Math.round((1 / rankBadges.length) * 100)
    } else if (serviceType === "win-boost") {
      // For win boost, calculate completed wins
      const completedWins = matchHistory.filter((match) => match.result === "Win").length
      return Math.min(100, Math.round((completedWins / (wins || 10)) * 100))
    } else if (serviceType === "placement-boost") {
      // For placement matches, calculate completed placements
      const completedPlacements = matchHistory.slice(0, placements || 10).length
      return Math.round((completedPlacements / (placements || 10)) * 100)
    }

    return 0
  }

  const progress = calculateProgress()

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  const handleNext = () => {
    if (activeIndex + 3 < rankBadges.length) {
      setActiveIndex(activeIndex + 1)
    }
  }

  const handleAbandon = async () => {
    if (!confirm("Are you sure you want to abandon this order?")) {
      return
    }

    setIsAbandoning(true)

    try {
      const response = await fetch(abandonActionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        router.refresh()
        router.push(`/dashboard/`)
      } else {
        const data = await response.json()
        alert("Failed to abandon order: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error abandoning order:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsAbandoning(false)
    }
  }

  // Render different content based on service type
  const renderServiceContent = () => {
    if (serviceType === "rank-boost" || !serviceType) {
      return (
        <div className="relative">
          {/* Rank Badges */}
          <div className="flex justify-center space-x-8 mb-8">
            {rankBadges.map((badge, index) => {
              const bgColor = getRankColor(badge.tier)

              return (
                <div key={badge.id} className="flex flex-col items-center">
                  <div
                    className="relative w-40 h-60 rounded-xl flex flex-col items-center justify-center text-center shadow-lg border border-white/10"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="text-xl font-bold text-white">{badge.tier.toUpperCase()}</div>
                    <div className="text-lg font-semibold text-white">DIVISION {badge.division}</div>
                    <div className="mt-4 text-sm text-white">League Points</div>
                    <div className="text-xl font-bold text-white">{badge.lp}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Position Indicators */}
          <div className="flex justify-center space-x-12 mt-4">
            {rankBadges.map((badge, index) => (
              <div
                key={`pos-${badge.id}`}
                className="w-8 h-8 bg-[#1E2230] border border-[#2A2F3F] rounded-full flex items-center justify-center"
              >
                <span className="text-sm font-medium text-white">
                  {index === 0 ? "Start" : index === rankBadges.length - 1 ? "Goal" : "Mid"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (serviceType === "win-boost") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Win Boost Progress</div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold">
                {matchHistory.filter((match) => match.result === "Win").length} / {wins || 10} Wins
              </span>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="space-y-2">
            <div className="text-lg font-semibold">Recent Matches</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : matchHistory.length > 0 ? (
                matchHistory.slice(0, 6).map((match, index) => (
                  <div
                    key={match.matchId || index}
                    className={`p-3 rounded-lg border ${
                      match.result === "Win" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#1E2230] flex items-center justify-center overflow-hidden">
                          <img
                            src={match.championImageUrl || "/placeholder.svg?width=32&height=32"}
                            alt={match.champion || "Champion"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{match.champion || "Unknown"}</div>
                          <div className="text-xs text-gray-400">{match.kda || "0/0/0"}</div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center ${match.result === "Win" ? "text-green-400" : "text-red-400"}`}
                      >
                        {match.result === "Win" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-400">No match history available</div>
              )}
            </div>
          </div>
        </div>
      )
    } else if (serviceType === "placement-boost") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Placement Matches Progress</div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {Math.min(matchHistory.length, placements || 10)} / {placements || 10} Matches
              </span>
            </div>
          </div>

          {/* Placement Matches */}
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: placements || 10 }).map((_, index) => {
              const match = matchHistory[index]
              let status = "pending"
              if (match) {
                status = match.result === "Win" ? "win" : "loss"
              }

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      status === "pending"
                        ? "bg-[#1E2230] border-2 border-[#2A2F3F]"
                        : status === "win"
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-red-500/20 border-2 border-red-500"
                    }`}
                  >
                    {status === "pending" ? (
                      <span className="text-lg font-bold">{index + 1}</span>
                    ) : status === "win" ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {status === "pending" ? "Pending" : status === "win" ? "Win" : "Loss"}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Rank After Placements */}
          {playerRankData?.soloQueue && (
            <div className="mt-6 p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
              <div className="text-lg font-semibold mb-2">Current Rank After Placements</div>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-full border border-white/10"
                  style={{ backgroundColor: getRankColor(playerRankData.soloQueue.tier?.toLowerCase()) }}
                ></div>
                <div>
                  <div className="text-xl font-bold">{playerRankData.soloQueue.tier || "Unranked"}</div>
                  {playerRankData.soloQueue.rank && (
                    <div className="text-lg">
                      {playerRankData.soloQueue.rank} - {playerRankData.soloQueue.leaguePoints || 0} LP
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
      <CardHeader className="px-4 py-3 flex justify-between items-center border-b border-[#2A2F3F] bg-[#1A1E2C]">
        <div>
          <CardTitle className="text-lg font-semibold">Order Progress</CardTitle>
          {serviceType && serviceType !== "rank-boost" && (
            <div className="text-xs text-gray-400">
              {serviceType === "win-boost"
                ? "Win Boost"
                : serviceType === "placement-boost"
                  ? "Placement Matches"
                  : "Unknown Service Type"}
            </div>
          )}
        </div>
        {userRole === "BOOSTER" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleAbandon}
            disabled={isAbandoning}
            className="bg-red-600 hover:bg-red-700"
          >
            {isAbandoning ? "Abandoning..." : "Abandon order"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2 bg-[#0F1118]/90 px-4 py-2 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span>Loading data...</span>
            </div>
          </div>
        )}

        {renderServiceContent()}

        {/* Progress Bar - Common for all service types */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <Badge variant="outline" className="bg-[#1E2230] border-[#2A2F3F]">
              {progress}%
            </Badge>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-[#1E2230]"
            indicatorClassName="bg-gradient-to-r from-blue-600 to-purple-600"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to generate rank badges between current and desired ranks
function generateRankBadges(currentRank: RankInfo, desiredRank: RankInfo) {
  const tiers = [
    "iron",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "emerald",
    "diamond",
    "master",
    "grandmaster",
    "challenger",
  ]
  const divisions = ["IV", "III", "II", "I"]

  const badges = []

  // Ensure we have valid ranks
  if (!currentRank?.tier || !desiredRank?.tier) {
    return [
      {
        id: "current",
        tier: currentRank?.tier || "iron",
        division: currentRank?.division || "IV",
        lp: currentRank?.lp || 0,
      },
      {
        id: "desired",
        tier: desiredRank?.tier || "iron",
        division: desiredRank?.division || "IV",
        lp: desiredRank?.lp || 0,
      },
    ]
  }

  // Add current rank
  badges.push({
    id: "current",
    tier: currentRank.tier,
    division: currentRank.division || "IV",
    lp: currentRank.lp || 0,
  })

  // Calculate middle rank
  const currentTierIndex = tiers.indexOf(currentRank.tier.toLowerCase())
  const desiredTierIndex = tiers.indexOf(desiredRank.tier.toLowerCase())

  if (currentTierIndex >= 0 && desiredTierIndex >= 0) {
    // If same tier, find middle division
    if (currentTierIndex === desiredTierIndex) {
      const currentDivIndex = divisions.indexOf(currentRank.division || "IV")
      const desiredDivIndex = divisions.indexOf(desiredRank.division || "I")

      if (currentDivIndex >= 0 && desiredDivIndex >= 0) {
        const middleDivIndex = Math.floor((currentDivIndex + desiredDivIndex) / 2)
        badges.push({
          id: "middle",
          tier: currentRank.tier,
          division: divisions[middleDivIndex],
          lp: 0,
        })
      }
    } else {
      // Different tiers, find middle tier
      const middleTierIndex = Math.floor((currentTierIndex + desiredTierIndex) / 2)
      badges.push({
        id: "middle",
        tier: tiers[middleTierIndex],
        division: "II",
        lp: 0,
      })
    }
  }

  // Add desired rank
  badges.push({
    id: "desired",
    tier: desiredRank.tier,
    division: desiredRank.division || "I",
    lp: desiredRank.lp || 0,
  })

  return badges
}

// Helper function to find position in rank badges
function findPositionInRankBadges(badges: any[], tier: string, division: string, lp: number) {
  // Find exact match
  const exactMatchIndex = badges.findIndex(
    (badge) => badge.tier.toLowerCase() === tier.toLowerCase() && badge.division === division && badge.lp <= lp,
  )

  if (exactMatchIndex !== -1) {
    return exactMatchIndex
  }

  // Find closest match by tier and division
  const closestMatchIndex = badges.findIndex(
    (badge) => badge.tier.toLowerCase() === tier.toLowerCase() && badge.division === division,
  )

  if (closestMatchIndex !== -1) {
    return closestMatchIndex
  }

  // Find match by tier only
  const tierMatchIndex = badges.findIndex((badge) => badge.tier.toLowerCase() === tier.toLowerCase())

  if (tierMatchIndex !== -1) {
    return tierMatchIndex
  }

  return 0
}
