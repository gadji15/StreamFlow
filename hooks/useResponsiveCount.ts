import { useMediaQuery } from "./use-media-query";

/**
 * Renvoie un nombre optimal d'éléments à afficher selon la taille d'écran.
 * Inspiré des bonnes pratiques des plateformes de streaming modernes.
 */
/**
 * Retourne dynamiquement le nombre de contenus à charger et à afficher
 * (synchronise le parent et le carrousel pour une responsivité parfaite).
 */
export function useResponsiveCount() {
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  if (is2xl) return { count: 14, slidesToShow: 14 };
  if (isXl)  return { count: 12, slidesToShow: 12 };
  if (isLg)  return { count: 10, slidesToShow: 10 };
  if (isMd)  return { count: 8, slidesToShow: 8 };
  if (isSm)  return { count: 6, slidesToShow: 6 };
  return { count: 4, slidesToShow: 4 }; // mobile
}