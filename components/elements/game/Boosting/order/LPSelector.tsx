"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info } from "lucide-react"

interface LPSelectorProps {
  type: "current" | "gain"
  value: string
  onChange: (value: string) => void
  options: string[]
}

export default function LPSelector({ type, value, onChange, options }: LPSelectorProps) {
  const title = type === "current" ? "Current LP" : "LP Gain"

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">LP</span>
        </div>
        <h3 className="font-bold">{title}</h3>
        {type === "gain" && <Info className="w-4 h-4 text-yellow-300" />}
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-[#2a0044] border-purple-900">
          <SelectValue placeholder={title} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
