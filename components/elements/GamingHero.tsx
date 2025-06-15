"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Zap, Trophy, Target, Crown, Gamepad2 } from "lucide-react"
import Link from "next/link"

const heroContent = [
  {
    title: "Dominate Your Rank",
    subtitle: "Professional Boosting Services",
    description: "Get boosted by professional players and reach your dream rank faster than ever before.",
    cta: "Start Boosting",
    badge: "🏆 #1 Boosting Service",
    stats: { users: "50K+", games: "1M+", rating: "4.9" },
  },
  {
    title: "Elite Gaming Experience",
    subtitle: "Premium Account Services",
    description: "Unlock exclusive content, rare skins, and premium features with our professional services.",
    cta: "Power Up",
    badge: "⚡ Advance Now",
    stats: { users: "75K+", games: "2M+", rating: "4.8" },
  },
  {
    title: "Legendary Status Awaits",
    subtitle: "Professional Coaching",
    description: "Learn from the best players and improve your gameplay with personalized coaching sessions.",
    cta: "Begin Your Boost",
    badge: "🎯 Enter the Arena",
    stats: { users: "25K+", games: "500K+", rating: "5.0" },
  },
]

const floatingIcons = [
  { icon: Trophy, delay: 0 },
  { icon: Crown, delay: 1000 },
  { icon: Target, delay: 2000 },
  { icon: Gamepad2, delay: 3000 },
]

export default function GamingHero() {
  const [currentContent, setCurrentContent] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Dynamic content rotation algorithm
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentContent((prev) => (prev + 1) % heroContent.length)
        setIsVisible(true)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const current = heroContent[currentContent]

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#030303] via-[#0a0a0a] to-[#1a1a1a] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 animate-pulse" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-bounce" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Floating Gaming Icons */}
      {floatingIcons.map((item, index) => (
        <div
          key={index}
          className="absolute animate-bounce"
          style={{
            top: `${20 + index * 15}%`,
            right: `${10 + index * 5}%`,
            animationDelay: `${item.delay}ms`,
            animationDuration: "3s",
          }}
        >
          <item.icon className="w-8 h-8 text-white/20" />
        </div>
      ))}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen py-20">
          {/* Content Section */}
          <div
            className={`lg:w-1/2 space-y-8 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-blue-500/30 text-sm px-4 py-2">
              {current.badge}
            </Badge>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  {current.title}
                </span>
              </h1>

              <h2 className="text-2xl lg:text-3xl font-semibold text-blue-400">{current.subtitle}</h2>

              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">{current.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{current.stats.users}</div>
                <div className="text-sm text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{current.stats.games}</div>
                <div className="text-sm text-gray-400">Games Boosted</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-3xl font-bold text-white">{current.stats.rating}</span>
                </div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/gameboost" passHref>
                    <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4 group"
                    >
                    {current.cta}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <Link href="/gameboost" passHref>
                    <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-4"
                    >
                    View Services
                    </Button>
                </Link>
                </div>
          </div>

          {/* Visual Section */}
          <div className="lg:w-1/2 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main Gaming Visual */}
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 backdrop-blur-sm border border-gray-700/50">
                <div className="space-y-6">
                  {/* Rank Progress */}
                  <div className="bg-gray-800/70 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Current Rank</span>
                      <span className="text-sm text-green-400">Boosting...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-bronze-400 to-bronze-600 rounded-lg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="text-gray-400" />
                      <div className="w-12 h-12 bg-gradient-to-r from-gold-400 to-gold-600 rounded-lg flex items-center justify-center animate-pulse">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/70 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">98%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                    <div className="bg-gray-800/70 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">24h</div>
                      <div className="text-xs text-gray-400">Avg Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 rounded-full p-3 animate-bounce">
                <Zap className="w-6 h-6 text-white" />
              </div>

              <div className="absolute -bottom-4 -left-4 bg-purple-500 rounded-full p-3 animate-pulse">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {heroContent.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentContent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentContent ? "bg-blue-500" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
