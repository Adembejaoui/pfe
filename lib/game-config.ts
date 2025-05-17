// Types
export interface RankTier {
  id: string
  name: string
  image: string
  divisions?: string[]
  lp?: boolean
}

export interface Server {
  id: string
  name: string
}

export interface BoostType {
  id: string
  slug: string
  name: string
  description?: string
  basePrice: number
  options: {
    currentRank?: boolean
    desiredRank?: boolean
    wins?: boolean
    placements?: boolean
  }
  pricePerTier?: number
  pricePerDivision?: number
  pricePerWin?: number
  pricePerPlacement?: number
}

export interface GameConfig {
  id: string
  slug: string
  name: string
  description?: string
  imageUrl?: string
  rankTiers: RankTier[]
  servers: Server[]
  gameTypes?: any[]
  boostTypes?: BoostType[]
  options?: Record<
    string,
    {
      name: string
      description?: string
      priceMultiplier: number
    }
  >
  attributes?: any
}

/**
 * Gets a game configuration by slug from fetched data
 * @param gameSlug The slug of the game to retrieve
 * @returns The game configuration or undefined if not found
 */
export async function getGameConfigBySlug(gameSlug: string | string[] | undefined): Promise<GameConfig | undefined> {
  if (!gameSlug) return undefined

  const slug = Array.isArray(gameSlug) ? gameSlug[0] : gameSlug

  try {
    // Fetch game data from the API
    const response = await fetch(`/api/games/by-slug/${slug}`)
    if (!response.ok) {
      throw new Error("Game not found")
    }

    const gameData = await response.json()
    console.log("Raw game data:", gameData.data)

    // Parse game attributes from JSON if needed
    let gameAttributes = gameData.data.attributes || {}
    if (typeof gameAttributes === "string") {
      try {
        gameAttributes = JSON.parse(gameAttributes)
      } catch (e) {
        console.error("Error parsing game attributes:", e)
        gameAttributes = {}
      }
    }

    console.log("Parsed game attributes:", gameAttributes)

    // Parse game types from the database
    let gameTypesData = []

    // Check if gameTypes exists and parse it properly
    if (gameData.data.gameTypes) {
      // If it's already an array, use it directly
      if (Array.isArray(gameData.data.gameTypes)) {
        gameTypesData = gameData.data.gameTypes
      }
      // If it's a string, try to parse it as JSON
      else if (typeof gameData.data.gameTypes === "string") {
        try {
          const parsed = JSON.parse(gameData.data.gameTypes)
          gameTypesData = Array.isArray(parsed) ? parsed : [parsed]
        } catch (e) {
          console.error("Error parsing game types:", e)
        }
      }
      // If it's an object, convert it to an array if needed
      else if (typeof gameData.data.gameTypes === "object") {
        gameTypesData = [gameData.data.gameTypes]
      }
    }

    // Ensure each game type has proper options structure
    gameTypesData = gameTypesData.map((gameType: any) => {
      // Ensure options object exists
      if (!gameType.options) {
        gameType.options = {}
      }

      // Convert string "No"/"Yes" values to boolean
      for (const key in gameType.options) {
        if (typeof gameType.options[key] === "string") {
          if (gameType.options[key].toLowerCase() === "no") {
            gameType.options[key] = false
          } else if (gameType.options[key].toLowerCase() === "yes") {
            gameType.options[key] = true
          }
        }
      }

      // Set default options based on game type
      if (
        gameType.id === "rank-boost" ||
        gameType.slug === "rank-boost" ||
        gameType.name === "Rank Boost" ||
        gameType.name === "Rank boost"
      ) {
        gameType.options.currentRank = true
        gameType.options.desiredRank = true
      } else if (
        gameType.id === "win-boost" ||
        gameType.slug === "win-boost" ||
        gameType.name === "Win Boost" ||
        gameType.name === "Win boost"
      ) {
        gameType.options.currentRank = true
        gameType.options.wins = true
      } else if (
        gameType.id === "placement-boost" ||
        gameType.slug === "placement-boost" ||
        gameType.name === "Placement Boost" ||
        gameType.name === "Placement boost"
      ) {
        gameType.options.currentRank = true
        gameType.options.placements = true
      }

      return gameType
    })

    // Format the data to match our GameConfig interface
    const formattedGameConfig: GameConfig = {
      ...gameData.data,
      gameTypes: gameTypesData,
      // Use the actual attributes from the database instead of defaults
      rankTiers: gameAttributes.rankTiers || [],
      servers: gameAttributes.servers || [],
      options: gameAttributes.options || {},
      attributes: gameAttributes,
    }

    console.log("Formatted game config:", formattedGameConfig)
    return formattedGameConfig
  } catch (error) {
    console.error("Error fetching game data:", error)
    return undefined
  }
}

