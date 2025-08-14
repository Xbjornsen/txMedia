export default function ImageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded-xl w-full h-64 md:h-80"></div>
      <div className="mt-2 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
}