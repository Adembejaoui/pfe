// Game-specific API endpoints
export const GAME_ENDPOINTS = {
    lol: {
      matchList: (region: string, puuid: string) =>
        `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      matchDetails: (region: string, matchId: string) =>
        `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    },
    valorant: {
      matchList: (region: string, puuid: string) =>
        `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
      matchDetails: (region: string, matchId: string) =>
        `https://${region}.api.riotgames.com/val/match/v1/matches/${matchId}`,
    },
    tft: {
      matchList: (region: string, puuid: string) =>
        `https://${region}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids`,
      matchDetails: (region: string, matchId: string) =>
        `https://${region}.api.riotgames.com/tft/match/v1/matches/${matchId}`,
    },
  }
  
  // Map region names to region codes and continental routing values
  export function getRegionInfo(region: string) {
    const regionMap: Record<string, { regionCode: string; continentalRoute: string }> = {
      "Europe West": { regionCode: "euw1", continentalRoute: "europe" },
      euw: { regionCode: "euw1", continentalRoute: "europe" },
      "Europe Nordic & East": { regionCode: "eun1", continentalRoute: "europe" },
      eune: { regionCode: "eun1", continentalRoute: "europe" },
      "North America": { regionCode: "na1", continentalRoute: "americas" },
      na: { regionCode: "na1", continentalRoute: "americas" },
      Brazil: { regionCode: "br1", continentalRoute: "americas" },
      br: { regionCode: "br1", continentalRoute: "americas" },
      "Latin America North": { regionCode: "la1", continentalRoute: "americas" },
      lan: { regionCode: "la1", continentalRoute: "americas" },
      "Latin America South": { regionCode: "la2", continentalRoute: "americas" },
      las: { regionCode: "la2", continentalRoute: "americas" },
      Oceania: { regionCode: "oc1", continentalRoute: "sea" },
      oce: { regionCode: "oc1", continentalRoute: "sea" },
      Russia: { regionCode: "ru", continentalRoute: "europe" },
      ru: { regionCode: "ru", continentalRoute: "europe" },
      Turkey: { regionCode: "tr1", continentalRoute: "europe" },
      tr: { regionCode: "tr1", continentalRoute: "europe" },
      Japan: { regionCode: "jp1", continentalRoute: "asia" },
      jp: { regionCode: "jp1", continentalRoute: "asia" },
      Korea: { regionCode: "kr", continentalRoute: "asia" },
      kr: { regionCode: "kr", continentalRoute: "asia" },
    }
  
    return regionMap[region] || { regionCode: "euw1", continentalRoute: "europe" }
  }
  
  // Process League of Legends match data
  export function processLoLMatch(match: any, puuid: string) {
    // Find the participant with the matching puuid
    const participant = match.info.participants.find((p: any) => p.puuid === puuid)
  
    if (!participant) {
      return {
        matchId: match.metadata.matchId,
        champion: "Unknown",
        result: "Unknown",
        date: new Date(match.info.gameCreation).toLocaleString(),
        kda: "0/0/0",
        score: 0,
        spells: [],
        championImageUrl: "/placeholder.svg?width=32&height=32",
      }
    }
  
    return {
      matchId: match.metadata.matchId,
      champion: participant.championName,
      result: participant.win ? "Win" : "Loss",
      date: new Date(match.info.gameCreation).toLocaleString(),
      kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
      score: Math.round(((participant.kills + participant.assists) / Math.max(1, participant.deaths)) * 100) / 100,
      spells: [participant.summoner1Id, participant.summoner2Id].map(String),
      championImageUrl: `/placeholder.svg?width=32&height=32`, // Replace with actual champion image URL
    }
  }
  
  // Process Valorant match data
  export function processValorantMatch(match: any, puuid: string) {
    // Find the player with the matching puuid
    const player = match.players.find((p: any) => p.puuid === puuid)
  
    if (!player) {
      return {
        matchId: match.matchInfo.matchId,
        champion: "Unknown",
        result: "Unknown",
        date: new Date(match.matchInfo.gameStartMillis).toLocaleString(),
        kda: "0/0/0",
        score: 0,
        spells: [],
        championImageUrl: "/placeholder.svg?width=32&height=32",
      }
    }
  
    // Determine if the player's team won
    const playerTeam = player.teamId
    const teams = match.teams || []
    const playerTeamData = teams.find((team: any) => team.teamId === playerTeam)
    const result = playerTeamData?.won ? "Win" : "Loss"
  
    return {
      matchId: match.matchInfo.matchId,
      champion: player.characterId || "Agent",
      result: result,
      date: new Date(match.matchInfo.gameStartMillis).toLocaleString(),
      kda: `${player.stats?.kills || 0}/${player.stats?.deaths || 0}/${player.stats?.assists || 0}`,
      score: player.stats?.score || 0,
      spells: ["ability1", "ability2"], // Valorant doesn't have spells like LoL
      championImageUrl: `/placeholder.svg?width=32&height=32`, // Replace with actual agent image URL
    }
  }
  
  // Process TFT match data
  export function processTFTMatch(match: any, puuid: string) {
    // Find the participant with the matching puuid
    const participant = match.info.participants.find((p: any) => p.puuid === puuid)
  
    if (!participant) {
      return {
        matchId: match.metadata.match_id,
        champion: "Unknown",
        result: "Unknown",
        date: new Date(match.info.game_datetime).toLocaleString(),
        kda: "N/A",
        score: 0,
        spells: [],
        championImageUrl: "/placeholder.svg?width=32&height=32",
      }
    }
  
    // Determine result based on placement (1-4 is usually considered a win in TFT)
    const result = participant.placement <= 4 ? "Win" : "Loss"
  
    return {
      matchId: match.metadata.match_id,
      champion: `Set ${match.info.tft_set_number}`,
      result: result,
      date: new Date(match.info.game_datetime).toLocaleString(),
      kda: "N/A", // TFT doesn't have KDA
      score: 100 - participant.placement * 10, // Simple score calculation based on placement
      spells: [], // TFT doesn't have spells like LoL
      championImageUrl: `/placeholder.svg?width=32&height=32`, // Replace with actual set image
    }
  }
  