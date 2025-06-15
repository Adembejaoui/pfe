"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  size?: number
}

export function StarRating({ rating, onRatingChange, size = 24 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center justify-center gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          className={`cursor-pointer transition-all ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          }`}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onRatingChange(star)}
        />
      ))}
    </div>
  )
}