/**
 * Gets a boost type by slug from a game configuration
 * @param gameSlug The slug of the game
 * @param boostTypeSlug The slug of the boost type
 * @returns The boost type configuration or undefined if not found
 */
export async function getBoostTypeBySlug(
  gameSlug: string | string[] | undefined,
  boostTypeSlug: string | string[] | undefined,
): Promise<BoostType | undefined> {
  if (!gameSlug || !boostTypeSlug) return undefined

  const typeSlug = Array.isArray(boostTypeSlug) ? boostTypeSlug[0] : boostTypeSlug

  try {
    const gameConfig = await getGameConfigBySlug(gameSlug)
    if (!gameConfig) return undefined

    // Find the boost type in the game types array
    const boostType = gameConfig.gameTypes?.find((type) => type.slug === typeSlug || type.id === typeSlug)

    if (!boostType) return undefined

    // Format the boost type to match our BoostType interface
    const formattedBoostType: BoostType = {
      id: boostType.id,
      slug: boostType.slug,
      name: boostType.name,
      description: boostType.description,
      basePrice: boostType.basePrice || 20,
      options: boostType.options || {},
      pricePerTier: boostType.pricePerTier,
      pricePerDivision: boostType.pricePerDivision,
      pricePerWin: boostType.pricePerWin,
      pricePerPlacement: boostType.pricePerPlacement,
    }

    // Log the formatted boost type for debugging
    console.log("Formatted boost type:", formattedBoostType)

    return formattedBoostType
  } catch (error) {
    console.error("Error getting boost type:", error)
    return undefined
  }
}

/**
 * Calculates the base price for a boost based on the selected options
 * @param gameConfig The game configuration
 * @param boostTypeConfig The boost type configuration
 * @param currentRank The current rank selection
 * @param desiredRank The desired rank selection
 * @param wins The number of wins selected
 * @param placements The number of placements selected
 * @returns The calculated base price
 */
export function calculateBasePrice(
  gameConfig: GameConfig | undefined,
  boostTypeConfig: BoostType | undefined,
  currentRank?: { tier: string; division?: string; lp?: number },
  desiredRank?: { tier: string; division?: string },
  wins?: number,
  placements?: number,
): number {
  if (!gameConfig || !boostTypeConfig) return 0

  let basePrice = boostTypeConfig.basePrice || 0

  // Calculate price based on rank difference
  if (currentRank && desiredRank && boostTypeConfig.options.currentRank && boostTypeConfig.options.desiredRank) {
    const currentTierIndex = gameConfig.rankTiers.findIndex((t) => t.id === currentRank.tier)
    const desiredTierIndex = gameConfig.rankTiers.findIndex((t) => t.id === desiredRank.tier)

    if (currentTierIndex >= 0 && desiredTierIndex >= 0) {
      // Price increases with rank difference
      const tierDifference = desiredTierIndex - currentTierIndex
      if (tierDifference > 0) {
        basePrice += tierDifference * (boostTypeConfig.pricePerTier || 0)
      }

      // Division difference within same tier
      if (tierDifference === 0 && currentRank.division && desiredRank.division) {
        const currentTier = gameConfig.rankTiers[currentTierIndex]
        if (currentTier.divisions) {
          const currentDivIndex = currentTier.divisions.indexOf(currentRank.division)
          const desiredDivIndex = currentTier.divisions.indexOf(desiredRank.division)

          if (currentDivIndex >= 0 && desiredDivIndex >= 0) {
            const divDifference = currentDivIndex - desiredDivIndex
            if (divDifference > 0) {
              basePrice += divDifference * (boostTypeConfig.pricePerDivision || 0)
            }
          }
        }
      }
    }
  }

  // Add price for wins
  if (wins !== undefined && boostTypeConfig.options.wins) {
    basePrice += wins * (boostTypeConfig.pricePerWin || 0)
  }

  // Add price for placements
  if (placements !== undefined && boostTypeConfig.options.placements) {
    basePrice += placements * (boostTypeConfig.pricePerPlacement || 0)
  }

  return basePrice
}

/**
 * Calculates the final price after applying option modifiers
 * @param basePrice The base price
 * @param options The selected options
 * @param gameConfig The game configuration
 * @returns The calculated final price
 */
export function calculateFinalPrice(
  basePrice: number,
  options: Record<string, boolean>,
  gameConfig?: GameConfig,
): number {
  if (!gameConfig || !gameConfig.options) return basePrice

  let finalPrice = basePrice

  // Apply option modifiers
  Object.entries(options).forEach(([key, isSelected]) => {
    if (isSelected && gameConfig.options && gameConfig.options[key]) {
      finalPrice *= gameConfig.options[key].priceMultiplier
    }
  })

  // Apply any standard discount (e.g., 5%)
  const discount = 0.05
  finalPrice = finalPrice * (1 - discount)

  return finalPrice
}
