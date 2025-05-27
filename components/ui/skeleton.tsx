import { cn } from "@/lib/utils";

/**
 * Skeleton générique avec effet shimmer.
 * Props :
 *  - className : taille, forme, etc.
 * Utilisation :
 *  <Skeleton className="w-40 h-60" />
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-md",
        className
      )}
      {...props}
    >
      <span
        className="absolute inset-0 block animate-shimmer bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"
        style={{
          backgroundSize: "200% 100%",
          backgroundPosition: "200% 0",
        }}
      ></span>
    </div>
  );
}

// Animation shimmer via Tailwind + CSS
// Ajoutez ceci dans votre globals.css (si pas déjà présent) :
/*
@layer utilities {
  .animate-shimmer {
    animation: shimmer 1.4s infinite linear;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
}
*/

export { Skeleton };
