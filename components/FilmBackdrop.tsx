import React, { useRef, useState } from "react";

/**
 * Affiche le backdrop en pleine largeur avec overlays premium, flou et animation.
 */
export default function FilmBackdrop({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="absolute top-0 left-0 w-full h-[50vh] md:h-[65vh] lg:h-[75vh] z-0 transition-all duration-500">
      {/* Backdrop image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          objectPosition: "center 35%",
          filter:
            "brightness(1.06) contrast(1.26) saturate(1.18) drop-shadow(0 1px 3px rgba(0,0,0,0.12))",
          imageRendering: "auto", // Prevents unwanted pixelation
        }}
        loading="eager"
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.currentTarget.src = "/placeholder-backdrop.jpg";
          setLoaded(true);
        }}
      />
      {/* Subtle noise overlay for filmic look */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "url('data:image/svg+xml;utf8,<svg width=\"150\" height=\"150\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.6\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\" opacity=\"0.09\"/></svg>')",
          zIndex: 2,
        }}
      />
      {/* Strong black overlay for maximum readability at the top */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom, rgba(10,10,10,0.80) 0%, rgba(10,10,10,0.55) 30%, rgba(10,10,10,0.00) 70%)",
          zIndex: 3,
        }}
      />
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(to bottom, rgba(20,20,20,0.64) 0%, rgba(20,20,20,0.22) 13%, rgba(20,20,20,0.0) 36%, rgba(20,20,20,0.0) 68%, rgba(20,20,20,0.37) 100%),
            radial-gradient(ellipse at center, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.09) 85%, rgba(0,0,0,0.17) 100%)
          `,
          zIndex: 4,
        }}
      />
      {/* Glass blur effect at the bottom for main card */}
      <div
        className="absolute left-0 right-0 bottom-0 h-28 md:h-44 backdrop-blur-xl bg-black/30"
        aria-hidden="true"
        style={{ zIndex: 5 }}
      />
    </div>
  );
}