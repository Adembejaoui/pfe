"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RankSelectorProps {
  type: "current" | "desired"
  tier: string
  division: string
  onTierChange: (tier: string) => void
  onDivisionChange: (division: string) => void
  validateRanks?: (currTier: string, currDiv: string, desTier: string, desDiv: string) => void
  currentTier?: string
  currentDivision?: string
  tierImages: Record<string, string>
  tiers: string[]
  divisions: string[]
}

export default function RankSelector({
  type,
  tier,
  division,
  onTierChange,
  onDivisionChange,
  validateRanks,
  currentTier,
  currentDivision,
  tierImages,
  tiers,
  divisions,
}: RankSelectorProps) {
  const title = type === "current" ? "Current rank" : "Desired rank"
  const icon = type === "current" ? "👑" : "🏆"

  const handleTierChange = (value: string) => {
    onTierChange(value)
    if (validateRanks && type === "current" && currentTier && currentDivision) {
      validateRanks(value, division, currentTier, currentDivision)
    } else if (validateRanks && type === "desired" && currentTier && currentDivision) {
      validateRanks(currentTier, currentDivision, value, division)
    }
  }

  const handleDivisionChange = (value: string) => {
    onDivisionChange(value)
    if (validateRanks && type === "current" && currentTier && currentDivision) {
      validateRanks(tier, value, currentTier, currentDivision)
    } else if (validateRanks && type === "desired" && currentTier && currentDivision) {
      validateRanks(currentTier, currentDivision, tier, value)
    }
  }

  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">{icon}</span>
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>

      <div className="flex justify-center mb-4">
        <img src={tierImages[tier] || "/placeholder.svg"} alt={tier} className="w-24 h-24" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={tier} onValueChange={handleTierChange}>
          <SelectTrigger className="bg-[#2a0044] border-purple-900">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            {tiers.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={division} onValueChange={handleDivisionChange}>
          <SelectTrigger className="bg-[#2a0044] border-purple-900">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((div) => (
              <SelectItem key={div} value={div}>
                {div}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
