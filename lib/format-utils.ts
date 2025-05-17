export function formatRank(rank: { tier?: string; division?: string; lp?: number }) {
    if (!rank) return "Unknown"
  
    const tier = rank.tier ? rank.tier.charAt(0).toUpperCase() + rank.tier.slice(1) : ""
    const division = rank.division || ""
    const lp = typeof rank.lp === "number" ? `${rank.lp} LP` : ""
  
    return `${tier} ${division} ${lp}`.trim()
  }
  
  export function getRankColor(tier: string): string {
    const tierColors: Record<string, string> = {
      iron: "#5d5d5d",
      bronze: "#7a5230",
      silver: "#a0a9b8",
      gold: "#edb14c",
      platinum: "#3d9e9e",
      emerald: "#008f83",
      diamond: "#5383e8",
      master: "#9d3fb5",
      grandmaster: "#e84057",
      challenger: "#f4c873",
    }
  
    return tierColors[tier?.toLowerCase()] || "#5d5d5d"
  }
  
  export function formatWinRate(wins: number, losses: number): string {
    const totalGames = wins + losses
    if (totalGames === 0) return "0%"
  
    const winRate = (wins / totalGames) * 100
    return `${winRate.toFixed(1)}%`
  }
  export function formatMatchDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
  