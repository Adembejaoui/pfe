"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface OrderSummaryProps {
  gameConfig: any
  boostType: string
  currentRank?: { tier: string; division?: string; lp?: number }
  desiredRank?: { tier: string; division?: string }
  wins?: number
  placements?: number
  server: string
  options: Record<string, boolean>
  basePrice: number
  finalPrice: number
  onSubmit: () => void
  isSubmitting: boolean
  requiresAccount?: boolean
}

export default function OrderSummary({
  gameConfig,
  boostType,
  currentRank,
  desiredRank,
  wins,
  placements,
  server,
  options,
  basePrice,
  finalPrice,
  onSubmit,
  isSubmitting,
  requiresAccount,
}: OrderSummaryProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Get server name from server ID
  const getServerName = () => {
    if (!gameConfig.servers) return server
    const serverObj = gameConfig.servers.find((s: any) => s.id === server)
    return serverObj ? serverObj.name : server
  }

  // Get tier name from tier ID
  const getTierName = (tierId: string, division?: string) => {
    if (!gameConfig.rankTiers) return tierId
    const tierObj = gameConfig.rankTiers.find((t: any) => t.id === tierId)
    if (!tierObj) return tierId
    return division ? `${tierObj.name} ${division}` : tierObj.name
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
  }

  // Ensure prices are valid numbers
  const displayBasePrice = typeof basePrice === "number" && !isNaN(basePrice) ? basePrice : 0
  const displayFinalPrice = typeof finalPrice === "number" && !isNaN(finalPrice) ? finalPrice : 0

  return (
    <Card className="bg-[#1a1a2e] border-[#333355] text-white">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription className="text-gray-400">Review your boost details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game and boost type */}
        <div>
          <p className="text-sm text-gray-400">Game</p>
          <p className="font-medium">{gameConfig.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Boost Type</p>
          <p className="font-medium">{boostType}</p>
        </div>

        {/* Server */}
        <div>
          <p className="text-sm text-gray-400">Server</p>
          <p className="font-medium">{getServerName()}</p>
        </div>

        {/* Current Rank */}
        {currentRank && (
          <div>
            <p className="text-sm text-gray-400">Current Rank</p>
            <p className="font-medium">
              {getTierName(currentRank.tier, currentRank.division)}
              {currentRank.lp !== undefined && ` (${currentRank.lp} LP)`}
            </p>
          </div>
        )}

        {/* Desired Rank */}
        {desiredRank && (
          <div>
            <p className="text-sm text-gray-400">Desired Rank</p>
            <p className="font-medium">{getTierName(desiredRank.tier, desiredRank.division)}</p>
          </div>
        )}

        {/* Wins */}
        {wins !== undefined && (
          <div>
            <p className="text-sm text-gray-400">Wins</p>
            <p className="font-medium">{wins}</p>
          </div>
        )}

        {/* Placements */}
        {placements !== undefined && (
          <div>
            <p className="text-sm text-gray-400">Placement Matches</p>
            <p className="font-medium">{placements}</p>
          </div>
        )}

        {/* Options */}
        {Object.keys(options).filter((key) => options[key]).length > 0 && (
          <div>
            <p className="text-sm text-gray-400">Additional Options</p>
            <ul className="list-disc list-inside">
              {Object.keys(options)
                .filter((key) => options[key])
                .map((key) => (
                  <li key={key} className="font-medium">
                    {gameConfig.options?.[key]?.name || key}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <Separator className="bg-[#333355]" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-gray-400">Base Price</p>
            <p>${displayBasePrice.toFixed(2)}</p>
          </div>

          {Object.keys(options)
            .filter((key) => options[key])
            .map((key) => {
              const option = gameConfig.options?.[key]
              if (!option) return null

              // Calculate the price impact of this option
              const baseWithoutDiscount = displayBasePrice / 0.95 // Remove standard discount
              const priceWithOption = baseWithoutDiscount * option.priceMultiplier
              const priceDifference = priceWithOption - baseWithoutDiscount

              return (
                <div key={key} className="flex justify-between">
                  <p className="text-gray-400">{option.name}</p>
                  <p>+${priceDifference.toFixed(2)}</p>
                </div>
              )
            })}

          {/* Show standard discount */}
          <div className="flex justify-between text-green-500">
            <p>Standard Discount (5%)</p>
            <p>-${((displayFinalPrice * 0.05) / 0.95).toFixed(2)}</p>
          </div>

          <div className="flex justify-between font-bold text-lg pt-2">
            <p>Total</p>
            <p>${displayFinalPrice.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {status === "authenticated" ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || requiresAccount || displayFinalPrice <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : requiresAccount ? (
              "Please search for your account first"
            ) : displayFinalPrice <= 0 ? (
              "Invalid price - please try again"
            ) : (
              "Place Order"
            )}
          </Button>
        ) : (
          <Button onClick={handleLoginRedirect} className="w-full bg-blue-600 hover:bg-blue-700">
            Login to Place Order
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
