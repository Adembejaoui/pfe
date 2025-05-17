import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseGameTypes } from "@/lib/db"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInitials(name: string): string {
  if (!name) return "U"

  const parts = name.split(" ")
  if (parts.length === 1) return name.substring(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}


export function formatGameRank(rank: string, tier: string, division: string, lp: number) {
  return `${rank} ${tier} ${division} (${lp} LP)`
}

export function calculateProgress(currentRank: any, targetRank: any) {
  // This is a simplified example - in a real app, you'd have a more complex calculation
  // based on the actual ranks, tiers, divisions, and LP

  const ranks = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"]
  const divisions = ["IV", "III", "II", "I"]

  const currentRankIndex = ranks.indexOf(currentRank.rank)
  const targetRankIndex = ranks.indexOf(targetRank.rank)

  const currentDivIndex = divisions.indexOf(currentRank.division)
  const targetDivIndex = divisions.indexOf(targetRank.division)

  const totalSteps = (targetRankIndex - currentRankIndex) * divisions.length + (targetDivIndex - currentDivIndex)

  const currentLP = currentRank.lp || 0
  const lpProgress = currentLP / 100

  // Calculate progress percentage
  const progress = Math.min(
    100,
    Math.max(
      0,
      ((currentRankIndex * divisions.length + currentDivIndex + lpProgress) /
        (targetRankIndex * divisions.length + targetDivIndex)) *
        100,
    ),
  )

  return Math.round(progress)
}

export function getGameTypeOptions(game: any, gameTypeId: string) {
  if (!game || !game.gameTypes) return {}

  const gameTypes = parseGameTypes(game.gameTypes, [])
  const gameType = Array.isArray(gameTypes)
    ? gameTypes.find((gt) => gt.id === gameTypeId || gt.slug === gameTypeId)
    : gameTypes

  return gameType?.options || {}
}

export function formatOrderAttributes(order: any) {
  if (!order || !order.attributes) return {}

  const attributes = typeof order.attributes === "string" ? JSON.parse(order.attributes) : order.attributes

  return {
    server: attributes.server || "Unknown",
    platform: attributes.platform || "Unknown",
    currentRank: attributes.currentRank
      ? formatGameRank(
          attributes.currentRank.rank,
          attributes.currentRank.tier,
          attributes.currentRank.division,
          attributes.currentRank.lp,
        )
      : "Unknown",
    targetRank: attributes.targetRank
      ? formatGameRank(
          attributes.targetRank.rank,
          attributes.targetRank.tier,
          attributes.targetRank.division,
          attributes.targetRank.lp,
        )
      : "Unknown",
    roles: {
      main: attributes.roles?.main || "ANY",
      secondary: attributes.roles?.secondary || "ANY",
    },
    playerData: {
      username: attributes.playerData?.username || "Unknown",
      password: "•••••••••",
    },
  }
}
