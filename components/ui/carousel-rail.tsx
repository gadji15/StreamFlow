'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselRailProps<T> {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  slidesToShow?: number; // default 6
  minSlideWidth?: number; // px, default 160
  maxSlideWidth?: number; // px, default 200
  className?: string;
  ariaLabel?: string;
  // Si tu veux ajouter lazyLoad, tu peux prévoir un callback ici
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
  // Responsive: adapte slidesToShow selon la taille écran
  const [slides, setSlides] = useState(slidesToShow);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 480) setSlides(2);
      else if (window.innerWidth < 768) setSlides(3);
      else if (window.innerWidth < 1024) setSlides(4);
      else setSlides(slidesToShow);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesToShow]);

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
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-primary/80 transition-colors rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30"
        tabIndex={0}
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <div
        className="overflow-hidden"
        ref={emblaRef}
        aria-label={ariaLabel}
        tabIndex={0}
        role="region"
      >
        <div
          className="flex gap-4 py-1"
          style={{
            minHeight: `${maxSlideWidth * 1.5}px`,
          }}
        >
          {items.map((item, idx) => (
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
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-primary/80 transition-colors rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30"
        tabIndex={0}
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
      {/* Indicateurs de pagination supprimés */}
    </div>
  );
}

export default CarouselRail;