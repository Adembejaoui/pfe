"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy, Shield, Zap, Users } from "lucide-react"
import Image from "next/image"

const reviews = [
  {
    id: 1,
    name: "Alex Chen",
    username: "@alexgamer",
    rating: 5,
    service: "Rank Boost",
    game: "League of Legends",
    rank: "Diamond → Master",
    review:
      "Incredible service! Got boosted from Diamond to Master in just 3 days. The booster was professional and kept me updated throughout the process.",
    date: "2 days ago",
    verified: true,
    gameIcon: Trophy,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    username: "@sarahpro",
    rating: 5,
    service: "Coaching",
    game: "Valorant",
    rank: "Gold → Platinum",
    review:
      "Amazing coaching session! Learned so much about positioning and game sense. Climbed 2 ranks after just one session.",
    date: "1 week ago",
    verified: true,
    gameIcon: Zap,
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    username: "@mikeR",
    rating: 5,
    service: "Account Services",
    game: "CS2",
    rank: "Silver → Gold Nova",
    review:
      "Fast and reliable! My account was handled with care and I got exactly what I ordered. Will definitely use again!",
    date: "3 days ago",
    verified: true,
    gameIcon: Shield,
  },
  {
    id: 4,
    name: "Emma Wilson",
    username: "@emmaw",
    rating: 5,
    service: "Duo Boost",
    game: "Apex Legends",
    rank: "Platinum → Diamond",
    review: "Great experience playing duo with a pro! Learned new strategies while climbing ranks. Highly recommend!",
    date: "5 days ago",
    verified: true,
    gameIcon: Users,
  },
  {
    id: 5,
    name: "David Kim",
    username: "@davidk",
    rating: 5,
    service: "Placement Matches",
    game: "Overwatch 2",
    rank: "Unranked → Diamond",
    review:
      "Perfect placement matches! Started from unranked and got placed in Diamond. Couldn't be happier with the results!",
    date: "1 week ago",
    verified: true,
    gameIcon: Trophy,
  },
  {
    id: 6,
    name: "Lisa Park",
    username: "@lisap",
    rating: 5,
    service: "Win Boost",
    game: "Rocket League",
    rank: "Champion → Grand Champion",
    review:
      "Exceptional service! The booster was skilled and completed my order faster than expected. Great communication too!",
    date: "4 days ago",
    verified: true,
    gameIcon: Zap,
  },
]

export default function ClientReviews() {
  const [currentReviews, setCurrentReviews] = useState(reviews.slice(0, 3))
  const [animationClass, setAnimationClass] = useState("translate-x-0")

  // Dynamic review rotation algorithm
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass("translate-x-full opacity-0")

      setTimeout(() => {
        const startIndex = Math.floor(Math.random() * (reviews.length - 2))
        setCurrentReviews(reviews.slice(startIndex, startIndex + 3))
        setAnimationClass("-translate-x-full opacity-0")

        setTimeout(() => {
          setAnimationClass("translate-x-0 opacity-100")
        }, 100)
      }, 300)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  const totalReviews = reviews.length * 847 // Simulate larger number

  return (
    <section className="py-20 bg-gradient-to-b from-[#030303] to-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">⭐ Client Reviews</Badge>

          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">What Our</span>
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              Gamers Say
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers who've achieved their gaming goals with our professional services
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-2xl font-bold text-white ml-2">{averageRating.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalReviews.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Happy Customers</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.8%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-500 ease-in-out ${animationClass}`}>
          {currentReviews.map((review, index) => (
            <Card
              key={`${review.id}-${index}`}
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
        
                      {review.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-white">{review.name}</div>
                      <div className="text-sm text-gray-400">{review.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Service Info */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{review.service}</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{review.game}</Badge>
                </div>

                {/* Rank Progress */}
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <review.gameIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{review.rank}</span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-300 mb-4 leading-relaxed">"{review.review}"</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{review.date}</span>
                  {review.verified && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Verified</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Reviews Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
            View All Reviews ({totalReviews.toLocaleString()}+)
          </button>
        </div>
      </div>
    </section>
  )
}
