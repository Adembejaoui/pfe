import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface ValorantCurrentRankProps {
  rankData: any
  tierImages: Record<string, string>
}

export default function ValorantCurrentRank({ rankData, tierImages }: ValorantCurrentRankProps) {
  if (!rankData) {
    return null
  }

  // For Valorant, the tier might already be formatted correctly from the API
  const displayTier = rankData.tier || "Unranked"

  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Current Rank</h3>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 relative">
            {rankData.card ? (
              <Image
                src={rankData.card || "/placeholder.svg?height=80&width=80"}
                alt={displayTier}
                fill
                className="object-contain rounded-md"
                unoptimized
              />
            ) : (
              <Image
                src={tierImages[displayTier] || "/placeholder.svg?height=80&width=80"}
                alt={displayTier}
                fill
                className="object-contain"
                unoptimized
              />
            )}
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-medium">{displayTier}</span>
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

          {rankData.rr !== undefined && (
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
