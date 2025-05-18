'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselRailProps<T> {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  slidesToShow?: number;
  minSlideWidth?: number;
  maxSlideWidth?: number;
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
  // Responsive: adapte slidesToShow selon la taille écran
  const [slides, setSlides] = useState(slidesToShow);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 400) setSlides(1);
      else if (window.innerWidth < 600) setSlides(2);
      else if (window.innerWidth < 900) setSlides(3);
      else if (window.innerWidth < 1080) setSlides(4);
      else if (window.innerWidth < 1400) setSlides(5);
      else if (window.innerWidth < 1800) setSlides(6);
      else setSlides(slidesToShow);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesToShow]);

  // --- Embla Carousel pattern éprouvé ---
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: slides,
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className={`relative w-full ${className}`}>
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Faire défiler à gauche"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30"
        tabIndex={0}
      >
        <ChevronLeft className="text-white" />
      </button>
      <div className="overflow-hidden" ref={viewportRef} aria-label={ariaLabel} tabIndex={0} role="region">
        <div className="flex">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 px-2"
              style={{
                width: `calc(100% / ${slides})`,
                minWidth: minSlideWidth,
                maxWidth: maxSlideWidth,
                boxSizing: 'border-box',
              }}
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
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30"
        tabIndex={0}
      >
        <ChevronRight className="text-white" />
      </button>
    </div>
  );
}

export default CarouselRail;