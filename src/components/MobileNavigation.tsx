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
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  
  const handleLinkClick = () => {
    setIsOpen(false)
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
    setIsOpen(false)
  }, [pathname])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }
  }, [isOpen])

  const isActivePage = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const menuItems = [
    { action: handleFeatureClick, icon: '⚡', label: 'Features', type: 'button' as const },
    { action: handlePricingClick, icon: '💰', label: 'Pricing', type: 'button' as const },
    { href: '/blog', icon: '✍️', label: 'Blog', type: 'link' as const },
    { href: '/login', icon: '🔑', label: 'Sign In', type: 'link' as const },
    { href: '/signup', icon: '🚀', label: 'Get Started', type: 'link' as const, special: true }
  ]

  return (
    <>
      {/* 🌟 FLOATING ACTION BUTTON */}
      <button
        onClick={toggleMenu}
        className={`md:hidden fixed top-4 right-4 w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 z-[100] ${
          isOpen 
            ? 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 shadow-2xl shadow-red-500/50' 
            : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 shadow-xl shadow-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/60'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
        }}
        aria-label="Toggle Menu"
        aria-expanded={isOpen}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {isOpen ? (
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute w-6 h-0.5 bg-white rounded-full transform rotate-45"></div>
              <div className="absolute w-6 h-0.5 bg-white rounded-full transform -rotate-45"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-5 h-0.5 bg-white rounded-full shadow-sm"></div>
              <div className="w-5 h-0.5 bg-white rounded-full shadow-sm"></div>
              <div className="w-5 h-0.5 bg-white rounded-full shadow-sm"></div>
            </div>
          )}
        </div>
      </button>

      {/* 🎭 OVERLAY */}
      <div 
        className={`fixed inset-0 transition-all duration-300 md:hidden z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleLinkClick}
        aria-hidden="true"
        style={{
          background: isOpen 
            ? 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 30%, rgba(0, 0, 0, 0.85) 70%)'
            : 'transparent',
          backdropFilter: isOpen ? 'blur(30px) saturate(150%) brightness(0.8)' : 'blur(0px)',
        }}
      />

      {/* 📱 DROPDOWN MENU */}
      <div 
        className={`md:hidden fixed top-20 right-4 w-48 transition-all duration-300 z-50 ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(20, 20, 40, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item, index) => {
            const isActive = item.type === 'link' && isActivePage(item.href!)
            
            if (item.type === 'button') {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10 w-full text-left"
                  style={{
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                  }}
                >
                  <span className={`text-2xl transition-all duration-300 ${
                  (isActive || item.special) ? 'scale-110 drop-shadow-lg animate-pulse-purple' : 'hover:scale-105'
                }`}>{item.icon}</span>
                  <span className="text-sm font-semibold text-white">
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  item.special
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                    : isActive 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                      : 'hover:bg-white/10'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                <span className={`text-2xl transition-all duration-300 ${
                  (isActive || item.special) ? 'scale-110 drop-shadow-lg animate-pulse-purple' : 'hover:scale-105'
                }`}>{item.icon}</span>
                <span className={`text-sm font-semibold ${
                  (isActive || item.special) ? 'text-purple-200' : 'text-white'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}