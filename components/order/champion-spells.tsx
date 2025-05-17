import Image from "next/image"

interface ChampionSpellsProps {
  spells: string[]
}

export function ChampionSpells({ spells }: ChampionSpellsProps) {
  // Map of spell names to image paths
  const spellImages: Record<string, string> = {
    flash: "/placeholder.svg?width=20&height=20",
    ignite: "/placeholder.svg?width=20&height=20",
    heal: "/placeholder.svg?width=20&height=20",
    teleport: "/placeholder.svg?width=20&height=20",
    cleanse: "/placeholder.svg?width=20&height=20",
    barrier: "/placeholder.svg?width=20&height=20",
    exhaust: "/placeholder.svg?width=20&height=20",
    ghost: "/placeholder.svg?width=20&height=20",
    smite: "/placeholder.svg?width=20&height=20",
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      {spells.map((spell, index) => (
        <div
          key={index}
          className="w-5 h-5 bg-[#1f2330] rounded-sm overflow-hidden"
          title={spell.charAt(0).toUpperCase() + spell.slice(1)}
        >
          <Image
            src={spellImages[spell.toLowerCase()] || "/placeholder.svg?width=20&height=20"}
            alt={spell}
            width={20}
            height={20}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
