"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Film, Tv } from "lucide-react";
import SeriesCard from "./SeriesCard";
import FilmCard from "./FilmCard";

export type MinimalPosterItem = {
  id: string;
  title: string;
  year?: number | string;
  poster?: string;
  link: string; // Ajout de la propriété link
};

type MinimalPosterGridProps = {
  items: MinimalPosterItem[];
};

export default function MinimalPosterGrid({ items }: MinimalPosterGridProps) {
  // Animation variants identiques à la home
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

  // Détecte si c'est un film ou une série à partir du lien
  const getTypeIcon = (link: string) => {
    if (link.includes("/films/")) {
      return <Film className="w-7 h-7 text-white" />;
    } else if (link.includes("/series/")) {
      return <Tv className="w-7 h-7 text-white" />;
    }
    return null;
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
        const isMovie = itemData.link.includes('/films/');
        return isMovie ? (
          <FilmCard
            key={itemData.id}
            movie={{
              id: itemData.id,
              title: itemData.title,
              poster: itemData.poster,
              year: itemData.year,
              isVIP: false
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
              isVIP: false
            }}
          />
        );
      })}
    </motion.div>
  );
}