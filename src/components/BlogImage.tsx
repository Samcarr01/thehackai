'use client'

import { useState } from 'react'
import Image from 'next/image'

interface BlogImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export default function BlogImage({ 
  src, 
  alt, 
  width = 800, 
  height = 450, 
  className = "" 
}: BlogImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) { // Only try fallback once
      console.warn('⚠️ Blog image failed to load:', src)
      setHasError(true)
      setImageSrc('/default-blog-image.svg') // Fallback to default image
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <figure className="my-8 clear-both">
      <div className="blog-image shadow-xl relative">
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="(max-width: 768px) 100vw, 800px"
          onError={handleError}
          onLoad={handleLoad}
          style={{
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
        {hasError && (
          <div className="absolute bottom-2 left-2 bg-red-600/80 text-white text-xs px-2 py-1 rounded">
            Image failed to load
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
}