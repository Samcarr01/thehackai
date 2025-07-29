'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface MobileNavigationProps {
  onFeatureClick: () => void
  onPricingClick: () => void
}

export default function MobileNavigation({ onFeatureClick, onPricingClick }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [animateItems, setAnimateItems] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Start item animations after menu opens
      setTimeout(() => setAnimateItems(true), 100)
    } else {
      setAnimateItems(false)
    }
  }
  
  const handleLinkClick = () => {
    setAnimateItems(false)
    setTimeout(() => setIsOpen(false), 150)
  }

  const handleFeatureClick = () => {
    onFeatureClick()
    handleLinkClick()
  }

  const handlePricingClick = () => {
    onPricingClick()
    handleLinkClick()
  }

  // Close menu on route change
  useEffect(() => {
    setAnimateItems(false)
    setIsOpen(false)
  }, [pathname])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isActivePage = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-purple-900/20 transition-all duration-200"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 flex flex-col justify-center items-center">
          <span 
            className={`w-full h-0.5 bg-gray-300 transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-0.5' : 'mb-1'
            }`}
          />
          <span 
            className={`w-full h-0.5 bg-gray-300 transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span 
            className={`w-full h-0.5 bg-gray-300 transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-0.5' : 'mt-1'
            }`}
          />
        </div>
      </button>

      {/* Overlay with Blur */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 md:hidden z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleLinkClick}
        aria-hidden="true"
      />

      {/* Beautiful Centered Modal */}
      <div 
        className={`fixed inset-0 flex items-center justify-center p-4 md:hidden z-50 pointer-events-none ${
          isOpen ? '' : ''
        }`}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className={`
          w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-white/10 
          rounded-3xl shadow-2xl shadow-purple-500/10 transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}
        `}>
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Navigation
            </h2>
            <button
              onClick={handleLinkClick}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-6 py-4">
            <nav className="space-y-2">
              {[
                { action: handleFeatureClick, icon: '⚡', label: 'Features', type: 'button' as const },
                { action: handlePricingClick, icon: '💰', label: 'Pricing', type: 'button' as const },
                { href: '/blog', icon: '✍️', label: 'Blog', type: 'link' as const }
              ].map((item) => (
                item.type === 'button' ? (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="relative flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] w-full text-left text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="transition-transform duration-300 group-hover:scale-105">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    onClick={handleLinkClick}
                    className={`relative flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] ${
                      isActivePage(item.href!)
                        ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`transition-transform duration-300 ${
                        isActivePage(item.href!) ? 'scale-110' : 'group-hover:scale-105'
                      }`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActivePage(item.href!) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                    {!isActivePage(item.href!) && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                    )}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* Auth Actions */}
          <div className="border-t border-white/10 px-6 py-4 space-y-3">
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="relative flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] text-gray-300 hover:text-white hover:bg-white/10"
            >
              <div className="flex items-center space-x-3">
                <span className="transition-transform duration-300 group-hover:scale-105">🔑</span>
                <span>Sign In</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
            </Link>
            
            <Link
              href="/signup"
              onClick={handleLinkClick}
              className="w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group min-h-[44px] justify-center"
            >
              <div className="flex items-center space-x-3">
                <span className="transition-transform duration-300 group-hover:scale-105">🚀</span>
                <span>Get Started</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}