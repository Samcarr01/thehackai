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
    <figure className="my-3 sm:my-4 md:my-6 lg:my-8 clear-both max-w-full">
      <div className="blog-image shadow-md sm:shadow-lg md:shadow-xl relative rounded-md sm:rounded-lg md:rounded-xl overflow-hidden max-w-full">
        {/* Mobile-optimized image with proper constraints */}
        <img
          src={stableUrl}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto object-cover ${className}`}
          loading="lazy"
          crossOrigin="anonymous"
          style={{ 
            aspectRatio: '16/9',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>
      {alt && (
        <figcaption className="text-center text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 md:mt-3 px-1 sm:px-2">
          {alt}
        </figcaption>
      )}
    </figure>
  )
})

export default BlogImage