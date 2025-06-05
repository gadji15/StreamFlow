"use client";
import Link from "next/link";
import { Film, Tv } from "lucide-react";
import { motion } from "framer-motion";
import FilmCard from "./FilmCard";
import SeriesCard from "./SeriesCard";

export type SuggestionItem = {
  id: string;
  title: string;
  genre?: string;
  poster?: string;
  link: string;
  isVip?: boolean;
  year?: number | string;
  type?: "movie" | "series";
};

type SuggestionGridProps = {
  items: SuggestionItem[];
  isMovie?: boolean;
};

export default function SuggestionGrid({ items, isMovie }: SuggestionGridProps) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`
        w-full
        [display:grid]
        gap-3
        [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
      `}
    >
      {items.map((itemData) => {
        const type = itemData.type ?? (isMovie ? "movie" : "series");
        return type === "movie" ? (
          <FilmCard
            key={itemData.id}
            movie={{
              id: itemData.id,
              title: itemData.title,
              poster: itemData.poster,
              year: itemData.year,
              isVIP: itemData.isVip ?? false
            }}
          />
        ) : (
          <SeriesCard
            key={itemData.id}
            series={{
              id: itemData.id,
              title: itemData.title,
              poster: itemData.poster,
              year: itemData.year,
              isVIP: itemData.isVip ?? false
            }}
          />
        );
      })}
    </motion.div>
  );
}