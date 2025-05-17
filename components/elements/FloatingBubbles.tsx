"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface BubbleProps {
  x: number
  y: number
  size: number
  color: string
}

const Bubble: React.FC<BubbleProps> = ({ x, y, size, color }) => {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.7, 0.3, 0.7],
        scale: [1, 1.2, 1],
        x: x + Math.random() * 100 - 50,
        y: y + Math.random() * 100 - 50,
      }}
      transition={{
        duration: 5 + Math.random() * 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}

const FloatingBubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<BubbleProps[]>([])

  useEffect(() => {
    const newBubbles = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 5,
      color: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`,
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        {bubbles.map((bubble, index) => (
          <Bubble key={index} {...bubble} />
        ))}
      </svg>
    </div>
  )
}

export default FloatingBubbles
