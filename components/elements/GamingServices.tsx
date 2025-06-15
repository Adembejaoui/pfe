"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Zap, Users, Shield, Target, Crown, ArrowRight, Clock, CheckCircle } from "lucide-react"

const services = [
  {
    id: 1,
    title: "Rank Boosting",
    description: "Professional rank boosting by skilled players",
    icon: Trophy,
    price: "From $15",
    features: ["Solo/Duo Queue", "24/7 Support", "Account Safety", "Fast Delivery"],
    popular: true,
    games: ["League of Legends", "Valorant", "CS2", "Overwatch 2"],
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 2,
    title: "Coaching Sessions",
    description: "Learn from professional players and improve your skills",
    icon: Target,
    price: "From $25/hr",
    features: ["1-on-1 Sessions", "VOD Reviews", "Custom Training", "Progress Tracking"],
    popular: false,
    games: ["All Games", "Custom Training", "Strategy Sessions"],
    color: "from-blue-500 to-purple-500",
  },
  {
    id: 3,
    title: "Account Services",
    description: "Complete account management and optimization",
    icon: Shield,
    price: "From $30",
    features: ["Account Setup", "Optimization", "Security", "Maintenance"],
    popular: false,
    games: ["Multi-Game", "Account Recovery", "Setup Services"],
    color: "from-green-500 to-teal-500",
  },
  {
    id: 4,
    title: "Duo Boosting",
    description: "Play alongside professional players",
    icon: Users,
    price: "From $20",
    features: ["Play Together", "Learn Live", "Guaranteed Wins", "Fun Experience"],
    popular: true,
    games: ["League of Legends", "Valorant", "Apex Legends"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 5,
    title: "Placement Matches",
    description: "Perfect placement for new seasons",
    icon: Crown,
    price: "From $35",
    features: ["10 Placement Games", "Optimal Ranking", "Season Ready", "Quick Turnaround"],
    popular: false,
    games: ["Seasonal Games", "Ranked Placement", "New Accounts"],
    color: "from-red-500 to-orange-500",
  },
  {
    id: 6,
    title: "Win Boosting",
    description: "Guaranteed wins for your account",
    icon: Zap,
    price: "From $5/win",
    features: ["Guaranteed Wins", "LP Gains", "Streak Bonuses", "Fast Service"],
    popular: false,
    games: ["All Ranked Games", "Normal Games", "Custom Matches"],
    color: "from-cyan-500 to-blue-500",
  },
]

const stats = [
  { label: "Orders Completed", value: "50,000+", icon: CheckCircle },
  { label: "Success Rate", value: "99.8%", icon: Trophy },
  { label: "Average Time", value: "24h", icon: Clock },
  { label: "Active Boosters", value: "500+", icon: Users },
]

export default function GamingServices() {
  const [selectedService, setSelectedService] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Auto-rotate featured service
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedService((prev) => (prev + 1) % services.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#030303]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">🎮 Our Services</Badge>

          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Gaming Services
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              {" "}
              That Deliver
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional gaming services designed to help you achieve your goals faster and more efficiently
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className={`relative bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-500 cursor-pointer backdrop-blur-sm ${
                hoveredCard === index ? "scale-105 shadow-2xl" : ""
              } ${selectedService === index ? "ring-2 ring-blue-500/50" : ""}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                    🔥 Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 mx-auto`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                <CardTitle className="text-xl text-white text-center">{service.title}</CardTitle>
                <p className="text-gray-300 text-center text-sm">{service.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{service.price}</div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Games */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400">Available for:</div>
                  <div className="flex flex-wrap gap-1">
                    {service.games.slice(0, 2).map((game, gameIndex) => (
                      <Badge key={gameIndex} className="bg-gray-700/50 text-gray-300 text-xs">
                        {game}
                      </Badge>
                    ))}
                    {service.games.length > 2 && (
                      <Badge className="bg-gray-700/50 text-gray-300 text-xs">+{service.games.length - 2} more</Badge>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 transition-all duration-300 group`}
                >
                  Order Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-4">Need a Custom Service?</h3>
            <p className="text-gray-300 mb-6">
              Can't find what you're looking for? Contact us for custom gaming services tailored to your needs.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
