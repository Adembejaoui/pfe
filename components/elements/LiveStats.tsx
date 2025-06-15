"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Zap, Clock, TrendingUp, Star } from "lucide-react"

interface LiveStat {
  id: string
  type: "order" | "completion" | "user" | "rating"
  message: string
  time: string
  icon: any
  color: string
}

const generateRandomStat = (): LiveStat => {
  const types = ["order", "completion", "user", "rating"] as const
  const type = types[Math.floor(Math.random() * types.length)]

  const names = ["Alex", "Sarah", "Mike", "Emma", "David", "Lisa", "John", "Anna"]
  const games = ["League of Legends", "Valorant", "CS2", "Overwatch 2", "Apex Legends"]
  const ranks = ["Bronze → Silver", "Silver → Gold", "Gold → Platinum", "Platinum → Diamond", "Diamond → Master"]

  const name = names[Math.floor(Math.random() * names.length)]
  const game = games[Math.floor(Math.random() * games.length)]
  const rank = ranks[Math.floor(Math.random() * ranks.length)]

  const statTypes = {
    order: {
      message: `${name} just ordered ${game} boost`,
      icon: Trophy,
      color: "text-yellow-400",
    },
    completion: {
      message: `${name} completed ${rank} boost in ${game}`,
      icon: Zap,
      color: "text-green-400",
    },
    user: {
      message: `${name} joined Legends Boost`,
      icon: Users,
      color: "text-blue-400",
    },
    rating: {
      message: `${name} left a 5⭐ review for ${game}`,
      icon: Star,
      color: "text-purple-400",
    },
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message: statTypes[type].message,
    time: "Just now",
    icon: statTypes[type].icon,
    color: statTypes[type].color,
  }
}

const initialStats = [
  {
    label: "Active Orders",
    value: 1247,
    icon: Clock,
    color: "text-blue-400",
    trend: "+12%",
  },
  {
    label: "Online Boosters",
    value: 89,
    icon: Users,
    color: "text-green-400",
    trend: "+5%",
  },
  {
    label: "Completed Today",
    value: 342,
    icon: Trophy,
    color: "text-yellow-400",
    trend: "+18%",
  },
  {
    label: "Success Rate",
    value: 99.8,
    icon: TrendingUp,
    color: "text-purple-400",
    trend: "+0.2%",
  },
]

export default function LiveStats() {
  const [liveActivities, setLiveActivities] = useState<LiveStat[]>([])
  const [stats, setStats] = useState(initialStats)

  // Generate live activities
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = generateRandomStat()
      setLiveActivities((prev) => [newActivity, ...prev.slice(0, 4)])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Update stats dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value:
            stat.label === "Success Rate"
              ? Math.min(99.9, stat.value + Math.random() * 0.1)
              : stat.value + Math.floor(Math.random() * 5),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-[#030303] to-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20 animate-pulse">🔴 Live Stats</Badge>

          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Real-Time</span>
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"> Activity</span>
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">See what's happening right now on our platform</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-white">
                      {stat.label === "Success Rate" ? `${stat.value.toFixed(1)}%` : stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-xs text-green-400">{stat.trend}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Activity Feed */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <h3 className="text-lg font-semibold text-white">Live Activity</h3>
                </div>

                <div className="space-y-3 max-h-64 overflow-hidden">
                  {liveActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 transition-all duration-500 ${
                        index === 0 ? "animate-fadeIn" : ""
                      }`}
                      style={{ opacity: 1 - index * 0.2 }}
                    >
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      <div className="flex-1">
                        <div className="text-sm text-gray-300">{activity.message}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Promotions */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">🎉 Limited Time</Badge>
                  <h3 className="text-xl font-bold text-white mb-2">25% OFF</h3>
                  <p className="text-blue-200 text-sm mb-4">All Rank Boosting Services</p>
                  <div className="text-xs text-blue-300">Ends in 2 days</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600/20 to-teal-600/20 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <Badge className="mb-3 bg-green-500/20 text-green-400 border-green-500/30">⚡ Flash Sale</Badge>
                  <h3 className="text-xl font-bold text-white mb-2">Free Coaching</h3>
                  <p className="text-green-200 text-sm mb-4">With any boost order over $50</p>
                  <div className="text-xs text-green-300">Today only</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <Badge className="mb-3 bg-purple-500/20 text-purple-400 border-purple-500/30">👑 VIP</Badge>
                  <h3 className="text-xl font-bold text-white mb-2">Priority Queue</h3>
                  <p className="text-purple-200 text-sm mb-4">Skip the wait, get boosted first</p>
                  <div className="text-xs text-purple-300">VIP members only</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  )
}
