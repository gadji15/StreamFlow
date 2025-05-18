import { useMediaQuery } from "./use-media-query";

/**
 * Renvoie un nombre optimal d'éléments à afficher selon la taille d'écran.
 * Inspiré des bonnes pratiques des plateformes de streaming modernes.
 */
export function useResponsiveCount() {
  // breakpoints tailwind : sm=640, md=768, lg=1024, xl=1280, 2xl=1536
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  if (is2xl) return 14;
  if (isXl) return 12;
  if (isLg) return 10;
  if (isMd) return 8;
  if (isSm) return 6;
  return 4; // mobile
}