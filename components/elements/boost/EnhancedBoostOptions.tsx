"use client"

import { useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface EnhancedBoostOptionsProps {
  options: Record<string, boolean>
  onOptionChange: (key: string) => void
  gameConfig: any
}

export default function EnhancedBoostOptions({ options, onOptionChange, gameConfig }: EnhancedBoostOptionsProps) {
  // Get the available options from the game config
  const availableOptions = gameConfig.options || {}

  // Auto-check free options (priceMultiplier = 0) when component mounts or options change
  useEffect(() => {
    Object.entries(availableOptions).forEach(([key, optionData]: [string, any]) => {
      // If the option has a priceMultiplier of 0 and is not already checked, check it
      if (optionData.priceMultiplier === 0 && !options[key]) {
        onOptionChange(key)
      }
    })
  }, [availableOptions, options, onOptionChange])

  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6">Enhanced Boost Options</h3>

      <div className="space-y-6">
        {/* Dynamically render options based on the game config */}
        {Object.entries(availableOptions).map(([key, optionData]: [string, any]) => {
          // Determine if this is a free option
          const isFreeOption = optionData.priceMultiplier === 0

          return (
            <div key={key} className="border-b border-[#333355] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{optionData.name}</span>
                  {optionData.priceMultiplier > 0 ? (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-xs font-medium px-2 py-0.5">
                      +{Math.round((optionData.priceMultiplier - 1) * 100)}%
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600 hover:bg-green-700 text-xs font-medium px-2 py-0.5">Free</Badge>
                  )}
                </div>
                <Switch
                  checked={options[key] || false}
                  onCheckedChange={() => onOptionChange(key)}
                  disabled={isFreeOption} // Disable the switch for free options
                  className={
                    optionData.priceMultiplier > 0
                      ? "data-[state=checked]:bg-blue-600"
                      : "data-[state=checked]:bg-green-600"
                  }
                />
              </div>
              {optionData.description && (
                <p className="text-xs text-gray-400 mt-1 max-w-[90%]">{optionData.description}</p>
              )}
            </div>
          )
        })}

        {/* Show message if no options are available */}
        {Object.keys(availableOptions).length === 0 && (
          <div className="text-center py-4 text-gray-400">
            <p>No additional options available for this boost type.</p>
          </div>
        )}
      </div>
    </div>
  )
}
