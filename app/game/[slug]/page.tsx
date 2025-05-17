import { fetchGameDetails, fetchGamesByGenre, fetchGameScreenshots } from "@/app/api/gamesApi/route";
import MainLayout from "@/app/Mainlayout";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import SidebarLayout from "../SidebarLayout";

export default async function GameDetailPage({ params }: { params: { slug: string } }) {
  const game = await fetchGameDetails(params.slug);
  const screenshots = await fetchGameScreenshots(params.slug);
 // const similarGames = await fetchSimilarGames(game.id);

  const genreId = game.genres?.[0]?.id;
  const genreGames = genreId ? await fetchGamesByGenre(genreId) : [];

  return (
    <MainLayout>
      <SidebarLayout>
        <div className="max-w-6xl mx-auto p-6 text-white space-y-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 space-y-4">
              <h1 className="text-4xl font-extrabold text-cyan-400">{game.name}</h1>
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {screenshots.map((img: { id: number; image: string }) => (
                      <CarouselItem key={img.id} className="md:basis-1/2 lg:basis-1/3">
                        <img
                          src={img.image}
                          alt="screenshot"
                          className="w-full h-56 object-cover rounded-lg"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>

            <div className="md:w-1/3 bg-[#1a1a2e] rounded-xl p-4 space-y-3 shadow-lg">
              <h2 className="text-xl font-bold">Game Details</h2>
              <p><span className="text-gray-400">Released:</span> {game.released}</p>
              <p><span className="text-gray-400">Rating:</span> ⭐ {game.rating} / 5</p>
              <p className="text-gray-400">Available on:</p>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((p: any) => (
                  <Badge key={p.platform.id} className="bg-cyan-700 text-white">
                    {p.platform.name}
                  </Badge>
                ))}
              </div>
              <a
                href={game.website}
                target="_blank"
                className="inline-block mt-4 text-cyan-400 hover:underline"
              >
                🔗 Visit Official Website
              </a>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">📘 Game Description (EN)</h2>
            <div className="text-gray-300 leading-relaxed text-md" dangerouslySetInnerHTML={{ __html: game.description }} />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">🎓 Developed by</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              {game.developers?.map((dev: any) => (
                <li key={dev.id}>{dev.name}</li>
              )) || <li>Unknown developer</li>}
            </ul>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">🏷 Tags</h2>
            <div className="flex flex-wrap gap-2">
              {game.tags?.map((tag: any) => (
                <Badge key={tag.id} className="bg-cyan-800 text-white">{tag.name}</Badge>
              )) || <p className="text-gray-400">No tags available</p>}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">💬 Customer Reviews</h2>
            <div className="space-y-4">
              <div className="bg-[#232334] p-4 rounded-lg">
                <p className="text-gray-200 font-medium">🔥 "Amazing gameplay and visuals!"</p>
                <p className="text-sm text-gray-400">— Anonymous</p>
              </div>
              <div className="bg-[#232334] p-4 rounded-lg">
                <p className="text-gray-200 font-medium">🎮 "One of the best experiences I've had. 5/5"</p>
                <p className="text-sm text-gray-400">— GamerPro</p>
              </div>
              <div className="bg-[#232334] p-4 rounded-lg">
                <p className="text-gray-200 font-medium">🤯 "Mind-blowing detail and mechanics."</p>
                <p className="text-sm text-gray-400">— PlayerOne</p>
              </div>
            </div>
          </div>

          {genreGames.length > 0 && (
            <div className="bg-[#1a1a2e] rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">🎮 More from {game.genres?.[0]?.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {genreGames.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/game/${item.slug}`}
                    className="bg-[#232334] hover:bg-[#2a2a3a] rounded-lg overflow-hidden shadow transition"
                  >
                    <img
                      src={item.background_image}
                      alt={item.name}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-2 text-sm font-medium text-center text-gray-200">
                      {item.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </MainLayout>
  );
}
