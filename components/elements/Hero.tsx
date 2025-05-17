import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Image from "next/image"

import SpecialButton from "../ui/SpecialButton"
import { InteractiveGrid } from "../ui/InteractiveGrid"
import { ShineBorder } from "../ui/ShineBorder"
import FloatingBubbles from "./FloatingBubbles"

export function Hero() {
  return (
    <section className="relative min-h-screen pt-8 pb-8 px-2 overflow-hidden bg-black">
       {/* Ajout des bulles */}
      <InteractiveGrid containerClassName="absolute inset-0" className="opacity-30" points={40} />

      <ShineBorder
        className="relative z-10 max-w-6xl mx-auto px-6"
        borderClassName="border border-white/10 rounded-xl overflow-hidden"
      >
        <FloatingBubbles />
        <div className="flex flex-col items-center justify-center px-12">
          <div className="relative flex items-center justify-center">
            <Image
              src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMalxt2nZSM3dDGZpngIWbUeziw12lFYBEAhjx"
              alt="Background Gradient"
              width={150}
              height={150}
              className="rounded-full mt-3 border-4 border-white/80"
              priority
            />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight text-white/95">
              Dominate Every Game with
            </h1>
            <span className="text-transparent text-center bg-clip-text bg-gradient-to-r from-green-600 via-yellow-500 to-pink-600 text-4xl md:text-6xl font-bold">
              Legends Boost
            </span>
          </div>
        </div>
        <div className="text-center mb-16 px-4 pt-1">
          <p className="text-gray-400 text-lg mb-8 max-w-5xl mx-auto">
            The ultimate platform connecting players with top-tier boosters. Enhance your rank, unlock new
            achievements, and experience the game like never before all with full confidentiality and security.
          </p>
          <div className="flex gap-4 justify-center">
            <SpecialButton icon={<Play className="w-4 h-4" />} text="Get Start" className="z-50 mb-5" />
          </div>
        </div>
      </ShineBorder>
    </section>
  )
}
