"use client"

import { Slider } from "@/components/ui/slider"

interface WinSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function WinSelector({ value, onChange }: WinSelectorProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <h4 className="text-sm font-medium">Number of Wins</h4>
        <span className="text-sm font-medium">{value} wins</span>
      </div>
      <Slider
        defaultValue={[value]}
        min={1}
        max={20}
        step={1}
        onValueChange={(values) => onChange(values[0])}
        className="py-4"
      />
    </div>
  )
}
