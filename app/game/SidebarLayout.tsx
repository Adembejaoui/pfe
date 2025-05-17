"use client";

import { useEffect, useState } from "react";
import { fetchGenres } from "../api/gamesApi/route";
import GameGenreButton from "@/components/elements/game/GameGenreButton";
    

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface Genre {
  id: number;
  name: string;
  image_background: string;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetchGenres().then(setGenres);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0e0e1a] text-white">
      <aside className="w-60 bg-[#1b1b2e] p-4 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Genres</h2>
        {genres.map((genre) => (
          <GameGenreButton
            key={genre.id}
            image={genre.image_background}
            name={genre.name}
            active={false} // Just for layout view
            onClick={() => {}}
          />
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
