import { Badge } from "@/components/ui/badge"
import { Star, Trophy, Users } from "lucide-react"

interface OrderHeaderProps {
  eurPrice: number
  usdPrice: number
  rating: number
  soloStats: number
  duoStats: number
  maxSoloRank: string
  maxDuoRank: string
}

export function OrderHeader({
  eurPrice,
  usdPrice,
  rating,
  soloStats,
  duoStats,
  maxSoloRank,
  maxDuoRank,
}: OrderHeaderProps) {
  return (
    <div className="w-full px-4 py-3 flex justify-between items-center overflow-x-auto">
      <div className="flex space-x-8 md:space-x-12">
        <div className="text-center">
          <div className="text-lg font-bold text-white">${eurPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-400">EUR</div>
        </div>

        {usdPrice > 0 && (
          <div className="text-center">
            <div className="text-lg font-bold text-white">${usdPrice.toFixed(2)}</div>
            <div className="text-xs text-gray-400">USD</div>
          </div>
        )}

        <div className="text-center flex flex-col items-center">
          <div className="text-lg font-bold text-white flex items-center">
            {rating.toFixed(1)}
            <Star className="h-4 w-4 ml-1 text-yellow-400" />
          </div>
          <div className="text-xs text-gray-400">Rating</div>
        </div>

        <div className="text-center flex flex-col items-center">
          <div className="text-lg font-bold text-white flex items-center">
            {soloStats}
            <Trophy className="h-4 w-4 ml-1 text-blue-400" />
          </div>
          <div className="text-xs text-gray-400">Solo Stats</div>
        </div>

        <div className="text-center flex flex-col items-center">
          <div className="text-lg font-bold text-white flex items-center">
            {duoStats}
            <Users className="h-4 w-4 ml-1 text-green-400" />
          </div>
          <div className="text-xs text-gray-400">Duo Stats</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-white">
            <Badge className="bg-purple-600 hover:bg-purple-700">{maxSoloRank}</Badge>
          </div>
          <div className="text-xs text-gray-400">Max Solo Rank</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-white">
            <Badge className="bg-blue-600 hover:bg-blue-700">{maxDuoRank}</Badge>
          </div>
          <div className="text-xs text-gray-400">Max Duo Rank</div>
        </div>
      </div>
    </div>
  )
}
