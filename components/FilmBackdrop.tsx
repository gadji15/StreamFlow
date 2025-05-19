import React, { useRef, useState } from "react";

/**
 * Affiche le backdrop en pleine largeur avec overlays premium, flou et animation.
 */
export default function FilmBackdrop({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="fixed top-0 left-0 right-0 w-full h-[50vh] md:h-[65vh] lg:h-[75vh] z-[-1] transition-all duration-500">
      {/* Backdrop image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.currentTarget.src = "/placeholder-backdrop.jpg";
          setLoaded(true);
        }}
        style={{
          filter: "brightness(0.72) saturate(1.1)",
        }}
      />
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(to bottom, rgba(20,20,20,0.96) 0%, rgba(20,20,20,0.7) 10%, rgba(20,20,20,0.0) 33%, rgba(20,20,20,0.0) 70%, rgba(20,20,20,0.87) 100%),
            radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.44) 85%, rgba(0,0,0,0.65) 100%)
          `,
          zIndex: 2,
        }}
      />
      {/* Glass blur effect at the bottom for main card */}
      <div
        className="absolute left-0 right-0 bottom-0 h-28 md:h-44 backdrop-blur-xl bg-black/30"
        aria-hidden="true"
        style={{ zIndex: 3 }}
      />
    </div>
  );
}