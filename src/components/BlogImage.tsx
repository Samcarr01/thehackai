'use client'

import { useState, memo } from 'react'
import { getBlogImageUrl } from '@/lib/image-utils'

interface BlogImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

// Memoized to prevent re-renders during scroll
const BlogImage = memo(function BlogImage({ 
  src, 
  alt, 
  width = 800, 
  height = 450, 
  className = "" 
}: BlogImageProps) {
  // Ensure stable URL without auth context
  const stableUrl = getBlogImageUrl(src)
  const [hasError, setHasError] = useState(false)

  // Debug logging for URL transformation
  console.log('🔍 BlogImage component:', {
    originalSrc: src,
    transformedUrl: stableUrl,
    alt: alt,
    component: 'BlogImage'
  })

  const handleError = () => {
    if (!hasError) {
      console.error('🚨 BLOG IMAGE ERROR:', {
        originalSrc: src,
        stableUrl: stableUrl,
        alt: alt,
        timestamp: new Date().toISOString()
      })
      setHasError(true)
    }
  }

  const handleLoad = () => {
    console.log('✅ BLOG IMAGE LOADED:', {
      originalSrc: src,
      stableUrl: stableUrl,
      alt: alt,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <figure className="my-8 clear-both">
      <div className="blog-image shadow-xl relative">
        {/* Use native HTML img to completely bypass Next.js processing */}
        <img
          src={hasError ? '/default-blog-image.svg' : stableUrl}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
          onError={handleError}
          onLoad={handleLoad}
          crossOrigin="anonymous"
          style={{ aspectRatio: '16/9' }}
        />
        {hasError && (
          <div className="absolute bottom-2 left-2 bg-red-600/80 text-white text-xs px-2 py-1 rounded">
            Image unavailable
          </div>
        )}
      </div>
      {alt && (
        <figcaption className="text-center text-sm text-gray-400 mt-3">
          {alt}
        </figcaption>
      )}
    </figure>
  )
})

export default BlogImage