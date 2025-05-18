import { useMediaQuery } from "./use-media-query";

/**
 * Renvoie un nombre optimal d'éléments à afficher selon la taille d'écran.
 * Inspiré des bonnes pratiques des plateformes de streaming modernes.
 */
/**
 * Retourne dynamiquement le nombre de contenus à charger et à afficher
 * (synchronise le parent et le carrousel pour une responsivité parfaite).
 */
/**
 * Retourne le nombre de contenus à CHARGER (ex: 24 pour expérience Xalaflix)
 * et le nombre de slides à afficher dans le viewport (responsive).
 * On charge toujours beaucoup, on adapte juste slidesToShow pour le viewport.
 */
export function useResponsiveCount() {
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  // Toujours charger beaucoup d'éléments !
  const count = 24;

  if (is2xl) return { count, slidesToShow: 14 };
  if (isXl)  return { count, slidesToShow: 12 };
  if (isLg)  return { count, slidesToShow: 10 };
  if (isMd)  return { count, slidesToShow: 8 };
  if (isSm)  return { count, slidesToShow: 6 };
  return { count, slidesToShow: 3 }; // mobile : viewport 2–3, mais rail complet scrollable
}