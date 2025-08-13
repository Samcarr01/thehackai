export default function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs skeleton */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-700 rounded w-12"></div>
            <div className="h-4 bg-gray-700 rounded w-1"></div>
            <div className="h-4 bg-gray-700 rounded w-12"></div>
            <div className="h-4 bg-gray-700 rounded w-1"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
          </div>
        </nav>

        {/* Header skeleton */}
        <header className="mb-12">
          <div className="mb-6">
            <div className="h-6 bg-purple-800/30 rounded-full w-24"></div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gray-700 rounded w-full"></div>
            <div className="h-12 bg-gray-700 rounded w-4/5"></div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </header>

        {/* Content skeleton */}
        <div className="space-y-8">
          {/* Image skeleton */}
          <div className="my-8">
            <div className="blog-image shadow-xl bg-gray-700 rounded-lg h-96"></div>
          </div>

          {/* Text blocks */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/5"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
          ))}

          {/* Another image skeleton */}
          <div className="my-8">
            <div className="blog-image shadow-xl bg-gray-700 rounded-lg h-96"></div>
          </div>

          {/* More text blocks */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i + 5} className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-4/5"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>

        {/* Share section skeleton */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-700 rounded w-32"></div>
            <div className="h-8 bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}