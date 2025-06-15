"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle, XCircle, Loader2, RefreshCw, ArrowUp, Bug, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { getRankColor } from "@/lib/format-utils"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PostOrderModal } from "./post-order-modal"

interface RankInfo {
  tier: string
  division?: string
  lp?: number
  lastUpdated?: string
}

interface PlayerData {
  username?: string
  tagLine?: string
  server?: string
}

interface OrderProgressProps {
  currentRank: RankInfo
  desiredRank: RankInfo
  orderId: number
  abandonActionUrl: string
  serviceType?: string
  wins?: number
  placements?: number
  playerData?: PlayerData
  actualRank?: RankInfo
  attributes?: any // Add this to access the full attributes object
}

export function OrderProgress({
  currentRank,
  desiredRank,
  orderId,
  abandonActionUrl,
  serviceType = "rank-boost",
  wins = 0,
  placements = 0,
  playerData,
  actualRank: initialActualRank,
  attributes,
}: OrderProgressProps) {
  const [isAbandoning, setIsAbandoning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingRank, setIsUpdatingRank] = useState(false)
  const [isCompletingOrder, setIsCompletingOrder] = useState(false)
  const [playerRankData, setPlayerRankData] = useState<any>(null)
  const [matchHistory, setMatchHistory] = useState<any[]>([])
  const [actualRank, setActualRank] = useState<RankInfo | null>(
    initialActualRank || attributes?.actualRank || { ...currentRank, lastUpdated: new Date().toISOString() },
  )
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [debugData, setDebugData] = useState<any>(null)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [debugLoading, setDebugLoading] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [goalReached, setGoalReached] = useState(false)
  const [showGoalAlert, setShowGoalAlert] = useState(false)
  const [showPostOrderModal, setShowPostOrderModal] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const componentMounted = useRef(false)
  const initialRenderDone = useRef(false)
  const previousRankRef = useRef<RankInfo | null>(null)

  // Only increment render count once on mount for debugging
  useEffect(() => {
    if (!initialRenderDone.current) {
      setRenderCount(1)
      initialRenderDone.current = true
    }
  }, [])

  // Debug logging for initial props - ONLY RUN ONCE
  useEffect(() => {
    console.log("🔍 OrderProgress MOUNTED with props:", {
      currentRank,
      desiredRank,
      orderId,
      serviceType,
      playerData,
      initialActualRank,
      attributes,
    })

    componentMounted.current = true

    // Check if we have actualRank in props or attributes
    if (initialActualRank) {
      console.log("📊 Setting actualRank from initialActualRank:", initialActualRank)
      setActualRank(initialActualRank)
      setLastUpdated(initialActualRank.lastUpdated || null)
      previousRankRef.current = initialActualRank
    } else if (attributes?.actualRank) {
      console.log("📊 Setting actualRank from attributes:", attributes.actualRank)
      setActualRank(attributes.actualRank)
      setLastUpdated(attributes?.lastRankUpdate || attributes.actualRank?.lastUpdated || null)
      previousRankRef.current = attributes.actualRank
    } else {
      console.log("⚠️ No actualRank found in props or attributes, using currentRank as fallback")
      // Use currentRank as a fallback
      setActualRank({
        ...currentRank,
        lastUpdated: new Date().toISOString(),
      })
      setLastUpdated(new Date().toISOString())
      previousRankRef.current = { ...currentRank }
    }

    // Cleanup function
    return () => {
      componentMounted.current = false
      console.log("🔍 OrderProgress UNMOUNTED")
    }
  }, []) // Empty dependency array means this only runs once on mount

  // Check if goal has been reached whenever actualRank changes
  useEffect(() => {
    if (actualRank && desiredRank && !goalReached) {
      const isGoalReached = checkGoalReached(actualRank, desiredRank)

      if (isGoalReached) {
        setGoalReached(true)
        setShowGoalAlert(true)
        // Show toast notification
        toast.success("🏆 Goal Reached!", {
          description: `The player has reached ${desiredRank.tier?.charAt(0).toUpperCase() + desiredRank.tier?.slice(1)} ${desiredRank.division || "I"}!`,
          duration: 5000,
        })
        
      }
    }
  }, [actualRank, desiredRank, goalReached])

  // Check for rank changes and show toast notifications
  useEffect(() => {
    if (
      previousRankRef.current?.tier &&
      actualRank?.tier &&
      (previousRankRef.current.tier !== actualRank.tier || previousRankRef.current.division !== actualRank.division)
    ) {
      // Show rank change toast
      const prevTier = previousRankRef.current.tier || ""
      const prevDiv = previousRankRef.current.division || "IV"
      const newTier = actualRank.tier || ""
      const newDiv = actualRank.division || "IV"

      const prevRankFormatted = `${prevTier.charAt(0).toUpperCase() + prevTier.slice(1)} ${prevDiv}`
      const newRankFormatted = `${newTier.charAt(0).toUpperCase() + newTier.slice(1)} ${newDiv}`

      toast.info("Rank Updated", {
        description: `Rank changed from ${prevRankFormatted} to ${newRankFormatted}`,
        duration: 3000,
      })

      // Update previous rank reference
      previousRankRef.current = { ...actualRank }
    }
  }, [actualRank])

  // Generate rank badges based on current and desired ranks
  const rankBadges = generateRankBadges(currentRank, desiredRank)
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleBadges = rankBadges.slice(activeIndex, activeIndex + 2)

  // Check if goal has been reached
  const checkGoalReached = (actual: RankInfo, desired: RankInfo): boolean => {
    if (!actual?.tier || !desired?.tier) return false

    const tiers = [
      "iron",
      "bronze",
      "silver",
      "gold",
      "platinum",
      "emerald",
      "diamond",
      "master",
      "grandmaster",
      "challenger",
    ]
    const divisions = ["IV", "III", "II", "I"]

    const actualTierIndex = tiers.indexOf(actual.tier.toLowerCase())
    const desiredTierIndex = tiers.indexOf(desired.tier.toLowerCase())

    // If actual tier is higher than desired tier
    if (actualTierIndex > desiredTierIndex) {
      return true
    }

    // If tiers are the same, check division
    if (actualTierIndex === desiredTierIndex) {
      const actualDivIndex = divisions.indexOf(actual.division || "IV")
      const desiredDivIndex = divisions.indexOf(desired.division || "I")

      // If actual division is higher or equal to desired division
      if (actualDivIndex >= desiredDivIndex) {
        // If divisions are the same, check LP
        if (actualDivIndex === desiredDivIndex) {
          return (actual.lp || 0) >= (desired.lp || 0)
        }
        return true
      }
    }

    return false
  }

  const handleRefreshOrder = async () =>{
    router.refresh();
  }
  // Handle completing the order
  const handleCompleteOrder = async () => {
    setIsCompletingOrder(true)
    toast.loading("Completing order...", { id: "complete-order" })

    try {
      console.log("Completing order:", orderId)
      console.log("Current actual rank:", actualRank)

      // Call the API to update the order status
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actualRank: actualRank,
          completedAt: new Date().toISOString(),
        }),
      })

      console.log("Complete order response status:", response.status)

      // Get the response as text first for debugging
      const responseText = await response.text()
      console.log("Complete order response text:", responseText)

      // Try to parse the response as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        toast.error("Error completing order", {
          description: "Invalid response format from server",
          id: "complete-order",
        })
        setIsCompletingOrder(false)
        return
      }

      if (response.ok) {
        // Show success toast
        toast.success("Order completed successfully!", {
          description: "The order has been marked as completed.",
          id: "complete-order",
        })

        // Close the goal alert dialog
        setShowGoalAlert(false)

        // Show the post-order modal
        setShowPostOrderModal(true)
      } else {
        // Handle error
        console.error("Error completing order:", data)
        toast.error("Failed to complete order", {
          description: data.error || data.details?.message || "An error occurred while completing the order",
          id: "complete-order",
        })
      }
    } catch (error) {
      console.error("Error completing order:", error)
      toast.error("Error completing order", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        id: "complete-order",
      })
    } finally {
      setIsCompletingOrder(false)

    }
  }

  // Fetch debug data
  const fetchDebugData = async () => {
    setDebugLoading(true)
    setDebugError(null)
    try {
      console.log("🔍 Fetching debug data for order:", orderId)
      const response = await fetch(`/api/debug/rank/${orderId}`)

      console.log("🔍 Debug response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("🔍 Debug data received:", data)
        setDebugData(data)

        // If we have actualRank in the debug data, update our state
        if (data.actualRank) {
          console.log("📊 Setting actualRank from debug data:", data.actualRank)
          setActualRank(data.actualRank)
          setLastUpdated(data.lastRankUpdate)
        }
      } else {
        const errorText = await response.text()
        console.error("🔍 Debug fetch error:", errorText)
        setDebugError(`Error ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error("🔍 Debug fetch exception:", error)
      setDebugError(String(error))
    } finally {
      setDebugLoading(false)
    }
  }

  // Fetch player data and match history from Riot API
  useEffect(() => {
    if (!playerData?.username || !playerData?.tagLine) return

    const fetchPlayerData = async () => {
      setIsLoading(true)
      try {
        // Make sure username and tagLine are strings before encoding
        const username = playerData?.username || ""
        const tagLine = playerData?.tagLine || ""
        const region = playerData?.server || "euw"
        const regionCode = getRegionCode(region)

        console.log("🎮 Fetching player data:", { username, tagLine, region, regionCode })

        // Get account info to retrieve puuid
        const accountResponse = await fetch(
          `/api/riot/league-of-legend/player-data?gameName=${encodeURIComponent(username)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&game=lol`,
        )

        if (accountResponse.ok) {
          const accountData = await accountResponse.json()
          console.log("🎮 Account data received:", accountData)
          const puuid = accountData.account?.puuid

          if (puuid) {
            // Use the provided Riot API fetch code to get rank information
            const rankResponse = await fetch(
              `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
              {
                headers: {
                  "X-Riot-Token": process.env.RIOT_API_KEY || "",
                },
              },
            )

            if (rankResponse.ok) {
              const rankData = await rankResponse.json()
              console.log("🎮 Rank data received:", rankData)

              // Find solo queue rank data
              const soloQueueData = rankData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5") || null

              if (soloQueueData) {
                // Save previous rank for comparison
                previousRankRef.current = actualRank ? { ...actualRank } : null

                // Convert Riot API format to our format
                const newActualRank = {
                  tier: soloQueueData.tier.toLowerCase(),
                  division: soloQueueData.rank,
                  lp: soloQueueData.leaguePoints,
                  lastUpdated: new Date().toISOString(),
                }

                console.log("📊 Setting actualRank from Riot API:", newActualRank)
                setActualRank(newActualRank)
                setLastUpdated(newActualRank.lastUpdated)

                // Update playerRankData for consistency
                setPlayerRankData({
                  ...accountData,
                  soloQueue: soloQueueData,
                  actualRank: newActualRank,
                  lastRankUpdate: newActualRank.lastUpdated,
                })

                // Show toast notification for successful update
                toast.success("Rank data updated", {
                  description: `Current rank: ${newActualRank.tier.charAt(0).toUpperCase() + newActualRank.tier.slice(1)} ${newActualRank.division} (${newActualRank.lp} LP)`,
                })
              }
            } else {
              console.error("🎮 Error fetching rank data:", await rankResponse.text())
              toast.error("Failed to fetch rank data", {
                description: "Could not retrieve player's rank information",
              })
            }
          }
        } else {
          console.error("🎮 Error fetching player data:", await accountResponse.text())
          toast.error("Failed to fetch player data", {
            description: "Could not retrieve player's account information",
          })
        }

        // Fetch match history
        const matchResponse = await fetch(
          `/api/riot/league-of-legend/matches?gameName=${encodeURIComponent(username)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&game=lol&count=10`,
        )

        if (matchResponse.ok) {
          const data = await matchResponse.json()
          setMatchHistory(data.matches || [])
        } else {
          console.error("🎮 Error fetching match history:", await matchResponse.text())
        }
      } catch (error) {
        console.error("🎮 Error fetching Riot API data:", error)
        toast.error("Error fetching data", {
          description: "An unexpected error occurred while fetching player data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayerData()

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchPlayerData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [playerData]) // Only re-run if playerData changes

  // Update the updateRankData function in the OrderProgress component
  const updateRankData = async () => {
    if (!playerData?.username || !playerData?.tagLine) {
      toast.warning("Missing player data", {
        description: "Username and tag line are required to update rank",
      })
      return
    }

    setIsUpdatingRank(true)
    try {
      console.log("🔄 Updating rank data for order:", orderId)
      toast.loading("Updating rank data...", { id: "rank-update" })

      // Call our endpoint using GET
      const response = await fetch(`/api/orders/${orderId}/update-progress`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("🔄 Rank update response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("🔄 Rank update response data:", data)

        // Save previous rank for comparison
        previousRankRef.current = actualRank ? { ...actualRank } : null

        // Update the actual rank with the new information
        setActualRank(data.rankData)
        setLastUpdated(data.lastUpdated)

        // Also update the player rank data for consistency
        setPlayerRankData((prev: any) => ({
          ...prev,
          soloQueue: data.rankData,
          actualRank: data.rankData,
          lastRankUpdate: data.lastUpdated,
        }))

        // Show success toast
        toast.success("Rank updated successfully", {
          description: `Current rank: ${data.rankData.tier.charAt(0).toUpperCase() + data.rankData.tier.slice(1)} ${data.rankData.division} (${data.rankData.lp} LP)`,
          id: "rank-update",
        })

        // Refresh the page to show updated data
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("🔄 Rank update error:", errorData)
        toast.error("Failed to update rank", {
          description: errorData.error || "An error occurred while updating rank data",
          id: "rank-update",
        })
      }
    } catch (error) {
      console.error("🔄 Error updating rank data:", error)
      toast.error("Error updating rank", {
        description: "An unexpected error occurred",
        id: "rank-update",
      })
    } finally {
      setIsUpdatingRank(false)
    }
  }

  // For testing - update rank with test data
  const updateWithTestRank = async () => {
    try {
      // Generate random rank data
      const tiers = ["iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond"]
      const divisions = ["IV", "III", "II", "I"]

      const randomTier = tiers[Math.floor(Math.random() * tiers.length)]
      const randomDivision = divisions[Math.floor(Math.random() * divisions.length)]
      const randomLP = Math.floor(Math.random() * 100)

      console.log("🧪 Setting test rank:", { tier: randomTier, division: randomDivision, lp: randomLP })
      toast.loading("Setting test rank...", { id: "test-rank" })

      // Call test endpoint
      const response = await fetch(
        `/api/debug/set-rank/${orderId}?tier=${randomTier}&division=${randomDivision}&lp=${randomLP}`,
        {
          method: "GET",
        },
      )

      console.log("🧪 Test rank update response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("🧪 Test rank update response:", data)

        // Save previous rank for comparison
        previousRankRef.current = actualRank ? { ...actualRank } : null

        // Update the actual rank with the test data
        setActualRank(data.rankData)
        setLastUpdated(data.lastUpdated)

        // Show success toast
        toast.success("Test rank set", {
          description: `Rank set to ${data.rankData.tier.charAt(0).toUpperCase() + data.rankData.tier.slice(1)} ${data.rankData.division} (${data.rankData.lp} LP)`,
          id: "test-rank",
        })

        // Fetch debug data to verify the update
        await fetchDebugData()

        // Refresh the page to show updated data
        router.refresh()
      } else {
        const errorText = await response.text()
        console.error("🧪 Test rank update failed:", errorText)
        toast.error("Failed to set test rank", {
          description: errorText || "An error occurred",
          id: "test-rank",
        })
      }
    } catch (error) {
      console.error("🧪 Error with test rank update:", error)
      toast.error("Error setting test rank", {
        description: "An unexpected error occurred",
        id: "test-rank",
      })
    }
  }

  // Set rank to goal for testing
  const setRankToGoal = () => {
    // Save previous rank for comparison
    previousRankRef.current = actualRank ? { ...actualRank } : null

    // Set rank to desired rank
    const goalRank = {
      ...desiredRank,
      lastUpdated: new Date().toISOString(),
    }

    setActualRank(goalRank)
    setLastUpdated(goalRank.lastUpdated)

    toast.success("Goal rank set for testing", {
      description: `Rank set to ${goalRank.tier.charAt(0).toUpperCase() + goalRank.tier.slice(1)} ${goalRank.division} (${goalRank.lp || 0} LP)`,
    })
  }

  // Calculate progress percentage based on service type
  const calculateProgress = () => {
    if (serviceType === "rank-boost") {
      // For rank boost, calculate progress through rank badges
      if (!currentRank || !desiredRank || rankBadges.length <= 1) {
        return 0
      }

      // If we have actual rank data from Riot API, use it to calculate more accurate progress
      if (actualRank) {
        const currentTier = actualRank.tier?.toLowerCase() || currentRank.tier
        const currentDiv = actualRank.division || currentRank.division || "IV"
        const currentLP = actualRank.lp || currentRank.lp || 0

        // Calculate total progress based on tiers, divisions, and LP
        const tiers = [
          "iron",
          "bronze",
          "silver",
          "gold",
          "platinum",
          "emerald",
          "diamond",
          "master",
          "grandmaster",
          "challenger",
        ]
        const divisions = ["IV", "III", "II", "I"]

        const startTierIndex = tiers.indexOf(currentRank.tier.toLowerCase())
        const startDivIndex = divisions.indexOf(currentRank.division || "IV")
        const startLP = currentRank.lp || 0

        const currentTierIndex = tiers.indexOf(currentTier.toLowerCase())
        const currentDivIndex = divisions.indexOf(currentDiv)

        const targetTierIndex = tiers.indexOf(desiredRank.tier.toLowerCase())
        const targetDivIndex = divisions.indexOf(desiredRank.division || "I")
        const targetLP = desiredRank.lp || 0

        // Calculate total steps from start to target
        const totalSteps =
          (targetTierIndex - startTierIndex) * 400 + (targetDivIndex - startDivIndex) * 100 + (targetLP - startLP)

        // Calculate current progress steps
        const currentSteps =
          (currentTierIndex - startTierIndex) * 400 + (currentDivIndex - startDivIndex) * 100 + (currentLP - startLP)

        // Calculate progress percentage
        const progressPercentage = totalSteps > 0 ? Math.min(100, Math.max(0, (currentSteps / totalSteps) * 100)) : 0

        return Math.round(progressPercentage)
      }

      // Fallback to existing calculation if no actual rank data
      // Find position in rank badges
      const currentPosition = findPositionInRankBadges(
        rankBadges,
        currentRank.tier,
        currentRank.division || "IV",
        currentRank.lp || 0,
      )
      return Math.round((currentPosition / (rankBadges.length - 1)) * 100)
    } else if (serviceType === "win-boost") {
      // For win boost, calculate completed wins
      const completedWins = matchHistory.filter((match) => match.result === "Win").length
      return Math.min(100, Math.round((completedWins / (wins || 10)) * 100))
    } else if (serviceType === "placement-boost") {
      // For placement matches, calculate completed placements
      const completedPlacements = matchHistory.slice(0, placements || 10).length
      return Math.round((completedPlacements / (placements || 10)) * 100)
    }

    return 0
  }

  const progress = calculateProgress()

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  const handleNext = () => {
    if (activeIndex + 3 < rankBadges.length) {
      setActiveIndex(activeIndex + 1)
    }
  }

  const handleAbandon = async () => {
    if (!confirm("Are you sure you want to abandon this order?")) {
      return
    }

    setIsAbandoning(true)
    toast.loading("Abandoning order...", { id: "abandon-order" })

    try {
      const response = await fetch(abandonActionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast.success("Order abandoned successfully", { id: "abandon-order" })
        router.refresh()
        router.push(`/dashboard/`)
      } else {
        const data = await response.json()
        toast.error("Failed to abandon order", {
          description: data.error || "Unknown error",
          id: "abandon-order",
        })
      }
    } catch (error) {
      console.error("Error abandoning order:", error)
      toast.error("Error abandoning order", {
        description: "An unexpected error occurred",
        id: "abandon-order",
      })
    } finally {
      setIsAbandoning(false)
    }
  }

  // Format a date string for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never"
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return "Invalid date"
    }
  }

  // Render different content based on service type
  const renderServiceContent = () => {
    if (serviceType === "rank-boost" || !serviceType) {
      return (
        <div className="relative">
          {/* Debug Panel */}
          <Accordion type="single" collapsible className="mb-6 bg-gray-900/50 rounded-lg">
            <AccordionItem value="debug">
              <AccordionTrigger className="px-4 py-2 text-sm font-mono">
                <div className="flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  Debug Panel
                  {debugError && (
                    <Badge variant="destructive" className="ml-2">
                      Error
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={fetchDebugData}
                      disabled={debugLoading}
                    >
                      {debugLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Fetch Debug Data
                        </>
                      )}
                    </Button>

                    <Button size="sm" variant="outline" className="text-xs" onClick={updateWithTestRank}>
                      Set Random Test Rank
                    </Button>
                  </div>

                  <div className="text-xs font-mono bg-black/50 p-2 rounded overflow-auto max-h-60">
                    <div>
                      <strong>Component State:</strong>
                    </div>
                    <div>Render Count: {renderCount}</div>
                    <div>Order ID: {orderId}</div>
                    <div>Current Rank: {JSON.stringify(currentRank)}</div>
                    <div>Actual Rank State: {JSON.stringify(actualRank)}</div>
                    <div>Last Updated: {lastUpdated}</div>
                    <div>Progress: {progress}%</div>
                    <div>Goal Reached: {goalReached ? "Yes" : "No"}</div>
                    <div>Initial Actual Rank: {JSON.stringify(initialActualRank)}</div>
                    <div>Attributes has actualRank: {attributes?.actualRank ? "Yes" : "No"}</div>

                    {debugError && (
                      <div className="mt-2 text-red-400">
                        <strong>Error:</strong> {debugError}
                      </div>
                    )}

                    {debugData && (
                      <div className="mt-2">
                        <strong>Debug Data:</strong>
                        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugData, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        const newRank = {
                          tier: "platinum",
                          division: "II",
                          lp: 75,
                          lastUpdated: new Date().toISOString(),
                        }
                        console.log("📊 Manually setting actualRank:", newRank)
                        setActualRank(newRank)
                        setLastUpdated(newRank.lastUpdated)
                      }}
                    >
                      Set Platinum II
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        const newRank = {
                          tier: "diamond",
                          division: "IV",
                          lp: 25,
                          lastUpdated: new Date().toISOString(),
                        }
                        console.log("📊 Manually setting actualRank:", newRank)
                        setActualRank(newRank)
                        setLastUpdated(newRank.lastUpdated)
                      }}
                    >
                      Set Diamond IV
                    </Button>

                    <Button size="sm" variant="outline" className="text-xs" onClick={setRankToGoal}>
                      Set Goal Rank
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Rank Progress Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Rank Progress</h3>
            <div className="flex items-center justify-between bg-[#1E2230] p-4 rounded-lg border border-[#2A2F3F]">
              {/* Starting Rank */}
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Starting Rank</div>
                <div
                  className="w-16 h-16 rounded-full mx-auto border border-white/10 flex items-center justify-center"
                  style={{ backgroundColor: getRankColor(currentRank.tier) }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">{currentRank.tier.toUpperCase()}</div>
                    <div className="text-xs text-white">{currentRank.division}</div>
                  </div>
                </div>
                <div className="mt-1 font-medium">
                  {currentRank.tier.charAt(0).toUpperCase() + currentRank.tier.slice(1)} {currentRank.division}
                </div>
                <div className="text-xs text-gray-400">{currentRank.lp} LP</div>
              </div>

              {/* Current Rank (from API) */}
              <div className="text-center relative">
                <div className="text-sm text-gray-400 mb-1">Current Rank</div>
                <div
                  className="w-16 h-16 rounded-full mx-auto border border-white/10 flex items-center justify-center relative"
                  style={{
                    backgroundColor: getRankColor(
                      actualRank?.tier || playerRankData?.soloQueue?.tier?.toLowerCase() || currentRank.tier,
                    ),
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">
                      {(
                        actualRank?.tier ||
                        playerRankData?.soloQueue?.tier?.toLowerCase() ||
                        currentRank.tier
                      ).toUpperCase()}
                    </div>
                    <div className="text-xs text-white">
                      {actualRank?.division || playerRankData?.soloQueue?.rank || currentRank.division}
                    </div>
                  </div>

                  {/* Update indicator */}
                  {actualRank && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                      <ArrowUp className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-1 font-medium">
                  {(actualRank?.tier || playerRankData?.soloQueue?.tier?.toLowerCase() || currentRank.tier)
                    .charAt(0)
                    .toUpperCase() +
                    (actualRank?.tier || playerRankData?.soloQueue?.tier?.toLowerCase() || currentRank.tier).slice(
                      1,
                    )}{" "}
                  {actualRank?.division || playerRankData?.soloQueue?.rank || currentRank.division}
                </div>
                <div className="text-xs text-gray-400">
                  {actualRank?.lp || playerRankData?.soloQueue?.leaguePoints || currentRank.lp} LP
                </div>

                {/* Last updated timestamp */}
                {lastUpdated && <div className="text-xs text-green-400 mt-1">Updated {formatDate(lastUpdated)}</div>}
              </div>

              {/* Target Rank */}
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Target Rank</div>
                <div
                  className="w-16 h-16 rounded-full mx-auto border border-white/10 flex items-center justify-center"
                  style={{ backgroundColor: getRankColor(desiredRank.tier) }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">{desiredRank.tier.toUpperCase()}</div>
                    <div className="text-xs text-white">{desiredRank.division || "I"}</div>
                  </div>
                </div>
                <div className="mt-1 font-medium">
                  {desiredRank.tier.charAt(0).toUpperCase() + desiredRank.tier.slice(1)} {desiredRank.division || "I"}
                </div>
                <div className="text-xs text-gray-400">{desiredRank.lp || 0} LP</div>
              </div>
            </div>
          </div>

          {/* Goal Reached Banner (if applicable) */}
          {goalReached && userRole =="CLIENT"  && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-300">Goal Reached!</h3>
                    <p className="text-sm text-gray-300">
                      The player has successfully reached{" "}
                      {desiredRank.tier.charAt(0).toUpperCase() + desiredRank.tier.slice(1)} {desiredRank.division}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20"
                    onClick={() => setShowGoalAlert(true)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleCompleteOrder}
                    disabled={isCompletingOrder}
                  >
                    {isCompletingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      "Complete Order"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rank Badges */}
          <div className="flex justify-center space-x-8 mb-8">
            {rankBadges.map((badge, index) => {
              const bgColor = getRankColor(badge.tier)

              // Highlight the badge if it matches the actual rank
              const isCurrentRank =
                actualRank &&
                badge.tier.toLowerCase() === actualRank.tier.toLowerCase() &&
                badge.division === actualRank.division

              return (
                <div key={badge.id} className="flex flex-col items-center">
                  <div
                    className={`relative w-40 h-60 rounded-xl flex flex-col items-center justify-center text-center shadow-lg border ${
                      isCurrentRank ? "border-green-500 border-2" : "border-white/10"
                    }`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="text-xl font-bold text-white">{badge.tier.toUpperCase()}</div>
                    <div className="text-lg font-semibold text-white">DIVISION {badge.division}</div>
                    <div className="mt-4 text-sm text-white">League Points</div>
                    <div className="text-xl font-bold text-white">{badge.lp}</div>

                    {/* Current position indicator */}
                    {isCurrentRank && (
                      <div className="absolute -top-3 -right-3 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Position Indicators */}
          <div className="flex justify-center space-x-12 mt-4">
            {rankBadges.map((badge, index) => (
              <div
                key={`pos-${badge.id}`}
                className="w-8 h-8 bg-[#1E2230] border border-[#2A2F3F] rounded-full flex items-center justify-center"
              >
                <span className="text-sm font-medium text-white">
                  {index === 0 ? "Start" : index === rankBadges.length - 1 ? "Goal" : "Mid"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (serviceType === "win-boost") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Win Boost Progress</div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold">
                {matchHistory.filter((match) => match.result === "Win").length} / {wins || 10} Wins
              </span>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="space-y-2">
            <div className="text-lg font-semibold">Recent Matches</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : matchHistory.length > 0 ? (
                matchHistory.slice(0, 6).map((match, index) => (
                  <div
                    key={match.matchId || index}
                    className={`p-3 rounded-lg border ${
                      match.result === "Win" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#1E2230] flex items-center justify-center overflow-hidden">
                          <img
                            src={match.championImageUrl || "/placeholder.svg?width=32&height=32"}
                            alt={match.champion || "Champion"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{match.champion || "Unknown"}</div>
                          <div className="text-xs text-gray-400">{match.kda || "0/0/0"}</div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center ${match.result === "Win" ? "text-green-400" : "text-red-400"}`}
                      >
                        {match.result === "Win" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-400">No match history available</div>
              )}
            </div>
          </div>
        </div>
      )
    } else if (serviceType === "placement-boost") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Placement Matches Progress</div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {Math.min(matchHistory.length, placements || 10)} / {placements || 10} Matches
              </span>
            </div>
          </div>

          {/* Placement Matches */}
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: placements || 10 }).map((_, index) => {
              const match = matchHistory[index]
              let status = "pending"
              if (match) {
                status = match.result === "Win" ? "win" : "loss"
              }

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      status === "pending"
                        ? "bg-[#1E2230] border-2 border-[#2A2F3F]"
                        : status === "win"
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-red-500/20 border-2 border-red-500"
                    }`}
                  >
                    {status === "pending" ? (
                      <span className="text-lg font-bold">{index + 1}</span>
                    ) : status === "win" ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {status === "pending" ? "Pending" : status === "win" ? "Win" : "Loss"}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Rank After Placements */}
          {playerRankData?.soloQueue && (
            <div className="mt-6 p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
              <div className="text-lg font-semibold mb-2">Current Rank After Placements</div>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-full border border-white/10"
                  style={{ backgroundColor: getRankColor(playerRankData.soloQueue.tier?.toLowerCase()) }}
                ></div>
                <div>
                  <div className="text-xl font-bold">{playerRankData.soloQueue.tier || "Unranked"}</div>
                  {playerRankData.soloQueue.rank && (
                    <div className="text-lg">
                      {playerRankData.soloQueue.rank} - {playerRankData.soloQueue.leaguePoints || 0} LP
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <>
      <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
        <CardHeader className="px-4 py-3 flex justify-between items-center border-b border-[#2A2F3F] bg-[#1A1E2C]">
          <div>
            <CardTitle className="text-lg font-semibold">Order Progress</CardTitle>
            {serviceType && serviceType !== "rank-boost" && (
              <div className="text-xs text-gray-400">
                {serviceType === "win-boost"
                  ? "Win Boost"
                  : serviceType === "placement-boost"
                    ? "Placement Matches"
                    : "Unknown Service Type"}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {/* Add Refresh Rank button for boosters and admins */}
            {userRole === "BOOSTER" && (
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isUpdatingRank ? undefined : handleRefreshOrder}
                    disabled={isUpdatingRank}
                    className="bg-blue-600/20 hover:bg-blue-700/30 border-blue-500/30"
                  >
                    {isUpdatingRank ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Rank
                      </>
                    )}
                  </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update the player's current rank from Riot API</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {userRole === "BOOSTER" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleAbandon}
                disabled={isAbandoning}
                className="bg-red-600 hover:bg-red-700"
              >
                {isAbandoning ? "Abandoning..." : "Abandon order"}
              </Button>
            )}

            {/* Complete Order Button */}
            {goalReached && (userRole === "CLIENT" || userRole === "ADMIN") && (
              <Button
                variant="default"
                size="sm"
                onClick={handleCompleteOrder}
                disabled={isCompletingOrder}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCompletingOrder ?  (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  "Complete Order"
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2 bg-[#0F1118]/90 px-4 py-2 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span>Loading data...</span>
              </div>
            </div>
          )}

          {renderServiceContent()}

          {/* Progress Bar - Common for all service types */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <Badge variant="outline" className="bg-[#1E2230] border-[#2A2F3F]">
                {progress}%
              </Badge>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-[#1E2230]"
              indicatorClassName={
                goalReached
                  ? "bg-gradient-to-r from-green-500 to-yellow-400"
                  : "bg-gradient-to-r from-blue-600 to-purple-600"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Goal Reached Alert Dialog */}
      {userRole =="CLIENT" && 
      <AlertDialog open={showGoalAlert} onOpenChange={setShowGoalAlert}>
        <AlertDialogContent className="bg-[#161A26] border-[#2A2F3F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-yellow-300">
              <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
              Goal Reached!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              <p className="mb-4">
                The player has successfully reached the target rank of{" "}
                <span className="font-bold text-white">
                  {desiredRank?.tier?.charAt(0).toUpperCase() + desiredRank?.tier?.slice(1)}{" "}
                  {desiredRank?.division || "I"}
                </span>
                !
              </p>

              <div className="bg-black/20 p-3 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Starting Rank:</span>
                  <span className="font-medium">
                    {currentRank?.tier?.charAt(0).toUpperCase() + currentRank?.tier?.slice(1)}{" "}
                    {currentRank?.division || "IV"} ({currentRank?.lp || 0} LP)
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Current Rank:</span>
                  <span className="font-medium text-green-400">
                    {actualRank && actualRank.tier
                      ? `${actualRank.tier.charAt(0).toUpperCase()}${actualRank.tier.slice(1)} ${actualRank.division || "IV"} (${actualRank.lp || 0} LP)`
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed On:</span>
                  <span className="font-medium">{formatDate(lastUpdated)}</span>
                </div>
              </div>

              <p>
                The order has been completed successfully. You can now mark this order as complete in your dashboard.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">Close</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCompleteOrder}
              disabled={isCompletingOrder}
            >
              {isCompletingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Mark as Complete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
}

      {/* Post-Order Modal */}
      {showPostOrderModal && userRole=="CLIENT" && (
        <PostOrderModal
          orderId={orderId}
          clientId={session?.user?.id || ""}
          boosterId={attributes?.boosterId || ""}
          onClose={() => {
            setShowPostOrderModal(false)
            // Redirect to dashboard after closing the modal
            router.refresh()
            router.push(`/dashboard/Client/orders/active?tab=completed`)
          }}
        />
      )}
    </>
  )
}


// Helper function to generate rank badges between current and desired ranks
function generateRankBadges(currentRank: RankInfo, desiredRank: RankInfo) {
  const tiers = [
    "iron",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "emerald",
    "diamond",
    "master",
    "grandmaster",
    "challenger",
  ]
  const divisions = ["IV", "III", "II", "I"]

  const badges = []

  // Ensure we have valid ranks
  if (!currentRank?.tier || !desiredRank?.tier) {
    return [
      {
        id: "current",
        tier: currentRank?.tier || "iron",
        division: currentRank?.division || "IV",
        lp: currentRank?.lp || 0,
      },
      {
        id: "desired",
        tier: desiredRank?.tier || "iron",
        division: desiredRank?.division || "IV",
        lp: desiredRank?.lp || 0,
      },
    ]
  }

  // Add current rank
  badges.push({
    id: "current",
    tier: currentRank.tier,
    division: currentRank.division || "IV",
    lp: currentRank.lp || 0,
  })

  // Calculate middle rank
  const currentTierIndex = tiers.indexOf(currentRank.tier.toLowerCase())
  const desiredTierIndex = tiers.indexOf(desiredRank.tier.toLowerCase())

  if (currentTierIndex >= 0 && desiredTierIndex >= 0) {
    // If same tier, find middle division
    if (currentTierIndex === desiredTierIndex) {
      const currentDivIndex = divisions.indexOf(currentRank.division || "IV")
      const desiredDivIndex = divisions.indexOf(desiredRank.division || "I")

      if (currentDivIndex >= 0 && desiredDivIndex >= 0) {
        const middleDivIndex = Math.floor((currentDivIndex + desiredDivIndex) / 2)
        badges.push({
          id: "middle",
          tier: currentRank.tier,
          division: divisions[middleDivIndex],
          lp: 0,
        })
      }
    } else {
      // Different tiers, find middle tier
      const middleTierIndex = Math.floor((currentTierIndex + desiredTierIndex) / 2)
      badges.push({
        id: "middle",
        tier: tiers[middleTierIndex],
        division: "II",
        lp: 0,
      })
    }
  }

  // Add desired rank
  badges.push({
    id: "desired",
    tier: desiredRank.tier,
    division: desiredRank.division || "I",
    lp: desiredRank.lp || 0,
  })

  return badges
}

// Helper function to find position in rank badges
function findPositionInRankBadges(badges: any[], tier: string, division: string, lp: number) {
  // Find exact match
  const exactMatchIndex = badges.findIndex(
    (badge) => badge.tier.toLowerCase() === tier.toLowerCase() && badge.division === division && badge.lp <= lp,
  )

  if (exactMatchIndex !== -1) {
    return exactMatchIndex
  }

  // Find closest match by tier and division
  const closestMatchIndex = badges.findIndex(
    (badge) => badge.tier.toLowerCase() === tier.toLowerCase() && badge.division === division,
  )

  if (closestMatchIndex !== -1) {
    return closestMatchIndex
  }

  // Find match by tier only
  const tierMatchIndex = badges.findIndex((badge) => badge.tier.toLowerCase() === tier.toLowerCase())

  if (tierMatchIndex !== -1) {
    return tierMatchIndex
  }

  return 0
}

// Helper function to get region code from region name
function getRegionCode(region: string): string {
  const regionMapping: Record<string, string> = {
    euw: "euw1",
    eune: "eun1",
    na: "na1",
    kr: "kr",
    br: "br1",
    jp: "jp1",
    ru: "ru",
    tr: "tr1",
    lan: "la1",
    las: "la2",
    oce: "oc1",
  }

  return regionMapping[region.toLowerCase()] || "euw1"
}
