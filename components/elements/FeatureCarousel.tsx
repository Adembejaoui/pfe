"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";



export default function FeatureCarousel() {
 

  const data = [
    {
      "id": 1,
      "title": "Minimal Design",
      "description": "Clean aesthetics that put your content in the spotlight.",
      "icon": "✨"
    },
    {
      "id": 2,
      "title": "Responsive",
      "description": "Flawless experiences across all devices and screen sizes.",
      "icon": "📱"
    },
    {
      "id": 3,
      "title": "Fast Performance",
      "description": "Lightning-quick load times for smooth user interactions.",
      "icon": "⚡"
    },
    {
      "id": 4,
      "title": "Accessibility",
      "description": "Inclusive design practices for all users.",
      "icon": "🌈"
    },
    {
      "id": 5,
      "title": "SEO Optimized",
      "description": "Built to help your site rank higher in search results.",
      "icon": "🔍"
    },
    {
        "id": 6,
        "title": "SEO Optimized",
        "description": "Built to help your site rank higher in search results.",
        "icon": "🔍"
    },
    {
        "id": 7,
        "title": "Responsive",
        "description": "Flawless experiences across all devices and screen sizes.",
        "icon": "📱"
    },
    {
        "id": 8,
        "title": "Accessibility",
        "description": "Inclusive design practices for all users.",
        "icon": "🌈"
    }
  ]
   

  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, []);

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX > 0) {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
    } else if (currentX < -width) {
      controls.start({ x: -width, transition: { type: "spring", stiffness: 300, damping: 30 } });
    }
  };

  return (
    <div className="py-8 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose Us</h2>
        <motion.div ref={carousel} className="cursor-grab overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            animate={controls}
            style={{ x }}
            onDragEnd={handleDragEnd}
            className="flex"
          >
            {data.map((feature) => (
              <motion.div key={feature.id} className="m-4">
                <Card className="min-w-[300px] h-[400px] bg-white text-black shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="flex flex-col items-center">
                    <div className="text-4xl">{feature.icon}</div>
                    <CardTitle className="text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
