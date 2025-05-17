"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface RankTier {
  id: string
  name: string
  image: string
  divisions?: string[]
  lp?: boolean
}

interface RankSelectorProps {
  label: string
  rankTiers: RankTier[]
  value: { tier: string; division?: string }
  onChange: (value: { tier: string; division?: string }) => void
  lpValue?: number
  onLpChange?: (lp: number) => void
  isDisabled?: boolean
  playerData?: any
}

export default function RankSelector({
  label,
  rankTiers,
  value,
  onChange,
  lpValue = 0,
  onLpChange,
  isDisabled = false,
  playerData,
}: RankSelectorProps) {
  const [selectedTierObj, setSelectedTierObj] = useState<RankTier | undefined>(
    rankTiers.find((tier) => tier.id === value.tier),
  )

  // Update the selected tier object when the value changes from parent
  useEffect(() => {
    const tierObj = rankTiers.find((tier) => tier.id === value.tier)
    setSelectedTierObj(tierObj)
  }, [value.tier, rankTiers])

  // Handle tier selection
  const handleTierSelect = (tierId: string) => {
    if (isDisabled) return

    const tierObj = rankTiers.find((tier) => tier.id === tierId)
    const newDivision = tierObj?.divisions?.[0]

    onChange({
      tier: tierId,
      division: newDivision,
    })
  }

  // Handle division selection
  const handleDivisionSelect = (division: string) => {
    if (isDisabled) return

    onChange({
      tier: value.tier,
      division,
    })
  }

  // Handle LP change
  const handleLpChange = (lp: string) => {
    if (isDisabled || !onLpChange) return
    onLpChange(Number(lp))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{label}</h4>

        {playerData && label === "Current Rank" && (
          <Badge variant="outline" className="bg-blue-900/20 text-blue-300">
            Account Verified
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
        {rankTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative cursor-pointer rounded-md p-2 flex flex-col items-center ${
              value.tier === tier.id
                ? "bg-blue-900/50 border border-blue-500"
                : "border border-[#333355] hover:border-blue-500/50"
            } ${isDisabled ? "opacity-80 cursor-not-allowed" : ""}`}
            onClick={() => handleTierSelect(tier.id)}
          >
            <div className="w-10 h-10 relative">
              <Image
                src={tier.image || "/placeholder.svg?height=40&width=40"}
                alt={tier.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-xs mt-1 text-center">{tier.name}</span>
          </div>
        ))}
      </div>

      {selectedTierObj?.divisions && selectedTierObj.divisions.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {selectedTierObj.divisions.map((division) => (
            <div
              key={division}
              className={`cursor-pointer rounded-md p-2 flex items-center justify-center ${
                value.division === division
                  ? "bg-blue-900/50 border border-blue-500"
                  : "border border-[#333355] hover:border-blue-500/50"
              } ${isDisabled ? "opacity-80 cursor-not-allowed" : ""}`}
              onClick={() => handleDivisionSelect(division)}
            >
              <span className="text-sm">{division}</span>
            </div>
          ))}
        </div>
      )}

      {selectedTierObj?.lp && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">LP</h4>
          <Select value={lpValue?.toString() || "0"} onValueChange={handleLpChange} disabled={isDisabled}>
            <SelectTrigger className="bg-[#0f0f1a] border-[#333355] text-white">
              <SelectValue placeholder="Select LP">{lpValue || 0} LP</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#333355] text-white">
              {Array.from({ length: 21 }, (_, i) => i * 5).map((lp) => (
                <SelectItem key={lp} value={lp.toString()}>
                  {lp} LP
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
