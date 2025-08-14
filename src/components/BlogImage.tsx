'use client'

import { getBlogImageUrl } from '@/lib/image-utils'

interface BlogImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

// Extremely simple component that renders once and never re-renders
export default function BlogImage({ 
  src, 
  alt, 
  width = 800, 
  height = 450, 
  className = "" 
}: BlogImageProps) {
  // Ensure stable URL without auth context
  const stableUrl = getBlogImageUrl(src)

  return (
    <figure className="my-8 clear-both">
      <div className="blog-image shadow-xl relative">
        {/* Ultra-simple img tag with no state or handlers */}
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
        <figcaption className="text-center text-sm text-gray-400 mt-3">
          {alt}
        </figcaption>
      )}
    </figure>
  )
}