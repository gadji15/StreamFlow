"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Film, Tv } from "lucide-react";

export type MinimalPosterItem = {
  id: string;
  title: string;
  year?: number | string;
  poster?: string;
  link: string;
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
      {items.map((itemData) => (
        <motion.div
          variants={item}
          key={itemData.id}
          className={`
            bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
            flex flex-col items-center
            rounded-md
            sm:rounded-lg md:rounded-xl
            h-full
            cursor-pointer
          `}
        >
          <Link
            href={itemData.link}
            aria-label={itemData.title}
            className="w-full h-full flex flex-col items-center"
            tabIndex={0}
          >
            <div
              className={`
                relative aspect-[2/3]
                w-full
                h-full
                flex flex-col items-center
              `}
            >
              <img
                src={itemData.poster || "/placeholder-poster.png"}
                alt={itemData.title}
                className={`
                  w-full h-full object-cover transition-all duration-300
                  rounded-md
                  sm:rounded-lg
                  md:rounded-xl
                `}
                loading="lazy"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                }}
              />
              {/* Effet hover overlay + icône comme sur la home */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {getTypeIcon(itemData.link)}
              </div>
            </div>
            <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
              <h3 className={`
                truncate font-medium w-full text-center
                text-xs
                sm:text-sm
                md:text-base
              `}>{itemData.title}</h3>
              <p className="text-[11px] text-gray-400 w-full text-center">
                {itemData.year ?? ""}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}