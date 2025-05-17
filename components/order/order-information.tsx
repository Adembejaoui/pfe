import { formatRank } from "@/lib/format-utils"
import { Badge } from "@/components/ui/badge"
import { Gamepad, Globe, Server, Trophy, Zap } from "lucide-react"

interface OrderInformationProps {
  orderId: string
  server: string
  platform: string
  service: string
  options: {
    ghostDuo: boolean
    priority: boolean
    voiceDuo: boolean
    vipBooster: boolean
    streamGames: boolean
  }
  currentRank: {
    tier?: string
    division?: string
    lp?: number
  }
  desiredRank?: {
    tier?: string
    division?: string
    lp?: number
  }
  wins?: number
  placements?: number
  cashout: string
}

export function OrderInformation({
  orderId,
  server,
  platform,
  service,
  options,
  currentRank,
  desiredRank,
  wins,
  placements,
  cashout,
}: OrderInformationProps) {
  const formattedCurrentRank = formatRank(currentRank)

  // Determine what to display based on service type
  let progressDisplay = ""

  if (service === "rank-boost" && desiredRank) {
    const formattedDesiredRank = formatRank(desiredRank)
    progressDisplay = `${formattedCurrentRank} → ${formattedDesiredRank}`
  } else if (service === "win-boost" && typeof wins === "number") {
    progressDisplay = `${formattedCurrentRank} → ${wins} wins`
  } else if (service === "placement-boost" && typeof placements === "number") {
    progressDisplay = `${formattedCurrentRank} → ${placements} placements`
  } else {
    // Fallback for unknown service types
    const formattedDesiredRank = desiredRank ? formatRank(desiredRank) : "Unknown"
    progressDisplay = `${formattedCurrentRank} → ${formattedDesiredRank}`
  }

  const activeOptions = Object.entries(options || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key.replace(/([A-Z])/g, " $1").trim())

  return (
    <section className="bg-[#161A26] rounded-xl border border-[#2A2F3F] overflow-hidden shadow-lg">
      <header className="px-4 py-3 border-b border-[#2A2F3F] bg-[#1A1E2C]">
        <h2 className="text-lg font-semibold">Order Information</h2>
      </header>
      <dl className="divide-y divide-[#2A2F3F]">
        <div className="grid grid-cols-3 px-4 py-3">
          <dt className="text-gray-400 flex items-center">
            <Server className="w-4 h-4 mr-2 text-gray-500" />
            Server
          </dt>
          <dd className="col-span-2 font-medium">{server?.toUpperCase() || "Unknown"}</dd>
        </div>
        <div className="grid grid-cols-3 px-4 py-3">
          <dt className="text-gray-400 flex items-center">
            <Gamepad className="w-4 h-4 mr-2 text-gray-500" />
            Platform
          </dt>
          <dd className="col-span-2 font-medium">{platform || "PC"}</dd>
        </div>
        <div className="grid grid-cols-3 px-4 py-3">
          <dt className="text-gray-400 flex items-center">
            <Globe className="w-4 h-4 mr-2 text-gray-500" />
            Service
          </dt>
          <dd className="col-span-2 font-medium">
            <div className="flex items-center">
              <Badge className="mr-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                {service || "Rank Boost"}
              </Badge>
            </div>
          </dd>
        </div>
        <div className="grid grid-cols-3 px-4 py-3">
          <dt className="text-gray-400 flex items-center">
            <Trophy className="w-4 h-4 mr-2 text-gray-500" />
            {service === "win-boost" ? "Wins" : service === "placement-boost" ? "Placements" : "Rank Progress"}
          </dt>
          <dd className="col-span-2 font-medium">{progressDisplay}</dd>
        </div>
        {activeOptions.length > 0 && (
          <div className="grid grid-cols-3 px-4 py-3">
            <dt className="text-gray-400 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-gray-500" />
              Options
            </dt>
            <dd className="col-span-2">
              <div className="flex flex-wrap gap-2">
                {activeOptions.map((option) => (
                  <Badge key={option} variant="outline" className="bg-[#1E2230] border-[#2A2F3F] text-blue-400">
                    {option}
                  </Badge>
                ))}
              </div>
            </dd>
          </div>
        )}
        <div className="grid grid-cols-3 px-4 py-3 bg-[#1A1E2C]/50">
          <dt className="text-gray-400 flex items-center font-medium">Cashout</dt>
          <dd className="col-span-2 font-bold text-green-400">{cashout}</dd>
        </div>
      </dl>
    </section>
  )
}
