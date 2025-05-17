import Image from "next/image"

interface RankBadgeProps {
  tier: string
  division: string
  points: number
  position: string
}

export function RankBadge({ tier, division, points, position }: RankBadgeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-60">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-xl font-bold text-white">{tier}</div>
          <div className="text-lg font-semibold text-white">DIVISION {division}</div>
          <div className="mt-4 text-sm text-white">League Points</div>
          <div className="text-xl font-bold text-white">{points}</div>
        </div>
        <Image
          src="/placeholder.svg?width=160&height=240"
          alt={`${tier} Division ${division}`}
          width={160}
          height={240}
          className="object-contain"
        />
      </div>
      <div className="mt-2 flex justify-center">
        <div className="w-10 h-10 bg-[#1f2330] rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">{position}</span>
        </div>
      </div>
    </div>
  )
}
