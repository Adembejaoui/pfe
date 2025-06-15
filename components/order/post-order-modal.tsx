"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReviewTab } from "./review-tab"
import { DiscountTab } from "./discount-tab"

interface PostOrderModalProps {
  orderId: string | number
  clientId?: string | number
  boosterId?: string | number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

export function PostOrderModal({ orderId, clientId, boosterId, open, onOpenChange, onClose }: PostOrderModalProps) {
  const [activeTab, setActiveTab] = useState("review")
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false)
  const [discountCode, setDiscountCode] = useState<{ code: string; percentage: number; expiresAt: string } | null>(null)

  const isOpen = open !== undefined ? open : true
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (isSubmittingReview || isSubmittingSurvey)) {
      console.log("🚫 Preventing modal close during submission")
      return
    }

    console.log(`🎭 Modal open state changing to: ${newOpen}`)

    if (onOpenChange) {
      onOpenChange(newOpen)
    } else if (onClose && !newOpen) {
      onClose()
    }
  }

  const handleReviewSubmit = async (reviewData: { rating: number; tags: string[]; comment: string }) => {
    setIsSubmittingReview(true)
    console.log("🚀 Starting review submission...")

    try {
      const requestData = {
        orderId: Number(orderId),
        boosterId: Number(boosterId),
        authorId: Number(clientId),
        rating: reviewData.rating,
        tags: reviewData.tags,
        comment: reviewData.comment,
      }

      console.log("📤 Submitting review:", requestData)

      const response = await fetch("/api/orders/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),  
      })

      console.log("📡 Review response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Review API error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseData = await response.json()
      console.log("✅ Review submitted successfully:", responseData)

      setReviewSubmitted(true)
      setActiveTab("discount")
      toast.success("Thank you for your review!")
    } catch (error) {
      console.error("💥 Review submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDiscountSubmit = async (surveyData: {
    answers: Record<string, boolean>
    websiteFeedback?: string
  }) => {
    setIsSubmittingSurvey(true)
    console.log("🚀 Starting discount submission...")

    try {
      const requestData = {
        orderId: Number(orderId),
        clientId: Number(clientId),
        surveyAnswers: surveyData.answers,
        websiteFeedback: surveyData.websiteFeedback,
      }

      console.log("📤 Submitting discount request:", requestData)

      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      console.log("📡 Discount response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Discount API error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseData = await response.json()
      console.log("✅ Discount generated successfully:", responseData)

      setDiscountCode({
        code: responseData.code,
        percentage: responseData.percentage,
        expiresAt: responseData.expiresAt,
      })

      toast.success(`Discount code generated: ${responseData.percentage}% off!`)

      // Auto-close after 5 seconds
      setTimeout(() => {
        console.log("⏰ Auto-closing modal...")
        setIsSubmittingSurvey(false)
        handleOpenChange(false)
      }, 5000)
    } catch (error) {
      console.error("💥 Discount submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate discount")
      setIsSubmittingSurvey(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#161A26] border-[#2A2F3F]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Thank You For Your Order!</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review">Leave a Review</TabsTrigger>
            <TabsTrigger value="discount" disabled={!reviewSubmitted}>
              Claim Your Discount
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <ReviewTab onSubmit={handleReviewSubmit} isSubmitting={isSubmittingReview} />
          </TabsContent>

          <TabsContent value="discount">
            <DiscountTab
              onSubmit={handleDiscountSubmit}
              isSubmitting={isSubmittingSurvey}
              discountCode={discountCode}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
