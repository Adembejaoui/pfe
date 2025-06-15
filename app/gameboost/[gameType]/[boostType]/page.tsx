"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import PlayerRankSearch from "@/components/elements/boost/PlayerRankSearch"
import RankSelector from "@/components/elements/boost/RankSelector"
import WinSelector from "@/components/elements/boost/WinSelector"
import PlacementSelector from "@/components/elements/boost/PlacementSelector"
import ServerSelector from "@/components/elements/boost/ServerSelector"
import EnhancedBoostOptions from "@/components/elements/boost/EnhancedBoostOptions"
import OrderSummary from "@/components/elements/boost/OrderSummary"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getRouteParam } from "@/lib/route-utils"
import Rlayout from "@/app/gameboost/Rlayout"
import { useSession } from "next-auth/react"
import { calculateBasePrice, calculateFinalPrice, getBoostTypeBySlug, getGameConfigBySlug } from "@/lib/game-config"

export default function BoostOrderPage() {
  const params = useParams()
  const router = useRouter()
  const gameType = getRouteParam(params, "gameType")
  const boostType = getRouteParam(params, "boostType")


  // State for game and boost type data
  const [gameConfig, setGameConfig] = useState<any>(null)
  const [boostTypeConfig, setBoostTypeConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State for player rank data
  const [rankData, setRankData] = useState<any>(null)

  // State to control search visibility
  const [showSearch, setShowSearch] = useState<boolean>(true)

  // State for server selection
  const [selectedServer, setSelectedServer] = useState<string>("")

  // State for rank selection
  const [currentRank, setCurrentRank] = useState<{ tier: string; division?: string; lp?: number }>({
    tier: "",
    division: "",
    lp: 0,
  })

  const [desiredRank, setDesiredRank] = useState<{ tier: string; division?: string }>({
    tier: "",
    division: "",
  })

  // State for win and placement selection
  const [wins, setWins] = useState<number>(10)
  const [placements, setPlacements] = useState<number>(10)

  // State for additional options
  const [options, setOptions] = useState<Record<string, boolean>>({
    vipBooster: false,
    voiceDuo: false,
    priority: false,
    ghostDuo: false,
    streamGames: false,
  })

  // State for price calculation
  const [basePrice, setBasePrice] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Fetch game and boost type data from the database
  useEffect(() => {
    async function fetchGameData() {
      if (!gameType || !boostType) {
        router.push("/gameboost")
        return
      }

      try {
        setLoading(true)

        // Fetch game configuration
        const gameData = await getGameConfigBySlug(gameType)

        if (!gameData) {
          throw new Error("Game not found")
        }

        console.log("Game config loaded:", gameData)
        setGameConfig(gameData)

        // Initialize options state based on available options
        if (gameData.options) {
          const initialOptions: Record<string, boolean> = {}
          Object.keys(gameData.options).forEach((key) => {
            initialOptions[key] = false
          })
          setOptions(initialOptions)
        }

        // Fetch boost type configuration
        const boostTypeData = await getBoostTypeBySlug(gameType, boostType)

        if (!boostTypeData) {
          throw new Error("Boost type not found")
        }

        console.log("Boost type loaded:", boostTypeData)
        setBoostTypeConfig(boostTypeData)

        // Initialize server selection
        if (gameData.servers && gameData.servers.length > 0) {
          setSelectedServer(gameData.servers[0].id)
        }

        // Initialize rank selection if rank tiers exist
        if (gameData.rankTiers && gameData.rankTiers.length > 0) {
          const firstTier = gameData.rankTiers[0]
          const lastTier = gameData.rankTiers[Math.min(3, gameData.rankTiers.length - 1)]

          setCurrentRank({
            tier: firstTier.id,
            division: firstTier.divisions?.[0],
            lp: 0,
          })

          setDesiredRank({
            tier: lastTier.id,
            division: lastTier.divisions?.[0],
          })
        }

        // Calculate initial prices
        if (boostTypeData) {
          // Set a default base price from the boost type config
          const initialBasePrice = boostTypeData.basePrice || 0
          setBasePrice(initialBasePrice)
          setFinalPrice(initialBasePrice)

          console.log("Initial base price set to:", initialBasePrice)
        }
      } catch (error) {
        console.error("Error fetching game data:", error)
        toast.error("Failed to load game data")
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [gameType, boostType, router])

  // Handle option change
  const handleOptionChange = (key: string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Handle rank data found
  const handleRankFound = (data: any) => {
    setRankData(data)

    // If we have tier information, update the current rank
    if (data.tier && gameConfig?.rankTiers) {
      // Find the matching tier in our configuration
      const tierObj = gameConfig.rankTiers.find(
        (t: any) => t.id.toLowerCase() === data.tier.toLowerCase() || t.name.toLowerCase() === data.tier.toLowerCase(),
      )

      if (tierObj) {
        setCurrentRank({
          tier: tierObj.id,
          division: data.division || tierObj.divisions?.[0],
          lp: data.lp || 0,
        })
      }
    }
  }

  // Handle search completion
  const handleSearchComplete = () => {
    setShowSearch(false)
  }

  // Reset search to try again
  const handleResetSearch = () => {
    setShowSearch(true)
    setRankData(null)
  }

  // Calculate prices when relevant inputs change
  useEffect(() => {
    if (!gameConfig || !boostTypeConfig) return

    console.log("Calculating prices with:", {
      currentRank,
      desiredRank,
      wins,
      placements,
      boostTypeConfig,
    })

    // Check if the boost type has the necessary price factors
    if (boostTypeConfig.slug === "rank-boost" && !boostTypeConfig.pricePerTier) {
      console.warn("Missing pricePerTier for rank boost:", boostTypeConfig)
      // Set a default value if missing
      boostTypeConfig.pricePerTier = 10
    }

    if (boostTypeConfig.slug === "win-boost" && !boostTypeConfig.pricePerWin) {
      console.warn("Missing pricePerWin for win boost:", boostTypeConfig)
      // Set a default value if missing
      boostTypeConfig.pricePerWin = 5
    }

    if (boostTypeConfig.slug === "placement-boost" && !boostTypeConfig.pricePerPlacement) {
      console.warn("Missing pricePerPlacement for placement boost:", boostTypeConfig)
      // Set a default value if missing
      boostTypeConfig.pricePerPlacement = 3
    }

    const base = calculateBasePrice(gameConfig, boostTypeConfig, currentRank, desiredRank, wins, placements)
    console.log("Calculated base price:", base)
    setBasePrice(base)

    const final = calculateFinalPrice(base, options, gameConfig)
    console.log("Calculated final price:", final)
    setFinalPrice(final)
  }, [gameConfig, boostTypeConfig, currentRank, desiredRank, wins, placements, options])

  const handleSubmitOrder = async () => {
    if (!gameConfig || !boostTypeConfig) {
      toast.error("Invalid game or boost type configuration")
      return
    }

    if (finalPrice <= 0) {
      toast.error("Invalid order price")
      return
    }

    if (boostTypeConfig.options?.currentRank && !rankData) {
      toast.error("Please search for your account first")
      setShowSearch(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Simplified order attributes structure
      const orderAttributes: any = {
        // Always include server and options
        server: selectedServer,
        options,
        // Include player info from rankData
        playerInfo: {
          username: rankData?.username || null,
          tagLine: rankData?.tagLine || null,
        },
      }

      // Add current rank information if it exists (needed for all boost types)
      if (currentRank && currentRank.tier) {
        orderAttributes.currentRank = {
          tier: currentRank.tier,
          division: currentRank.division || "",
          lp: currentRank.lp || 0,
        }
      }
      orderAttributes.actualRank = {
          ...orderAttributes.currentRank,
          lastUpdated: new Date().toISOString(),
        }
      

      // Add attributes based on boost type
      const boostTypeSlug = boostTypeConfig.slug || ""

      // For rank boost, add desired rank
      if (boostTypeSlug === "rank-boost" && desiredRank && desiredRank.tier) {
        orderAttributes.desiredRank = {
          tier: desiredRank.tier,
          division: desiredRank.division || "",

          
        }
      }

      // For win boost, add wins
      if (boostTypeSlug === "win-boost" && typeof wins === "number") {
        orderAttributes.wins = wins
      }

      // For placement boost, add placements
      if (boostTypeSlug === "placement-boost" && typeof placements === "number") {
        orderAttributes.placements = placements
      }

      // Log the attributes for debugging
      console.log("Boost type:", boostTypeSlug)
      console.log("Order attributes:", JSON.stringify(orderAttributes, null, 2))

      const payload = {
        gameId: Number.parseInt(gameConfig.id, 10),
        gameTypeId: boostTypeConfig.slug || boostTypeConfig.id,
        price: finalPrice,
        attributes: orderAttributes,
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = `Error ${response.status}`
        const ct = response.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const err = await response.json().catch(() => null)
          if (err?.error) message = err.error
        } else {
          const txt = await response.text().catch(() => "")
          if (txt) message = txt
        }
        throw new Error(message)
      }

      const data = await response.json().catch(() => null)
      toast.success("Order placed successfully!")
      router.push("/dashboard/Client/orders/active")
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If loading, show loading state
  if (loading) {
    return (
      <Rlayout>
        <div className="relative min-h-screen text-white">
          <div className="absolute inset-0 bg-[#0f0f1a]"></div>
          <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl">Loading boost options...</p>
            </div>
          </div>
        </div>
      </Rlayout>
    )
  }

  // If game config is not found, show error
  if (!gameConfig || !boostTypeConfig) {
    return (
      <Rlayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Game or Boost Type</h1>
          <p className="mb-4">The requested game or boost type does not exist.</p>
          <Link href="/gameboost" className="text-blue-400 hover:text-blue-300">
            Return to Games
          </Link>
        </div>
      </Rlayout>
    )
  }

  // Get tier images for the current game
  const tierImages: Record<string, string> = {}
  if (gameConfig.rankTiers) {
    gameConfig.rankTiers.forEach((tier: any) => {
      tierImages[tier.name] = tier.image
    })
  }

  return (
    <Rlayout>
      <div className="relative min-h-screen text-white">
        {/* Background image */}
        <div className="absolute inset-0 bg-[#0f0f1a]">
          {gameConfig.imageUrl && (
            <Image
              src={gameConfig.imageUrl || "/placeholder.svg?height=400&width=600"}
              alt={gameConfig.name}
              fill
              className="object-cover opacity-20"
              unoptimized
            />
          )}
        </div>

        {/* Overlay content */}
        <div className="relative z-10 p-6">
          {/* Back navigation */}
          <Link
            href={`/gameboost/${gameType}`}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {gameConfig.name}
          </Link>

          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
              {gameConfig.name} - {boostTypeConfig.name}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Player rank and options */}
              <div className="lg:col-span-2 space-y-6">
                {/* Player rank search - only show if showSearch is true */}
                {showSearch ? (
                  <PlayerRankSearch
                    onRankFound={handleRankFound}
                    server={selectedServer}
                    gameType={gameType as any}
                    onSearchComplete={handleSearchComplete}
                  />
                ) : (
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetSearch}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Change Account
                    </Button>
                  </div>
                )}

                {/* Boost options */}
                <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4">Boost Details</h3>

                  <div className="space-y-4">
                    {/* Server selection - always show this */}
                    {gameConfig.servers && (
                      <ServerSelector
                        servers={gameConfig.servers}
                        value={selectedServer}
                        onChange={setSelectedServer}
                      />
                    )}

                    {gameConfig.rankTiers && (
                      <div className={rankData ? "opacity-80 pointer-events-none" : ""}>
                        <RankSelector
                          label="Current Rank"
                          rankTiers={gameConfig.rankTiers}
                          value={currentRank}
                          onChange={setCurrentRank}
                          lpValue={currentRank.lp || 0}
                          onLpChange={(lp) => setCurrentRank({ ...currentRank, lp })}
                          isDisabled={!!rankData}
                          playerData={rankData}
                        />
                      </div>
                    )}

                    {/* Desired Rank selection - only for rank boost */}
                    {boostTypeConfig.slug === "rank-boost" && gameConfig.rankTiers && (
                      <RankSelector
                        label="Desired Rank"
                        rankTiers={gameConfig.rankTiers}
                        value={desiredRank}
                        onChange={setDesiredRank}
                        isDisabled={false}
                      />
                    )}

                    {/* Win selection for win boost */}
                    {boostTypeConfig.slug === "win-boost" && <WinSelector value={wins} onChange={setWins} />}

                    {/* Placement selection for placement boost */}
                    {boostTypeConfig.options?.placements && (
                      <PlacementSelector value={placements} onChange={setPlacements} />
                    )}
                  </div>
                </div>

                {/* Additional options */}
                <EnhancedBoostOptions options={options} onOptionChange={handleOptionChange} gameConfig={gameConfig} />
              </div>

              {/* Right column - Order summary */}
              <div>
                <OrderSummary
                  gameConfig={gameConfig}
                  boostType={boostType || ""} 
                  currentRank={boostTypeConfig.options?.currentRank ? currentRank : undefined}
                  desiredRank={boostTypeConfig.options?.desiredRank ? desiredRank : undefined}
                  wins={boostTypeConfig.options?.wins ? wins : undefined}
                  placements={boostTypeConfig.options?.placements ? placements : undefined}
                  server={rankData?.server || selectedServer}
                  options={options}
                  basePrice={basePrice}
                  finalPrice={finalPrice}
                  onSubmit={handleSubmitOrder}
                  isSubmitting={isSubmitting}
                  requiresAccount={boostTypeConfig.options?.currentRank && !rankData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Rlayout>
  )
}
