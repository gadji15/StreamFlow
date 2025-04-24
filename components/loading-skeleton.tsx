interface LoadingSkeletonProps {
  type: "hero" | "carousel" | "details" | "grid"
  count?: number
}

export default function LoadingSkeleton({ type, count = 8 }: LoadingSkeletonProps) {
  switch (type) {
    case "hero":
      return (
        <div className="relative h-[80vh] min-h-[600px] w-full animate-pulse bg-gray-800">
          <div className="container relative z-10 mx-auto h-full px-4 flex items-center">
            <div className="max-w-2xl">
              <div className="h-12 w-3/4 bg-gray-700 rounded-md mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-4 w-12 bg-gray-700 rounded-full"></div>
                <div className="h-4 w-12 bg-gray-700 rounded-full"></div>
                <div className="h-4 w-12 bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-gray-700 rounded-md mb-2"></div>
              <div className="h-4 w-full bg-gray-700 rounded-md mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-700 rounded-md mb-6"></div>
              <div className="flex space-x-4">
                <div className="h-10 w-32 bg-gray-700 rounded-md"></div>
                <div className="h-10 w-32 bg-gray-700 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      )

    case "carousel":
      return (
        <div className="flex space-x-4 py-4 overflow-x-auto">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[220px] animate-pulse">
              <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )

    case "details":
      return (
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-800 rounded-lg"></div>
            <div className="w-full md:w-2/3">
              <div className="h-10 bg-gray-800 rounded-md w-3/4 mb-4"></div>
              <div className="flex space-x-4 mb-4">
                <div className="h-6 w-20 bg-gray-800 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-800 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-800 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-6"></div>
              <div className="flex space-x-4 mb-8">
                <div className="h-10 w-32 bg-gray-800 rounded-md"></div>
                <div className="h-10 w-32 bg-gray-800 rounded-md"></div>
              </div>
              <div className="h-6 bg-gray-800 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-800 rounded-md"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case "grid":
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex-shrink-0 animate-pulse">
              <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}
