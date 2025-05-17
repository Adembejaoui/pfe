import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface PlayerCurrentRankProps {
  gameType: string
  rankData: any
  tierImages: Record<string, string>
}

export default function PlayerCurrentRank({ gameType, rankData, tierImages }: PlayerCurrentRankProps) {
  if (!rankData) {
    return null
  }

  // Format tier name for display
  const formatTierName = (tier: string) => {
    if (!tier) return "Unranked"

    // Convert from API format (e.g., "GOLD") to display format (e.g., "Gold")
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
  }

  const displayTier = formatTierName(rankData.tier)
  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Current Rank</h3>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 relative">
            <Image
              src={tierImages[displayTier] || "/placeholder.svg?height=80&width=80"}
              alt={displayTier}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-medium">{displayTier}</span>
            {rankData.division && <span className="text-sm ml-1">{rankData.division}</span>}
            {rankData.lp !== undefined && <div className="text-sm text-white">{rankData.leaguePoints} LP</div>}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center">
            <span className="text-gray-400 w-24">Account:</span>
            <span className="font-medium">
              {rankData.username}
              {rankData.tagLine && (
                <Badge variant="outline" className="ml-2 bg-blue-900/20">
                  #{rankData.tagLine}
                </Badge>
              )}
            </span>
          </div>

          {rankData.server && (
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Server:</span>
              <span>{rankData.server}</span>
            </div>
          )}

          {gameType === "league-of-legends" && (
            <>
              {rankData.wins !== undefined && rankData.losses !== undefined && (
                <div className="flex items-center">
                  <span className="text-gray-400 w-24">Win/Loss:</span>
                  <span>
                    <span className="text-green-400">{rankData.wins}W</span>
                    {" / "}
                    <span className="text-red-400">{rankData.losses}L</span>{" "}
                    <span className="text-gray-400">
                      ({Math.round((rankData.wins / (rankData.wins + rankData.losses)) * 100)}%)
                    </span>
                  </span>
                </div>
              )}
            </>
          )}

          {gameType === "valorant" && rankData.rr !== undefined && (
            <div className="flex items-center">
              <span className="text-gray-400 w-24">RR:</span>
              <span>{rankData.rr} / 100</span>
            </div>
          )}

          {rankData.accountLevel && (
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Level:</span>
              <span>{rankData.accountLevel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
