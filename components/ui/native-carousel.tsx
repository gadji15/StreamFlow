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
    <div className="relative flex items-center overflow-hidden group">
      <button
        className="absolute left-0 h-full w-10 bg-black/50 text-white text-2xl z-10 flex items-center justify-center hover:bg-black/80 transition"
        onClick={() => scrollBy(-cardWidth * 2 - gap * 2)}
        aria-label="Scroll left"
        type="button"
        tabIndex={0}
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
        className="absolute right-0 h-full w-10 bg-black/50 text-white text-2xl z-10 flex items-center justify-center hover:bg-black/80 transition"
        onClick={() => scrollBy(cardWidth * 2 + gap * 2)}
        aria-label="Scroll right"
        type="button"
        tabIndex={0}
      >
        &#8250;
      </button>
    </div>
  );
};

export default NativeCarousel;