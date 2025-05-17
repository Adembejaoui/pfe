"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Boosting", href: "/boosting" },
  { label: "Accounts", href: "/accounts", active: true },
  { label: "Items", href: "/items" },
  { label: "Riot Points", href: "/riot-points" },
  { label: "Handmade Smurfs", href: "/smurfs" },
];

export default function GameNavbar() {
  return (
    <header className="bg-[#111827] text-white border-b border-[#1f2937] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <Image src="/lol-icon.png" alt="Logo" width={20} height={20} />
          League of Legends
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-1 hover:text-cyan-400 transition",
                item.active ? "text-cyan-400 font-semibold" : "text-gray-300"
              )}
            >
              {item.label}
              {item.label === "Riot Points" || item.label === "Handmade Smurfs" ? (
                <span className="ml-1 text-xs text-yellow-400">●</span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="border border-white text-white text-xs px-3 py-1 rounded-full">
          Support 24/7
        </Button>
      </div>
    </header>
  );
}
