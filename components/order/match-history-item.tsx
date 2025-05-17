import Image from "next/image"
import { ChampionSpells } from "@/components/order/champion-spells"

interface MatchHistoryItemProps {
  champion: string
  result: "Win" | "Loss" | "Remake"
  date: string
  kda: string
  score: number
  spells: string[]
  championImageUrl?: string
}

export function MatchHistoryItem({
  champion,
  result,
  date,
  kda,
  score,
  spells,
  championImageUrl = "/placeholder.svg?width=32&height=32",
}: MatchHistoryItemProps) {
  const resultIcon = result === "Win" ? "🏆" : result === "Loss" ? "❌" : "⟳"

  const resultColor = result === "Win" ? "text-green-500" : result === "Loss" ? "text-red-500" : "text-gray-400"

  return (
    <tr className="text-black">
      <td className="p-2 text-center">{resultIcon}</td>
      <td className="p-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#1f2330] rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src={championImageUrl || "/placeholder.svg"}
              alt={champion}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span>{champion}</span>
        </div>
      </td>
      <td className={`p-2 text-center ${resultColor}`}>{result}</td>
      <td className="p-2 text-center">
        <ChampionSpells spells={spells} />
      </td>
      <td className="p-2 text-center text-black">{kda}</td>
      <td className="p-2 text-center ">{score}</td>
    </tr>
  )
}
