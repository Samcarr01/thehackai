'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface InternalMobileNavigationProps {
  userEmail?: string
  userTier?: 'free' | 'pro' | 'ultra'
  showAdminLink?: boolean
}

export default function InternalMobileNavigation({ 
  userEmail, 
  userTier = 'free', 
  showAdminLink = false
}: InternalMobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Handle window resizing for dynamic positioning
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    handleResize() // Set initial size
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Get user's display name from email
  const displayName = userEmail ? userEmail.split('@')[0] : 'User'

  return (
    <>
      {/* 🌀 IRON MAN FLOATING ACTION BUTTON */}
      <button
        onClick={toggleMenu}
        className={`md:hidden fixed top-4 right-4 w-14 h-14 rounded-full transition-all duration-700 transform hover:scale-110 active:scale-95 z-[100] ${
          isOpen 
            ? 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 shadow-2xl shadow-red-500/50 rotate-45 scale-110' 
            : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 shadow-xl shadow-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/60'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isOpen 
            ? '0 20px 40px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            : '0 12px 24px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
        aria-label="Toggle Arc Menu"
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

      {/* 🎭 EPIC HUD OVERLAY */}
      <div 
        className={`fixed inset-0 transition-all duration-700 md:hidden z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleLinkClick}
        aria-hidden="true"
        style={{
          background: isOpen 
            ? 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 30%, rgba(0, 0, 0, 0.85) 70%)'
            : 'transparent',
          backdropFilter: isOpen ? 'blur(30px) saturate(150%) brightness(0.8)' : 'blur(0px)',
          WebkitBackdropFilter: isOpen ? 'blur(30px) saturate(150%) brightness(0.8)' : 'blur(0px)'
        }}
      />

      {/* 🌀 FLOATING RADIAL ARC MENU */}
      <div className="md:hidden z-[60]">
        {[
          { href: '/dashboard', icon: '📊', label: 'Dashboard', angle: 135, delay: 100 },
          { href: '/gpts', icon: '🤖', label: 'GPTs', angle: 180, delay: 200 },
          { href: '/documents', icon: '📚', label: 'Playbooks', angle: 225, delay: 300 },
          { href: '/blog', icon: '✍️', label: 'Blog', angle: 270, delay: 400 }
        ].map((item, index) => {
          const isActive = isActivePage(item.href)
          const radius = 100
          const centerX = (windowSize.width || (typeof window !== 'undefined' ? window.innerWidth : 375) || 375) - 32 - 28 // Safe fallback
          const centerY = 16 + 28 // 16px from top + 28px button center
          const angleRad = (item.angle * Math.PI) / 180
          const x = centerX + Math.cos(angleRad) * radius
          const y = centerY + Math.sin(angleRad) * radius
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`fixed w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 transform hover:scale-125 active:scale-95 ${
                isActive 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-500/60' 
                  : 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-black/40 hover:shadow-purple-500/40'
              } ${isOpen 
                ? 'scale-100 opacity-100 pointer-events-auto' 
                : 'scale-0 opacity-0 pointer-events-none'
              }`}
              style={{
                left: `${x - 32}px`, // Adjusted for 64px button (32px radius)
                top: `${y - 32}px`, // Adjusted for 64px button (32px radius)
                transitionDelay: isOpen ? `${item.delay}ms` : '0ms',
                backdropFilter: 'blur(20px)',
                border: isActive 
                  ? '3px solid rgba(255, 255, 255, 0.6)' 
                  : '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isActive
                  ? '0 12px 40px rgba(139, 92, 246, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                zIndex: 9999
              }}
            >
              <span className={`text-2xl transition-all duration-300 ${
                isActive ? 'scale-110 drop-shadow-lg' : 'hover:scale-105'
              }`}>
                {item.icon}
              </span>
              
              {/* Floating Label */}
              <div 
                className={`absolute left-1/2 transform -translate-x-1/2 mt-16 px-3 py-1.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap transition-all duration-500 ${
                  isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 30, 60, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transitionDelay: isOpen ? `${item.delay + 400}ms` : '0ms'
                }}
              >
                {item.label}
              </div>
            </Link>
          )
        })}

        {/* Settings Button */}
        <Link
          href="/settings"
          onClick={handleLinkClick}
          className={`fixed w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 transform hover:scale-125 active:scale-95 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-black/40 hover:shadow-purple-500/40 ${
            isOpen 
              ? 'scale-100 opacity-100 pointer-events-auto' 
              : 'scale-0 opacity-0 pointer-events-none'
          }`}
          style={{
            left: `${(windowSize.width || (typeof window !== 'undefined' ? window.innerWidth : 375) || 375) - 32 - 28 + Math.cos((315 * Math.PI) / 180) * 100 - 32}px`,
            top: `${16 + 28 + Math.sin((315 * Math.PI) / 180) * 100 - 32}px`,
            transitionDelay: isOpen ? '500ms' : '0ms',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            zIndex: 9999
          }}
        >
          <span className="text-2xl">⚙️</span>
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 mt-16 px-3 py-1.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap transition-all duration-500 ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 30, 60, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transitionDelay: isOpen ? '900ms' : '0ms'
            }}
          >
            Settings
          </div>
        </Link>

        {/* Admin Panel Button (if admin) */}
        {showAdminLink && (
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className={`fixed w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 transform hover:scale-125 active:scale-95 bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/40 hover:shadow-red-500/60 ${
              isOpen 
                ? 'scale-100 opacity-100 pointer-events-auto' 
                : 'scale-0 opacity-0 pointer-events-none'
            }`}
            style={{
              left: `${(windowSize.width || (typeof window !== 'undefined' ? window.innerWidth : 375) || 375) - 32 - 28 + Math.cos((90 * Math.PI) / 180) * 80 - 28}px`,
              top: `${16 + 28 + Math.sin((90 * Math.PI) / 180) * 80 - 28}px`,
              transitionDelay: isOpen ? '600ms' : '0ms',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              zIndex: 9999
            }}
          >
            <span className="text-lg">🔧</span>
          </Link>
        )}

        {/* Sign Out Button */}
        <button
          onClick={async () => {
            try {
              handleLinkClick()
              localStorage.removeItem('supabase-auth-persist')
              localStorage.removeItem('rememberMe')
              const { auth } = await import('@/lib/auth')
              await auth.signOut()
              window.location.href = '/'
            } catch (error) {
              console.error('Sign out error:', error)
              window.location.href = '/'
            }
          }}
          className={`fixed w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 transform hover:scale-125 active:scale-95 bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/40 hover:shadow-red-500/60 ${
            isOpen 
              ? 'scale-100 opacity-100 pointer-events-auto' 
              : 'scale-0 opacity-0 pointer-events-none'
          }`}
          style={{
            left: `${(windowSize.width || (typeof window !== 'undefined' ? window.innerWidth : 375) || 375) - 32 - 28 + Math.cos((45 * Math.PI) / 180) * 80 - 28}px`,
            top: `${16 + 28 + Math.sin((45 * Math.PI) / 180) * 80 - 28}px`,
            transitionDelay: isOpen ? '800ms' : '0ms',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            zIndex: 9999
          }}
        >
          <span className="text-lg">👋</span>
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 mt-16 px-3 py-1.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap transition-all duration-500 ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.9) 0%, rgba(239, 68, 68, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transitionDelay: isOpen ? '900ms' : '0ms'
            }}
          >
            Sign Out
          </div>
        </button>
      </div>

      {/* 🎯 EPIC USER INFO OVERLAY */}
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl backdrop-blur-xl transition-all duration-700 md:hidden z-[60] ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(20, 20, 40, 0.98) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transitionDelay: isOpen ? '1000ms' : '0ms'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm truncate max-w-32">
              {displayName}
            </div>
            <div className={`text-xs font-semibold flex items-center space-x-1 ${
              userTier === 'ultra'
                ? 'text-purple-300'
                : userTier === 'pro'
                  ? 'text-purple-200'
                  : 'text-gray-300'
            }`}>
              <span>
                {userTier === 'ultra' ? '🚀' : userTier === 'pro' ? '✨' : '🆓'}
              </span>
              <span>
                {userTier === 'ultra' ? 'Ultra' : userTier === 'pro' ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}