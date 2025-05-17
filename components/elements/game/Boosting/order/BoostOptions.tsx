"use client"

import { Switch } from "@/components/ui/switch"

interface BoostOption {
  name: string
  key: string
  label?: string
  priceModifier?: string
}

// Define the type for the options object
type BoostOptions = {
  vipBooster: boolean
  voiceDuo: boolean
  priority: boolean
  ghostDuo: boolean
}

interface BoostOptionsProps {
  options: BoostOptions
  onOptionChange: (key: keyof BoostOptions) => void
  availableOptions: BoostOption[]
}

export default function BoostOptions({ options, onOptionChange, availableOptions }: BoostOptionsProps) {
  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-yellow-300 mb-4">Boost customization</h3>

      <div className="space-y-4">
        {availableOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{option.name}</span>
              {option.label && <span className="bg-purple-700 text-xs px-2 py-0.5 rounded">{option.label}</span>}
              {option.priceModifier && <span className="text-yellow-300 text-xs">{option.priceModifier}</span>}
            </div>
            <Switch
              checked={options[option.key as keyof BoostOptions]}
              onCheckedChange={() => onOptionChange(option.key as keyof BoostOptions)}
              className="data-[state=checked]:bg-yellow-400"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
