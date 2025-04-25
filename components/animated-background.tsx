"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface AnimatedBackgroundProps {
  children: React.ReactNode
  imageUrl: string
  overlayOpacity?: number
  parallaxStrength?: number
}

export default function AnimatedBackground({
  children,
  imageUrl,
  overlayOpacity = 0.5,
  parallaxStrength = 0.2
}: AnimatedBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${parallaxStrength * 100}%`])
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => setIsLoaded(true)
  }, [imageUrl])
  
  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          y,
          opacity: backgroundOpacity,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"
        style={{ opacity: overlayOpacity }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}