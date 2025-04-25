"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Info, Play, Plus, Star } from "lucide-react";
import { VipBadge } from "./vip-badge";

interface ContentItem {
  id: string;
  title: string;
  posterImage: string;
  type: "movie" | "series" | "episode";
  rating: number;
  year: number;
  vipOnly?: boolean;
  isNew?: boolean;
  isTop?: boolean;
}

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  viewAllUrl?: string;
  items: ContentItem[];
  layout?: "default" | "large" | "showcase";
}

export function ContentSection({
  title,
  subtitle,
  viewAllUrl,
  items,
  layout = "default",
}: ContentSectionProps) {
  const [showControls, setShowControls] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScrollable = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      
      // Re-check scrollability after animation
      setTimeout(checkScrollable, 400);
    }
  };

  // Handle scroll event to update button states
  const handleScroll = () => {
    checkScrollable();
  };

  const getItemWidth = () => {
    switch (layout) {
      case "large":
        return "min-w-[280px] sm:min-w-[320px]";
      case "showcase":
        return "min-w-[300px] sm:min-w-[400px] md:min-w-[500px]";
      default:
        return "min-w-[160px] sm:min-w-[180px] md:min-w-[200px]";
    }
  };

  return (
    <section 
      className="py-6 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>
          {viewAllUrl && (
            <Link 
              href={viewAllUrl} 
              className="text-sm font-medium text-primary hover:underline transition-colors"
            >
              Voir tout
            </Link>
          )}
        </div>
        
        {/* Carousel */}
        <div className="relative group">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 rounded-r-lg p-2 transition-all duration-300 ${
              (showControls && canScrollLeft) ? "opacity-100" : "opacity-0"
            } hover:bg-surface-light`}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 rounded-l-lg p-2 transition-all duration-300 ${
              (showControls && canScrollRight) ? "opacity-100" : "opacity-0"
            } hover:bg-surface-light`}
            aria-label="Scroll right"
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Items Container */}
          <div
            ref={containerRef}
            className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            onScroll={handleScroll}
          >
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`${getItemWidth()} pr-4 flex-shrink-0`}
              >
                <motion.div 
                  className="content-card h-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/${item.type === "episode" ? "episodes" : item.type === "series" ? "series" : "movies"}/${item.id}`}>
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      <Image
                        src={item.posterImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes={layout === "large" ? "320px" : layout === "showcase" ? "500px" : "200px"}
                      />
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {item.vipOnly && <VipBadge />}
                        {item.isNew && <span className="badge-new">NOUVEAU</span>}
                        {item.isTop && <span className="badge-top">TOP</span>}
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="content-card-info">
                        <h3 className="font-medium line-clamp-2 mb-1">{item.title}</h3>
                        <div className="flex items-center text-sm text-gray-300 mb-3">
                          <span>{item.year}</span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                            <span>{item.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="btn-play btn-sm">
                            <Play className="w-4 h-4" />
                            Lire
                          </button>
                          <button className="btn-secondary btn-sm">
                            <Plus className="w-4 h-4" />
                          </button>
                          <button className="btn-secondary btn-sm">
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}