"use client"

import { useState } from "react"
import { StarRating } from "./star-rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ReviewTabProps {
  onSubmit: (data: {
    rating: number
    tags: string[]
    comment: string
  }) => void
  isSubmitting?: boolean
}

export function ReviewTab({ onSubmit, isSubmitting = false }: ReviewTabProps) {
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState("")

  const negativeTags = [
    "Unprofessional",
    "Poor communication",
    "Slow response",
    "Unfriendly",
    "Didn't follow instructions",
  ]
  const positiveTags = [
    "Excellent service",
    "Fast and efficient",
    "Friendly booster",
    "Professional",
    "Great communication",
  ]

  const displayTags = rating <= 2 ? negativeTags : positiveTags

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) return

    onSubmit({
      rating,
      tags: selectedTags,
      comment,
    })
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="pt-6 space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium mb-2">How would you rate your booster?</h3>
          <StarRating rating={rating} onRatingChange={setRating} size={32} />
        </div>

        {rating > 0 && (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select tags that describe your experience:</h4>
              <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Additional comments:</h4>
              <Textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
