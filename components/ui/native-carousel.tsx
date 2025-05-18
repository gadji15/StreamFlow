import React, { useRef } from "react";

interface NativeCarouselProps {
  children: React.ReactNode;
  cardWidth?: number;
  gap?: number;
}

const NativeCarousel: React.FC<NativeCarouselProps> = ({ children, cardWidth = 160, gap = 16 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll par les flèches
  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Swipe mobile
  let startX = 0;
  let isDragging = false;

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging = true;
    startX = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const moveX = e.touches[0].clientX;
    const diffX = startX - moveX;
    if (containerRef.current) {
      containerRef.current.scrollLeft += diffX;
    }
    startX = moveX;
  };
  const onTouchEnd = () => {
    isDragging = false;
  };

  return (
    {/* Le parent direct NE DOIT PAS avoir overflow-x/hidden ! */}
    <div className="relative flex items-center group w-full">
      <button
        className="absolute left-0 top-0 bottom-0 h-full w-10 bg-gradient-to-r from-black/60 via-black/40 to-transparent text-white text-2xl z-20 flex items-center justify-center hover:bg-black/80 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        onClick={() => scrollBy(-cardWidth * 2 - gap * 2)}
        aria-label="Scroll left"
        type="button"
        tabIndex={0}
        style={{ pointerEvents: "auto" }}
      >
        &#8249;
      </button>
      <div
        className="flex overflow-x-auto gap-4 px-12 py-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        ref={containerRef}
        style={{ scrollBehavior: "smooth" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
      <button
        className="absolute right-0 top-0 bottom-0 h-full w-10 bg-gradient-to-l from-black/60 via-black/40 to-transparent text-white text-2xl z-20 flex items-center justify-center hover:bg-black/80 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        onClick={() => scrollBy(cardWidth * 2 + gap * 2)}
        aria-label="Scroll right"
        type="button"
        tabIndex={0}
        style={{ pointerEvents: "auto" }}
      >
        &#8250;
      </button>
    </div>
    {/* 
      ATTENTION : 
      - Vérifiez dans vos layouts globaux (app/layout.tsx, pages/_app.tsx, styles/globals.css, etc.) 
        qu'aucun parent du carrousel natif n'a overflow-x: hidden, overflow: hidden ou overflow-x-auto.
      - Ne pas ajouter de padding/margin horizontal excessif sur le parent direct.
      - Les boutons flèches sont z-20, donc toujours au-dessus des images.
      - Si vous voyez des scrollbars masquées, vérifiez qu'aucun CSS global ne masque ::-webkit-scrollbar ou scrollbar-width.
    */}
  );
};

export default NativeCarousel;