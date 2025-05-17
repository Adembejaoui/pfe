import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Rlayout from "../Rlayout"
import { db } from "@/lib/db"
import { parseGameTypes } from "@/lib/db"
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react"

interface GameBoostTypePageProps {
  params: {
    gameType: string
  }
}

// Fetch game by slug from database
async function getGameBySlug(slug: string) {
  try {
    const game = await db.game.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        description: true,
        gameTypes: true,
      },
    })
    return game
  } catch (error) {
    console.error("Error fetching game:", error)
    return null
  }
}

export default async function GameBoostTypePage({ params }: GameBoostTypePageProps) {
  const gameType = params.gameType
  const game = await getGameBySlug(gameType)

  if (!game) {
    notFound()
  }

  // Parse game types from JSON stored in database
  const boostTypes = parseGameTypes(game.gameTypes, [])

  return (
    <Rlayout>
      <div className="relative min-h-screen text-white">
        {/* Background image */}
        <div className="absolute inset-0 bg-[#0f0f1a]">
          {game.imageUrl && (
            <Image
              src={game.imageUrl || "/placeholder.svg?height=400&width=600"}
              alt={game.name}
              fill
              className="object-cover opacity-20"
              unoptimized
            />
          )}
        </div>

        {/* Overlay content */}
        <div className="relative z-10 p-6">
          <Link href="/gameboost" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
            ← Back to Games
          </Link>

          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">{game.name} Boosting</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boostTypes.map((boostType: { id: Key | null | undefined; slug: any; name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; description: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined }) => (
                <Link
                  key={boostType.id}
                  href={`/gameboost/${gameType}/${boostType.slug}`}
                  className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-6 hover:border-blue-500 transition-colors"
                >
                  <h2 className="text-xl font-bold mb-2">{boostType.name}</h2>
                  {boostType.description && <p className="text-gray-400 mb-4">{boostType.description}</p>}
                  <div className="text-blue-400">View Options →</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Rlayout>
  )
}
