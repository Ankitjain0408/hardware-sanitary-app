export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`} />;
}

export function GridSkeleton({ items = 8, className = "" }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 overflow-hidden">
          <SkeletonBlock className="w-full aspect-[4/3]" />
          <div className="p-6 space-y-3">
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="flex items-center justify-between pt-1">
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="h-6 w-28 rounded-full" />
            </div>
            <SkeletonBlock className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}


