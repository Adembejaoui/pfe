import { PrismaClient } from "@prisma/client"

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

// Helper function to parse game types from JSON
export function parseGameTypes(gameTypesJson: any, defaultValue: any[] = []) {
  if (!gameTypesJson) return defaultValue

  try {
    // If it's already an array, return it
    if (Array.isArray(gameTypesJson)) {
      // Fix options structure for each game type
      return gameTypesJson.map(fixGameTypeOptions)
    }

    // If it's a string, try to parse it
    if (typeof gameTypesJson === "string") {
      const parsed = JSON.parse(gameTypesJson)

      // If it's an array, fix each item
      if (Array.isArray(parsed)) {
        return parsed.map(fixGameTypeOptions)
      }

      // If it's an object with rankTiers, servers, etc., extract the boost types
      if (parsed && typeof parsed === "object") {
        const boostTypes = Object.keys(parsed)
          .filter((key) => typeof parsed[key] === "object" && parsed[key].id && parsed[key].name)
          .map((key) => parsed[key])

        if (boostTypes.length > 0) {
          return boostTypes.map(fixGameTypeOptions)
        }

        // Return the whole object with fixed options
        return fixGameTypeOptions(parsed)
      }

      return parsed
    }

    // If it's an object, return it as is with fixed options
    return fixGameTypeOptions(gameTypesJson)
  } catch (error) {
    console.error("Error parsing game types:", error)
    return defaultValue
  }
}

// Helper function to fix game type options
function fixGameTypeOptions(gameType: any) {
  if (!gameType || typeof gameType !== "object") return gameType

  // Make a deep copy
  const fixedGameType = JSON.parse(JSON.stringify(gameType))

  // Ensure options object exists
  if (!fixedGameType.options) {
    fixedGameType.options = {}
  }

  // Convert string "No" values to boolean false
  // Convert string "Yes" values to boolean true
  for (const key in fixedGameType.options) {
    if (typeof fixedGameType.options[key] === "string") {
      if (fixedGameType.options[key].toLowerCase() === "no") {
        fixedGameType.options[key] = false
      } else if (fixedGameType.options[key].toLowerCase() === "yes") {
        fixedGameType.options[key] = true
      }
    }
  }

  // Set default options based on game type ID or slug
  if (
    fixedGameType.id === "rank-boost" ||
    fixedGameType.slug === "rank-boost" ||
    fixedGameType.name === "Rank Boost" ||
    fixedGameType.name === "Rank boost"
  ) {
    fixedGameType.options.currentRank = true
    fixedGameType.options.desiredRank = true
  } else if (
    fixedGameType.id === "win-boost" ||
    fixedGameType.slug === "win-boost" ||
    fixedGameType.name === "Win Boost" ||
    fixedGameType.name === "Win boost"
  ) {
    fixedGameType.options.currentRank = true
    fixedGameType.options.wins = true
  } else if (
    fixedGameType.id === "placement-boost" ||
    fixedGameType.slug === "placement-boost" ||
    fixedGameType.name === "Placement Boost" ||
    fixedGameType.name === "Placement boost"
  ) {
    fixedGameType.options.currentRank = true
    fixedGameType.options.placements = true
  }

  return fixedGameType
}

// Helper function to parse game attributes from JSON
export function parseGameAttributes(attributesJson: any, defaultValue: any = {}) {
  if (!attributesJson) return defaultValue

  try {
    // If it's already an object, return it
    if (typeof attributesJson === "object" && !Array.isArray(attributesJson)) return attributesJson

    // If it's a string, try to parse it
    if (typeof attributesJson === "string") {
      return JSON.parse(attributesJson)
    }

    // Otherwise, return the default value
    return defaultValue
  } catch (error) {
    console.error("Error parsing game attributes:", error)
    return defaultValue
  }
}
