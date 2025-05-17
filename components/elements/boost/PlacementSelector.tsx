"use client"

import { Slider } from "@/components/ui/slider"

interface PlacementSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function PlacementSelector({ value, onChange }: PlacementSelectorProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <h4 className="text-sm font-medium">Number of Placement Matches</h4>
        <span className="text-sm font-medium">{value} matches</span>
      </div>
      <Slider
        defaultValue={[value]}
        min={1}
        max={10}
        step={1}
        onValueChange={(values) => onChange(values[0])}
        className="py-4"
      />
    </div>
  )
}
