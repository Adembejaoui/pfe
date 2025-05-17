"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const [matrixText, setMatrixText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%"
    let interval: NodeJS.Timeout

    // Matrix text effect with a glowing effect
    const matrixInterval = setInterval(() => {
      const randomText = Array(8)
        .fill(0)
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("")
      setMatrixText(randomText)
    }, 50)

    // Progress bar animation
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          clearInterval(matrixInterval)
          setTimeout(() => setIsComplete(true), 700) // Delay before hiding splash screen
          return 100
        }
        return prev + 1
      })
    }, 25)

    return () => {
      clearInterval(interval)
      clearInterval(matrixInterval)
    }
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black transition-opacity duration-700",
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Logo */}
      <div className="relative w-40 h-40 mb-8 animate-pulse">
        <Image
          src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMbAGA7M5iFWtAgHVDXY3jywaQ50s2hvOqKm7G"
          alt="SDFM 2520"
          fill
          className="object-contain"
          priority
        />
        
      </div>

      {/* Matrix-style loading text with glowing effect */}
      <div className="font-mono text-white text-lg tracking-widest mb-4 h-6 animate-pulse">
        {`LOADING SYSTEM: `}
        <span className="text-green-400 glow-text">{matrixText}</span>
      </div>

      {/* Progress bar container */}
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden shadow-lg">
        <div
          className="h-full bg-green-400 rounded-full transition-all duration-100 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress percentage with a futuristic look */}
      <div className="mt-3 font-mono text-sm text-gray-300 tracking-wide">{`${progress}%`}</div>
      
      {/* Glowing effect styling */}
      <style jsx>{`
        .glow-text {
          text-shadow: 0px 0px 10px rgba(0, 255, 0, 0.8);
        }
      `}</style>
    </div>
  )
}
