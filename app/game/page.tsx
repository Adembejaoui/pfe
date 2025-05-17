"use client";

import { useEffect, useState } from "react";
import { fetchGamesByGenre, fetchGenres } from "../api/gamesApi/route";
import GameGenreButton from "@/components/elements/game/GameGenreButton";
import AnimatedGameCard from "@/components/elements/game/AnimatedGameCard";
import MainLayout from "../Mainlayout";


interface Genre {
  id: number;
  name: string;
  image_background: string;
}

interface Game {
  id: number;
  slug: string;
  name: string;
  background_image: string;
  rating: number;
  platforms: any[];
}

export default function GameHubPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(4); // Action par défaut (id: 4)
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetchGenres().then(setGenres);
  }, []);

  useEffect(() => {
    if (selectedGenre !== null) {
      fetchGamesByGenre(selectedGenre).then(setGames);
    }
  }, [selectedGenre]);

  return (
    <MainLayout>
    <div className="flex min-h-screen bg-[#0e0e1a] text-white">
      <aside className="w-60 bg-[#1b1b2e] p-4 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Genres</h2>
        {genres.map((genre) => (
          <GameGenreButton
            key={genre.id}
            image={genre.image_background}
            name={genre.name}
            active={selectedGenre === genre.id}
            onClick={() => setSelectedGenre(genre.id)}
          />
        ))}
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">
          {genres.find((g) => g.id === selectedGenre)?.name} Games
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <AnimatedGameCard
              key={game.id}
              image={game.background_image}
              title={game.name}
              rating={game.rating}
              platforms={game.platforms}
              href={`/game/${game.slug}?`}
            />
          ))}
        </div>
      </main>
    </div>
    </MainLayout>
  );
}
