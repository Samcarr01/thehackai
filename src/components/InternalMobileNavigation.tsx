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

  // Get user's display name from email
  const displayName = userEmail ? userEmail.split('@')[0] : 'User'

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

          {/* User Profile Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base truncate">
                  {displayName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 ${
                    userTier === 'ultra'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : userTier === 'pro'
                        ? 'bg-purple-900/50 text-purple-200 border border-purple-500/30'
                        : 'bg-gray-800/50 text-gray-300 border border-gray-600/30'
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
          </div>
          
          {/* Main Navigation */}
          <div className="px-6 py-4">
            <nav className="space-y-2">
              {[
                { href: '/', icon: '🏠', label: 'Home' },
                { href: '/dashboard', icon: '📊', label: 'Dashboard' },
                { href: '/gpts', icon: '🤖', label: 'GPTs' },
                { href: '/documents', icon: '📚', label: 'Playbooks' },
                { href: '/blog', icon: '✍️', label: 'Blog' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`relative flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] ${
                    isActivePage(item.href)
                      ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`transition-transform duration-300 ${
                      isActivePage(item.href) ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActivePage(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                  {!isActivePage(item.href) && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Admin Section */}
            {showAdminLink && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-4">
                  Admin
                </div>
                <Link
                  href="/admin"
                  onClick={handleLinkClick}
                  className="relative flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] ml-2 bg-red-900/30 text-red-200 border border-red-500/40 hover:bg-red-900/40 hover:border-red-400/60"
                >
                  <div className="flex items-center space-x-3">
                    <span className="group-hover:scale-105 transition-transform duration-300">🔧</span>
                    <span>Admin Panel</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
          
          {/* Account Section */}
          <div className="border-t border-white/10 px-6 py-4 space-y-3">
            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className={`relative flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] ${
                isActivePage('/settings')
                  ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`transition-transform duration-300 ${
                  isActivePage('/settings') ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  ⚙️
                </span>
                <span>Settings</span>
              </div>
              {isActivePage('/settings') && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
              {!isActivePage('/settings') && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
              )}
            </Link>
            
            {/* Sign Out Button */}
            <button
              onClick={async () => {
                try {
                  console.log('Mobile sign out initiated...')
                  handleLinkClick() // Close the mobile menu
                  
                  // Clear any localStorage items first
                  localStorage.removeItem('supabase-auth-persist')
                  localStorage.removeItem('rememberMe')
                  
                  // Import and use auth
                  const { auth } = await import('@/lib/auth')
                  const { error } = await auth.signOut()
                  
                  if (error) {
                    console.error('Mobile sign out error:', error)
                    // Force navigation if signOut fails
                    window.location.href = '/'
                  } else {
                    console.log('Mobile sign out successful')
                    // Don't force reload - let auth state listeners handle the update
                    window.location.href = '/'
                  }
                } catch (error) {
                  console.error('Mobile sign out error:', error)
                  // Fallback - force navigation even if sign out failed
                  window.location.href = '/'
                }
              }}
              className="w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group min-h-[44px] text-red-300 hover:text-white hover:bg-red-600/20 border border-red-500/20 hover:border-red-400/40"
            >
              <div className="flex items-center space-x-3">
                <span className="transition-transform duration-200 group-hover:scale-110">
                  👋
                </span>
                <span>Sign Out</span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}