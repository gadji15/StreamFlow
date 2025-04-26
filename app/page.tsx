"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { ContentSection } from "@/components/content-section";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-16">
      <HeroSection />
      
      <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[90%] sm:max-w-[85%] md:max-w-[80%]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white">
                Découvrez un monde de divertissement
              </h2>
              <p className="max-w-[900px] text-gray-400 text-sm sm:text-base md:text-lg mx-auto">
                Des milliers de films et séries vous attendent. Parcourez notre catalogue et trouvez votre prochain coup de cœur.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/films" className="w-full sm:w-auto">
                <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                  Explorer les films
                </Button>
              </Link>
              <Link href="/series" className="w-full sm:w-auto">
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600/10 w-full">
                  Découvrir les séries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <div ref={ref}>
        <ContentSection 
          title="Films populaires" 
          icon={<TrendingUp className="h-5 w-5" />}
          contentType="movie"
          isAnimated={inView}
        />
      </div>
      
      <ContentSection 
        title="Séries à ne pas manquer" 
        icon={<Sparkles className="h-5 w-5" />}
        contentType="series"
        isVipSection={false}
      />
      
      <ContentSection 
        title="Exclusivement VIP" 
        icon={<Sparkles className="h-5 w-5" />}
        contentType="movie"
        isVipSection={true}
      />
    </main>
  );
}