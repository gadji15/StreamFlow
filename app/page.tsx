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
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSection />
      
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                Découvrez un monde de divertissement
              </h2>
              <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                Des milliers de films et séries vous attendent. Parcourez notre catalogue et trouvez votre prochain coup de cœur.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/films">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Explorer les films
                </Button>
              </Link>
              <Link href="/series">
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600/10">
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