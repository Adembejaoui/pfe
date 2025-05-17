"use client"

import type React from "react"
import { Clock } from "lucide-react"

interface PromotionBannerProps {
  title: string
  description: React.ReactNode[]
  imageUrl: string
  countdown?: string
  discount?: string
}

export default function PromotionBanner({ title, description, imageUrl, countdown, discount }: PromotionBannerProps) {
  const isSmall = countdown !== undefined

  return (
    <div className="bg-[#4a0099] rounded-lg p-4 mb-4 relative overflow-hidden">
      {!isSmall ? (
        <div className="flex items-center">
          <div className="w-24 h-24 relative mr-4">
            <img src={imageUrl || "/placeholder.svg"} alt="Promo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-yellow-300">{title}</h2>
            <div className="mt-2">
              {description.map((item, index) => (
                <p key={index} className="text-white">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-bold">LIMITED TIME OFFER</span>
            </div>
            <div className="text-sm mt-1">{countdown}</div>
            <div className="text-lg font-bold mt-1">{discount} Discount</div>
          </div>
          <div className="w-20 h-20">
            <img src={imageUrl || "/placeholder.svg"} alt="Promo" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
      {isSmall && <div className="text-xs text-right mt-2 text-yellow-300">LET ME SLIDE THE PRICE FOR YOU!</div>}
    </div>
  )
}
