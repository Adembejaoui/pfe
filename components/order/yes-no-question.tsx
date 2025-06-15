"use client"

import { Button } from "@/components/ui/button"

interface YesNoQuestionProps {
  question: string
  value: boolean | undefined
  onChange: (value: boolean) => void
}

export function YesNoQuestion({ question, value, onChange }: YesNoQuestionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
      <p className="text-sm">{question}</p>
      <div className="flex gap-2">
        <Button
          variant={value === true ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(true)}
          className="w-16"
        >
          Yes
        </Button>
        <Button
          variant={value === false ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(false)}
          className="w-16"
        >
          No
        </Button>
      </div>
    </div>
  )
}
