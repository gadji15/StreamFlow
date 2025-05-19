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
          filter: "brightness(0.82) contrast(1.07) saturate(1.08)",
        }}
        loading="eager"
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.currentTarget.src = "/placeholder-backdrop.jpg";
          setLoaded(true);
        }}
      />
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(to bottom, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.6) 13%, rgba(20,20,20,0.0) 35%, rgba(20,20,20,0.0) 66%, rgba(20,20,20,0.76) 100%),
            radial-gradient(ellipse at center, rgba(0,0,0,0.13) 0%, rgba(0,0,0,0.29) 85%, rgba(0,0,0,0.48) 100%)
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