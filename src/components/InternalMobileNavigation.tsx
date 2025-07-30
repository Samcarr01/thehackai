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

  const menuItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/gpts', icon: '🤖', label: 'GPTs' },
    { href: '/documents', icon: '📚', label: 'Playbooks' },
    { href: '/blog', icon: '✍️', label: 'Blog' },
    { href: '/settings', icon: '⚙️', label: 'Settings' }
  ]

  return (
    <>
      {/* 🌀 EPIC IRON MAN FLOATING ACTION BUTTON */}
      <button
        onClick={toggleMenu}
        className={`md:hidden fixed top-4 right-4 w-14 h-14 rounded-full transition-all duration-700 transform hover:scale-110 active:scale-95 z-[100] animate-hud-glow ${
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

      {/* 🌀 EPIC HUD DROPDOWN MENU */}
      <div 
        className={`md:hidden fixed top-20 right-4 w-48 transition-all duration-700 z-50 animate-arc-entrance ${
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
            const isActive = isActivePage(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-700 transform hover:scale-125 active:scale-95 animate-bounce-in ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 shadow-lg shadow-purple-500/40'
                    : 'hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/20'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 100}ms` : '0ms',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isActive 
                    ? '0 8px 32px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    : '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className={`text-2xl transition-all duration-300 ${
                  isActive ? 'scale-110 drop-shadow-lg animate-pulse-purple' : 'hover:scale-105'
                }`}>{item.icon}</span>
                <span className={`text-sm font-semibold ${
                  isActive ? 'text-purple-200' : 'text-white'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Secondary Actions */}
        <div className="p-2 space-y-1">
          {showAdminLink && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-700 transform hover:scale-125 active:scale-95 hover:bg-red-500/10 animate-bounce-in"
            style={{
              transitionDelay: isOpen ? '600ms' : '0ms',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            >
              <span className="text-xl">🔧</span>
              <span className="text-sm font-semibold text-red-300">Admin</span>
            </Link>
          )}
          
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
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-700 transform hover:scale-125 active:scale-95 hover:bg-red-500/10 w-full text-left animate-bounce-in"
            style={{
              transitionDelay: isOpen ? '700ms' : '0ms',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className="text-xl">👋</span>
            <span className="text-sm font-semibold text-red-300">Sign Out</span>
          </button>
        </div>
      </div>

      {/* 🎯 EPIC USER INFO HUD */}
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl backdrop-blur-xl transition-all duration-700 md:hidden z-50 animate-bounce-in ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(20, 20, 40, 0.98) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transitionDelay: isOpen ? '800ms' : '0ms'
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