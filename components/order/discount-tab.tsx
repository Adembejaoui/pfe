"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { YesNoQuestion } from "./yes-no-question"
import { DiscountCode } from "./discount-code"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Gift, MessageSquare } from "lucide-react"

interface DiscountTabProps {
  onSubmit: (data: {
    answers: Record<string, boolean>
    websiteFeedback?: string
  }) => void
  isSubmitting?: boolean
  discountCode: { code: string; percentage: number; expiresAt: string } | null
}

export function DiscountTab({ onSubmit, isSubmitting = false, discountCode }: DiscountTabProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [websiteFeedback, setWebsiteFeedback] = useState("")

  const questions = [
    { id: "professional", text: "Was the booster professional?" },
    { id: "onTime", text: "Was the service completed on time?" },
    { id: "communication", text: "Was communication clear?" },
    { id: "useAgain", text: "Would you use our service again?" },
    { id: "easyOrder", text: "Was it easy to place the order?" },
    { id: "satisfied", text: "Are you satisfied with the final result?" },
    { id: "recommend", text: "Would you recommend us to friends?" },
  ]

  const handleAnswerChange = (questionId: string, answer: boolean) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const allQuestionsAnswered = questions.every((q) => answers[q.id] !== undefined)
  const yesCount = Object.values(answers).filter((answer) => answer === true).length

  // Calculate estimated discount percentage
  const calculateEstimatedDiscount = () => {
    let discount = 5 + yesCount // Base 5% + 1% per yes
    if (websiteFeedback.trim()) {
      discount += 2 // Extra 2% for feedback
    }
    return Math.min(15, discount)
  }

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return

    onSubmit({
      answers,
      websiteFeedback,
    })
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      {!discountCode ? (
        <>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-center flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              Answer questions to claim your discount
            </CardTitle>
            <p className="text-sm text-gray-400 text-center">Your feedback helps us improve our service</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Survey Questions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Service Feedback Questions:</h4>
              {questions.map((question, index) => (
                <YesNoQuestion
                  key={question.id}
                  question={`${index + 1}. ${question.text}`}
                  value={answers[question.id]}
                  onChange={(value: boolean) => handleAnswerChange(question.id, value)}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            {allQuestionsAnswered && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Gift className="w-4 h-4" />
                  <span>
                    Estimated discount: <strong>{calculateEstimatedDiscount()}%</strong>
                    {websiteFeedback.trim() && " (includes +2% bonus for feedback!)"}
                  </span>
                </div>
              </div>
            )}

            {/* Website Feedback Section */}
            <div className="space-y-2 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-medium">How can we improve our website?</h4>
                <span className="text-xs text-green-400 font-medium">+2% bonus</span>
              </div>
              <Textarea
                placeholder="Tell us about your experience with our website, what features you'd like to see, or any issues you encountered..."
                value={websiteFeedback}
                onChange={(e) => setWebsiteFeedback(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-400">
                Optional: Providing website feedback gives you an extra 2% discount bonus!
              </p>
            </div>

            {/* Feedback Summary */}
            {allQuestionsAnswered && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    Positive answers: {yesCount}/{questions.length}
                  </div>
                  <div>Website feedback: {websiteFeedback.trim() ? "✓ Provided" : "Not provided"}</div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Discount...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Generate My Discount ({calculateEstimatedDiscount()}%)
                </>
              )}
            </Button>
          </CardFooter>
        </>
      ) : (
        <DiscountCode
          code={discountCode.code}
          percentage={discountCode.percentage}
          expiresAt={discountCode.expiresAt}
        />
      )}
    </Card>
  )
}
