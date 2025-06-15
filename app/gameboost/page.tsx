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
      {/* Background with Image and Overlays */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDM5Bx2yOIlnuz4acXSbP6xIZWTG02dsrpJghve"
            alt="Gaming Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Violet Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-violet-950/80 to-black/90" />
          {/* Additional Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,69,193,0.2),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.2),transparent_50%)]" />
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-5">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
              Choose Your Game
            </h1>
            <p className="text-xl text-violet-200/80 max-w-2xl mx-auto backdrop-blur-sm">
              Select from our premium collection of games and start your boosting journey
            </p>
            {/* Decorative Elements */}
            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
            {games.map((game, index) => (
              <Link
                key={game.id}
                href={`/gameboost/${game.slug}`}
                className="w-full sm:w-[48%] lg:w-[23%] group relative bg-gradient-to-br from-black/80 via-violet-950/60 to-black/90 ... "
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(139,69,193,0.4),transparent_70%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.3),transparent_70%)]" />
                </div>

                {/* Image Container */}
                <div className="relative h-96 overflow-hidden">
                  <Image
                    src={game.imageUrl || "/placeholder.svg?height=300&width=400"}
                    alt={game.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-violet-950/50 to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-300/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                </div>

                {/* Content */}
                <div className="relative p-8 space-y-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white group-hover:text-violet-300 transition-colors duration-300 drop-shadow-lg">
                      {game.name}
                    </h2>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse shadow-lg shadow-violet-400/50" />
                  </div>

                  {game.description && (
                    <p className="text-violet-200/70 text-sm line-clamp-2 group-hover:text-violet-200/90 transition-colors duration-300">
                      {game.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-violet-500/20">
                    <span className="text-violet-300 font-semibold text-sm">Elevate Your Game</span>
                    <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:bg-violet-500/40 transition-colors duration-300 shadow-lg">
                      <svg
                        className="w-4 h-4 text-violet-300 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-violet-400/50" />

                {/* Border Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {games.length === 0 && (
            <div className="text-center py-20 backdrop-blur-sm">
              <div className="w-24 h-24 bg-black/60 border border-violet-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/20">
                <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-violet-200 mb-2">No Games Available</h3>
              <p className="text-violet-300/60">Games will appear here once they are added to the database.</p>
            </div>
          )}
        </div>

        {/* Bottom Fade Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-5" />
      </div>
    </Rlayout>
  )
}
