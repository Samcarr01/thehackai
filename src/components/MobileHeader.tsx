'use client'

import Link from 'next/link'
import Image from 'next/image'

interface MobileHeaderProps {
  showLogo?: boolean
  className?: string
}

export default function MobileHeader({ showLogo = true, className = '' }: MobileHeaderProps) {
  if (!showLogo) return null

  return (
    <div 
      className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10 ${className}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        minHeight: 'calc(64px + env(safe-area-inset-top))'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 min-h-[64px]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span 
            className="text-xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            thehackai
          </span>
        </Link>

        {/* Spacer for hamburger menu positioning */}
        <div className="w-10 h-10" />
      </div>
    </div>
  )
}