import { Skeleton } from "./ui/skeleton";

/**
 * Skeleton fiche film/série : affiche un poster, titre, métadonnées, description avec effet shimmer.
 */
export default function FilmSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-4xl mx-auto py-8">
      {/* Poster */}
      <div className="flex-shrink-0">
        <Skeleton className="w-[180px] h-[270px] md:w-[240px] md:h-[360px] rounded-xl" />
      </div>
      {/* Infos */}
      <div className="flex-1 space-y-4 flex flex-col justify-start">
        <Skeleton className="h-7 w-2/3 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-1/2 rounded" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}