"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function useOrderCompletion(orderId: number, status: string) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if the order was just completed
    const justCompleted = searchParams.get("completed") === "true"

    if (justCompleted && status === "COMPLETED") {
      // Store in sessionStorage that this order was just completed
      sessionStorage.setItem(`order_${orderId}_just_completed`, "true")

      // Remove the query parameter to avoid showing the modal on refresh
      const url = new URL(window.location.href)
      url.searchParams.delete("completed")

      // Replace the URL without the query parameter
      window.history.replaceState({}, "", url.toString())
    }
  }, [orderId, status, searchParams])

  return null
}
