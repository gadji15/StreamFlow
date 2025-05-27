import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton de catalogue : grille de fausses cartes films/séries avec shimmer.
 * Props :
 *  - count : nombre d’items (par défaut 8)
 *  - cardClassName : pour personnaliser la taille/forme des cartes
 */
export default function CatalogSkeleton({
  count = 8,
  cardClassName = "h-60 w-full max-w-[180px] md:h-72 md:max-w-[220px]"
}: {
  count?: number;
  cardClassName?: string;
}) {
  return (
    <div
      className={`
        w-full
        grid gap-3
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
        2xl:grid-cols-8
        justify-items-center
      `}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 items-center w-full">
          <Skeleton className={cardClassName + " aspect-[2/3]"} />
          <Skeleton className="h-4 w-3/4 mt-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}