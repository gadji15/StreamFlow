import { Skeleton } from "./ui/skeleton";

/**
 * AdminSkeleton : skeleton pour dashboard admin (tableau ou cards).
 */
export default function AdminSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <Skeleton className="h-8 w-2/3 mb-6" />
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-0 bg-gray-800">
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
        </div>
        <div>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-0 border-t border-gray-800 items-center"
            >
              <Skeleton className="h-5 w-full col-span-1 my-2" />
              <Skeleton className="h-5 w-full col-span-1 my-2" />
              <Skeleton className="h-5 w-full col-span-1 my-2" />
              <Skeleton className="h-5 w-full col-span-1 my-2" />
              <Skeleton className="h-5 w-full col-span-1 my-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}