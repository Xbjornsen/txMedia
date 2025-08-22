interface GallerySkeletonProps {
  count?: number;
}

export default function GallerySkeleton({ count = 8 }: GallerySkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-[var(--gradient-start)] rounded-xl overflow-hidden shadow-lg border border-[var(--secondary)]/10"
        >
          {/* Image skeleton */}
          <div className="aspect-square loading-shimmer" />
          
          {/* Content skeleton */}
          <div className="p-6 space-y-3">
            {/* Title */}
            <div className="h-6 loading-shimmer rounded" />
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 loading-shimmer rounded w-3/4" />
              <div className="h-4 loading-shimmer rounded w-1/2" />
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 loading-shimmer rounded w-1/3" />
              <div className="h-4 loading-shimmer rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ImageGridSkeletonProps {
  columns?: 2 | 3 | 4 | 5;
  count?: number;
}

export function ImageGridSkeleton({ columns = 4, count = 12 }: ImageGridSkeletonProps) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  };

  return (
    <div className={`grid gap-4 ${gridClasses[columns]}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-square loading-shimmer rounded-lg"
        />
      ))}
    </div>
  );
}