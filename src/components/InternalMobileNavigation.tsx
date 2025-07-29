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

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleLinkClick}
        aria-hidden="true"
      />

      {/* Mobile Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out md:hidden z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full">
          
          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-700">
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
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                    userTier === 'ultra'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : userTier === 'pro'
                        ? 'bg-purple-900/50 text-purple-300'
                        : 'bg-gray-700 text-gray-300'
                  }`}>
                    {userTier === 'ultra' ? '🚀 ULTRA' : userTier === 'pro' ? '✨ PRO' : '🆓 FREE'}
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleLinkClick}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-1">
              {[
                { href: '/', icon: '🏠', label: 'Home' },
                { href: '/dashboard', icon: '📊', label: 'Dashboard' },
                { href: '/gpts', icon: '🤖', label: 'GPTs' },
                { href: '/documents', icon: '📚', label: 'Playbooks' },
                { href: '/blog', icon: '📝', label: 'Blog' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 min-h-[44px] group ${
                    isActivePage(item.href)
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg mr-3 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {isActivePage(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Admin Section */}
            {showAdminLink && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-3">
                  Admin
                </div>
                <Link
                  href="/admin"
                  onClick={handleLinkClick}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 min-h-[44px] group ${
                    isActivePage('/admin')
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg mr-3 transition-transform duration-200 group-hover:scale-110">
                    ⚙️
                  </span>
                  <span className="font-medium">Admin Panel</span>
                  {isActivePage('/admin') && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </div>
            )}
          </div>
          
          {/* Account Section */}
          <div className="border-t border-gray-700 p-4 space-y-3">
            {/* Account Settings Link */}
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 min-h-[44px] group border border-purple-500/30 ${
                isActivePage('/settings')
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-300 hover:text-white hover:bg-purple-600/20'
              }`}
            >
              <span className="text-lg mr-3 transition-transform duration-200 group-hover:scale-110">
                ⚙️
              </span>
              <span className="font-medium">Account</span>
              {isActivePage('/settings') && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
            
            {/* Sign Out Button */}
            <button
              onClick={async () => {
                try {
                  handleLinkClick()
                  // Import auth properly
                  const { auth } = await import('@/lib/auth')
                  const { error } = await auth.signOut()
                  if (error) {
                    console.error('Sign out error:', error)
                  }
                  // Force page reload to clear all state
                  window.location.href = '/'
                } catch (error) {
                  console.error('Sign out error:', error)
                  // Fallback - force navigation
                  window.location.href = '/'
                }
              }}
              className="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 min-h-[44px] group text-red-300 hover:text-white hover:bg-red-600/20"
            >
              <span className="text-lg mr-3 transition-transform duration-200 group-hover:scale-110">
                👋
              </span>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}