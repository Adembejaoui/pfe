"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface RolesChampionsProps {
  championImageUrl?: string
  wins?: number
  losses?: number
  isVisible?: boolean
  onRoleSelect?: (roles: string[]) => void
  onChampionSelect?: (champions: any[]) => void
}

interface Champion {
  name: string
  id: string
  imageUrl: string
}

const ROLES = [
  { id: "top", icon: "https://xou955y8kd.ufs.sh/f/zvC4KODelhDMeIPcW0TeWpTkIgloJM0sfBYum72SU5qi8aKV", label: "Top" },
  {
    id: "jungle",
    icon: "https://xou955y8kd.ufs.sh/f/zvC4KODelhDMBq1s1c9BsUX17Nq6L0u3p8HfktxWmROhne5J",
    label: "Jungle",
  },
  { id: "mid", icon: "https://xou955y8kd.ufs.sh/f/zvC4KODelhDMbEdqVe5iFWtAgHVDXY3jywaQ50s2hvOqKm7G", label: "Mid" },
  { id: "adc", icon: "https://xou955y8kd.ufs.sh/f/zvC4KODelhDMcelG4WHupkVsztK1f7yeGmZMdq0Y5JFn3g2N", label: "ADC" },
  {
    id: "support",
    icon: "https://xou955y8kd.ufs.sh/f/zvC4KODelhDMycp1pUzNq6COJ9Zo8R5v3jV1W2cYSHDbi07t",
    label: "Support",
  },
]

export function RolesChampions({
  championImageUrl = "/placeholder.svg?width=48&height=48",
  wins,
  losses,
  isVisible = false,
  onRoleSelect,
  onChampionSelect,
}: RolesChampionsProps) {
  const [showComponent, setShowComponent] = useState(isVisible)
  const [champions, setChampions] = useState<Champion[]>([])
  const [selectedChampions, setSelectedChampions] = useState<Champion[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setShowComponent(isVisible)
  }, [isVisible])

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await fetch("https://ddragon.leagueoflegends.com/cdn/15.9.1/data/en_US/champion.json")
        const data = await res.json()
        const championsArray = Object.values(data.data).map((champion: any) => ({
          name: champion.name,
          id: champion.id,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/15.9.1/img/champion/${champion.image.full}`,
        }))
        setChampions(championsArray)
      } catch (error) {
        console.error("Error fetching champions:", error)
        // Fallback to empty array if fetch fails
        setChampions([])
      }
    }

    fetchChampions()
  }, [])

  // Notify parent component when selections change
  useEffect(() => {
    if (onRoleSelect) {
      onRoleSelect(selectedRoles)
    }
  }, [selectedRoles, onRoleSelect])

  useEffect(() => {
    if (onChampionSelect) {
      onChampionSelect(selectedChampions)
    }
  }, [selectedChampions, onChampionSelect])

  const handleChampionToggle = (champion: Champion) => {
    const isSelected = selectedChampions.some((c) => c.name === champion.name)

    if (!isSelected && selectedChampions.length >= 7) {
      setError("You can only select up to 7 champions.")
      return
    }

    setSelectedChampions((prev) => (isSelected ? prev.filter((c) => c.name !== champion.name) : [...prev, champion]))
    setError("")
  }

  const removeChampion = (championName: string) => {
    setSelectedChampions((prev) => prev.filter((c) => c.name !== championName))
  }

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((r) => r !== roleId)
      } else if (prev.length < 2) {
        return [...prev, roleId]
      } else {
        return prev
      }
    })
  }

  if (!showComponent) return null

  const filteredChampions = champions.filter((champ) => champ.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const mainRole = selectedRoles[0] || ""
  const secondaryRole = selectedRoles[1] || ""

  return (
    <section className={`bg-white bg-opacity-5 rounded-lg border border-[#1f2330] overflow-hidden ${!showComponent ? "hidden" : ""}`}>
      <header className="px-4 py-3 border-b border-[#1f2330] flex justify-between items-center">
        <h2 className="text-lg font-semibold">Champions & Roles</h2>
        <button onClick={() => setShowComponent(!showComponent)} className="text-sm text-gray-400 hover:text-white">
          {showComponent ? "Hide" : "Show"}
        </button>
        
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Role Selection */}
        <div>
          <label className="text-gray-400 block mb-2">
            Select your Roles <span className="text-green-400 text-xs ml-1">Free</span>
          </label>
          <div className="flex gap-2">
            {ROLES.map((role) => {
              const selected = selectedRoles.includes(role.id)
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleToggle(role.id)}
                  className={`p-6 rounded-xl border transition ${
                    selected
                      ? "border-purple-500 bg-white/10 border-x-fuchsia-700 "
                      : "border-gray-600 hover:border-white"
                  }`}
                >
                  <img src={role.icon || "/placeholder.svg"} alt={role.label} className="w-10 h-10" />
                </button>
              )
            })}
          </div>
          {selectedRoles.length > 0 && (
            <p className="text-sm text-white mt-2">
              {selectedRoles.length >= 1 && (
                <span>
                  Main: <strong>{mainRole}</strong>
                </span>
              )}
              {selectedRoles.length === 2 && (
                <span>
                  {" "}
                  | Secondary: <strong>{secondaryRole}</strong>
                </span>
              )}
            </p>
          )}
        </div>

        {/* Win/Loss Info */}
        {(wins !== undefined || losses !== undefined) && (
          <div className="flex justify-between">
            <span className="text-gray-400">Win/Loss:</span>
            <span>
              {wins || 0}W / {losses || 0}L
            </span>
          </div>
        )}

        {/* Selected Champions */}
        {selectedChampions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedChampions.map((champ) => (
              <div
                key={champ.name}
                className="flex items-center px-2 py-1 bg-[#1f2330] rounded-full text-sm space-x-2 border border-gray-600 text-white"
              >
                <img src={champ.imageUrl || "/placeholder.svg"} alt={champ.name} className="w-5 h-5 rounded-full" />
                <span>{champ.name}</span>
                <button onClick={() => removeChampion(champ.name)} className="text-gray-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Champion Selection */}
        <div className="space-y-2">
          <label className="text-gray-400 block">Select up to 7 Champions</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                {selectedChampions.length > 0 ? "Select more" : "Choose champions"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2">
              <input
                type="text"
                placeholder="Search champions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 mb-2 text-sm bg-background border border-gray-600 rounded"
              />
              <ScrollArea className="h-60 pr-2">
                {filteredChampions.length > 0 ? (
                  filteredChampions.map((champ) => {
                    const checked = selectedChampions.some((c) => c.name === champ.name)
                    return (
                      <div
                        key={champ.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => handleChampionToggle(champ)}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => handleChampionToggle(champ)} />
                        <img
                          src={champ.imageUrl || "/placeholder.svg"}
                          alt={champ.name}
                          className="w-5 h-5 rounded-sm"
                        />
                        <span className="text-sm">{champ.name}</span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-sm text-gray-400">No results</p>
                )}
              </ScrollArea>
              {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  )
}
