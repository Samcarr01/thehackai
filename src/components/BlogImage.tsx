'use client'

import React from 'react'
import { getBlogImageUrl } from '@/lib/image-utils'

interface BlogImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

// Memoized component that only re-renders when props change
const BlogImage = React.memo(function BlogImage({ 
  src, 
  alt, 
  width = 800, 
  height = 450, 
  className = "" 
}: BlogImageProps) {
  // Ensure stable URL without auth context
  const stableUrl = getBlogImageUrl(src)

  return (
    <figure className="my-4 sm:my-6 md:my-8 clear-both">
      <div className="blog-image shadow-lg sm:shadow-xl relative rounded-lg sm:rounded-xl overflow-hidden">
        {/* Mobile-optimized image with responsive sizing */}
        <img
          src={stableUrl}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
          crossOrigin="anonymous"
          style={{ aspectRatio: '16/9' }}
        />
      </div>
      {alt && (
        <figcaption className="text-center text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 px-2">
          {alt}
        </figcaption>
      )}
    </figure>
  )
})

export default BlogImage