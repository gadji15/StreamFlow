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

  // Dynamically set slidesToScroll to match slides (number visible)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: slides,
    containScroll: 'trimSnaps',
    dragFree: false, // important: false pour un vrai "snap" façon xalaflix
    skipSnaps: false,
  });


  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [pageIndexes, setPageIndexes] = useState<number[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);

  // Génère les index de début de "page"
  useEffect(() => {
    // Si moins de slides que la vue, une seule page
    if (items.length <= slides) {
      setPageIndexes([0]);
      return;
    }
    const idxs = [];
    for (let i = 0; i < items.length; i += slides) {
      idxs.push(i);
    }
    setPageIndexes(idxs);
  }, [items.length, slides]);

  // Scroll par page entière
  const scrollPrev = useCallback(() => {
    if (emblaApi && pageIndexes.length > 0) {
      const currentSnap = emblaApi.selectedScrollSnap();
      const currentPage = pageIndexes.findIndex(idx => idx === currentSnap);
      const prevPage = Math.max(currentPage - 1, 0);
      emblaApi.scrollTo(pageIndexes[prevPage]);
    }
  }, [emblaApi, pageIndexes]);
  const scrollNext = useCallback(() => {
    if (emblaApi && pageIndexes.length > 0) {
      const currentSnap = emblaApi.selectedScrollSnap();
      const currentPage = pageIndexes.findIndex(idx => idx === currentSnap);
      const nextPage = Math.min(currentPage + 1, pageIndexes.length - 1);
      emblaApi.scrollTo(pageIndexes[nextPage]);
    }
  }, [emblaApi, pageIndexes]);

  // Gère l'état des boutons de navigation et la pagination
  useEffect(() => {
    if (!emblaApi || pageIndexes.length === 0) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.selectedScrollSnap() > 0);
      setCanScrollNext(emblaApi.selectedScrollSnap() < items.length - slides);
      // Trouve la page active
      const snap = emblaApi.selectedScrollSnap();
      const page = pageIndexes.findIndex(idx => idx === snap);
      setSelectedPage(page === -1 ? 0 : page);
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, items.length, slides, pageIndexes]);

  return (
    <div className={`relative ${className}`}>
      {/* Boutons navigation */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Faire défiler à gauche"
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-primary/80 transition-colors rounded-full w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        tabIndex={0}
        style={{ minWidth: 28, minHeight: 28 }}
      >
        <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
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
                minWidth: `min(${minSlideWidth}px, calc(100vw / ${slides}))`,
                maxWidth: `${maxSlideWidth}px`,
                width: `calc(100%/${slides})`,
                transition: 'width 0.3s, min-width 0.3s, max-width 0.3s',
              }}
              tabIndex={0}
              aria-label={`Contenu ${idx + 1} sur ${items.length}`}
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
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-primary/80 transition-colors rounded-full w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        tabIndex={0}
        style={{ minWidth: 28, minHeight: 28 }}
      >
        <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
      </button>
      {/* Pagination dots interactive */}
      {pageIndexes.length > 1 && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {pageIndexes.map((idx, i) => (
            <button
              key={i}
              className={`h-2 w-2 rounded-full border border-fuchsia-600 transition-all duration-200 ${selectedPage === i ? 'bg-fuchsia-400 scale-110' : 'bg-gray-500/40'}`}
              onClick={() => emblaApi && emblaApi.scrollTo(idx)}
              aria-label={`Aller à la page ${i + 1}`}
              tabIndex={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CarouselRail;