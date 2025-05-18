'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselRailProps<T> {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  slidesToShow?: number; // default 6, DOIT être géré dynamiquement par le parent pour une responsivité parfaite
  minSlideWidth?: number; // px, default 160
  maxSlideWidth?: number; // px, default 200
  className?: string;
  ariaLabel?: string;
}

export function CarouselRail<T>({
  items,
  renderItem,
  slidesToShow = 6,
  minSlideWidth = 160,
  maxSlideWidth = 200,
  className = '',
  ariaLabel = 'Liste de contenus défilante',
}: CarouselRailProps<T>) {
  // La responsivité est maintenant entièrement contrôlée par la prop slidesToShow passée par le parent.
  const slides = slidesToShow;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true,
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const totalPages = Math.ceil(items.length / slides);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Gère l'état des boutons de navigation et la pagination
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      // Pagination
      const idx = emblaApi.selectedScrollSnap();
      setSelectedPage(idx);
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  return (
    <div className={`relative ${className}`}>
      {/* Boutons navigation */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Faire défiler à gauche"
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-primary/80 transition-colors rounded-full w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 flex items-center justify-center disabled:opacity-30"
        tabIndex={0}
        style={{ minWidth: 24, minHeight: 24 }}
      >
        <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
      </button>
      <div
        className="overflow-x-auto scrollbar-hide -mx-2 xs:-mx-3 sm:mx-0"
        ref={emblaRef}
        aria-label={ariaLabel}
        tabIndex={0}
        role="region"
      >
        <div
          className="flex gap-3 xs:gap-4 py-1 px-2 xs:px-3 sm:px-0"
          style={{
            minHeight: `${maxSlideWidth * 1.3}px`,
          }}
        >
          {items.slice(0, slides).map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0"
              style={{
                minWidth: minSlideWidth,
                maxWidth: maxSlideWidth,
                width: `calc(100vw / ${slides} - 1.2rem)`,
              }}
              tabIndex={-1}
            >
              {renderItem(item, idx)}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Faire défiler à droite"
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-primary/80 transition-colors rounded-full w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 flex items-center justify-center disabled:opacity-30"
        tabIndex={0}
        style={{ minWidth: 24, minHeight: 24 }}
      >
        <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
      </button>
      {/* Indicateurs de pagination supprimés */}
    </div>
  );
}

export default CarouselRail;