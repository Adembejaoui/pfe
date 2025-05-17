import Link from "next/link"
import Image from "next/image"
import Rlayout from "./Rlayout"
import { db } from "@/lib/db"

// Fetch games from database instead of static config
async function getGames() {
  try {
    const games = await db.game.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        description: true,
      },
    })
    return games
  } catch (error) {
    console.error("Error fetching games:", error)
    return []
  }
}

export default async function GameListPage() {
  const games = await getGames()

  return (
    <Rlayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Select a Game</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/gameboost/${game.slug}`}
              className="bg-[#1a1a2e] border border-[#333355] rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
            >
              <div className="relative h-40">
                <Image
                  src={game.imageUrl || "/placeholder.svg?height=200&width=300"}
                  alt={game.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h2 className="text-xl font-bold">{game.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Rlayout>
  )
}
