"use client"

import { useEffect, useState } from "react"
import { PostOrderModal } from "@/components/order/post-order-modal"
import { useRouter, useSearchParams } from "next/navigation"

interface OrderCompleteHandlerProps {
  orderId: number
  boosterId: number | null
  clientId: number
  status: string
  hasReview: boolean
}

export function OrderCompleteHandler({ orderId, boosterId, clientId, status, hasReview }: OrderCompleteHandlerProps) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if the order was just completed
    const justCompleted = sessionStorage.getItem(`order_${orderId}_just_completed`)

    // Check if there's a completed query parameter
    const completedParam = searchParams.get("completed") === "true"

    // Show the modal if the order is completed, doesn't have a review yet, and either:
    // 1. The order was just marked as completed (from sessionStorage)
    // 2. The URL has a query parameter ?completed=true
    const shouldShowModal = status === "COMPLETED" && !hasReview && (justCompleted === "true" || completedParam)

    if (shouldShowModal && boosterId) {
      setShowModal(true)

      // Clear the flag so it doesn't show again on refresh
      sessionStorage.removeItem(`order_${orderId}_just_completed`)

      // Remove the query parameter to avoid showing the modal on refresh
      if (completedParam) {
        const url = new URL(window.location.href)
        url.searchParams.delete("completed")
        window.history.replaceState({}, "", url.toString())
      }
    }
  }, [orderId, status, hasReview, boosterId, clientId, searchParams])

  return (
    <>
      {boosterId && (
        <PostOrderModal
          open={showModal}
          onOpenChange={setShowModal}
          orderId={orderId}
          boosterId={boosterId}
          clientId={clientId}
        />
      )}
    </>
  )
}
