'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface UniversalMobileSidebarProps {
  userEmail?: string
  userTier?: 'free' | 'pro' | 'ultra'
  isAuthenticated?: boolean
  showAdminLink?: boolean
}

interface MenuItem {
  href: string
  icon: string
  label: string
  requiresAuth?: boolean
  adminOnly?: boolean
}

export default function UniversalMobileSidebar({ 
  userEmail, 
  userTier = 'free', 
  isAuthenticated = false,
  showAdminLink = false
}: UniversalMobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }
  
  const closeSidebar = () => {
    setIsOpen(false)
  }

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isActivePage = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  // Get user's display name and avatar
  const displayName = userEmail ? userEmail.split('@')[0] : 'User'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  // Define menu items based on authentication state
  const getMenuItems = (): MenuItem[] => {
    if (isAuthenticated) {
      const baseItems: MenuItem[] = [
        { href: '/', icon: '🏠', label: 'Home' },
        { href: '/dashboard', icon: '📊', label: 'Dashboard', requiresAuth: true },
        { href: '/gpts', icon: '🤖', label: 'GPTs', requiresAuth: true },
        { href: '/documents', icon: '📚', label: 'Playbooks', requiresAuth: true },
        { href: '/blog', icon: '📝', label: 'Blog' }
      ]
      
      if (showAdminLink) {
        baseItems.push({ href: '/admin', icon: '⚙️', label: 'Admin Panel', adminOnly: true })
      }
      
      return baseItems
    } else {
      return [
        { href: '/', icon: '🏠', label: 'Home' },
        { href: '/#features', icon: '✨', label: 'Features' },
        { href: '/pricing', icon: '💎', label: 'Pricing' },
        { href: '/blog', icon: '📝', label: 'Blog' },
        { href: '/contact', icon: '📧', label: 'Contact' }
      ]
    }
  }

  const menuItems = getMenuItems()

  // Animation variants
  const sidebarVariants = {
    closed: { 
      scale: 0.8,
      opacity: 0,
      x: '-50%',
      transition: { 
        type: 'spring' as const,
        stiffness: 400,
        damping: 40
      }
    },
    open: { 
      scale: 1,
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    }
  }

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  }

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.1 + (i * 0.05),
        type: 'spring' as const,
        stiffness: 400,
        damping: 25
      }
    })
  }

  const getTierBadgeStyle = () => {
    switch (userTier) {
      case 'ultra':
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
      case 'pro':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/20'
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200 shadow-lg shadow-gray-600/10'
    }
  }

  const getTierIcon = () => {
    switch (userTier) {
      case 'ultra': return '🚀'
      case 'pro': return '✨'
      default: return '🆓'
    }
  }

  const getTierLabel = () => {
    switch (userTier) {
      case 'ultra': return 'ULTRA MEMBER'
      case 'pro': return 'PRO MEMBER'
      default: return 'FREE ACCOUNT'
    }
  }

  return (
    <>
      {/* Mobile Hamburger Button - Positioned on the right */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-slate-800/90 hover:scale-110 active:scale-95 shadow-lg"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <motion.div 
          className="w-5 h-5 flex flex-col justify-center items-center"
          animate={isOpen ? 'open' : 'closed'}
        >
          <motion.span 
            className="w-full h-0.5 bg-white"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 2 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span 
            className="w-full h-0.5 bg-white mt-1"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span 
            className="w-full h-0.5 bg-white mt-1"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -2 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3 }}
              onClick={closeSidebar}
              aria-hidden="true"
            />

            {/* Compact Floating Sidebar Card */}
            <motion.div 
              className="fixed top-1/2 left-6 right-6 z-50 md:hidden max-w-sm mx-auto"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              role="dialog"
              aria-label="Navigation menu"
              style={{
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex flex-col overflow-hidden p-6">
                
                {/* Close Button */}
                <motion.button
                  onClick={closeSidebar}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  custom={0}
                >
                  <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* User Profile Section - Only for authenticated users */}
                {isAuthenticated && userEmail && (
                  <motion.div 
                    className="mb-6 pb-4 border-b border-white/10"
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={1}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          userTier === 'ultra' 
                            ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600' 
                            : userTier === 'pro'
                              ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}>
                          <span className="text-white font-bold text-sm">
                            {avatarLetter}
                          </span>
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">
                          {displayName}
                        </h3>
                        <motion.div 
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mt-0.5 ${getTierBadgeStyle()}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="mr-1 text-xs">{getTierIcon()}</span>
                          <span className="text-xs">{getTierLabel()}</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Main Navigation */}
                <div className="mb-4">
                  <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        custom={index + 2}
                      >
                        <Link
                          href={item.href}
                          onClick={closeSidebar}
                          className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                            isActivePage(item.href)
                              ? 'bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white shadow-lg shadow-purple-600/30'
                              : 'text-white/85 hover:text-white hover:bg-white/8'
                          }`}
                        >
                          {/* Animated background for active state */}
                          {isActivePage(item.href) && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-purple-600/30"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              layoutId="activeBackground"
                            />
                          )}
                          
                          <motion.span 
                            className="text-base mr-3 relative z-10"
                            whileHover={{ scale: 1.1, rotate: 8 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            {item.icon}
                          </motion.span>
                          <span className="font-medium text-sm relative z-10">{item.label}</span>
                          
                          {/* Active indicator */}
                          {isActivePage(item.href) && (
                            <motion.div 
                              className="ml-auto w-1.5 h-1.5 bg-white rounded-full relative z-10"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                            />
                          )}
                          
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/15 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>
                
                {/* Account Actions - Only for authenticated users */}
                {isAuthenticated && (
                  <motion.div 
                    className="border-t border-white/10 p-4 space-y-3"
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={menuItems.length + 2}
                  >
                    {/* Plan Link */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/plan"
                        onClick={closeSidebar}
                        className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 min-h-[44px] border border-purple-500/30 relative overflow-hidden ${
                          isActivePage('/plan')
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25'
                            : 'text-purple-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-400/50'
                        }`}
                      >
                        <motion.span 
                          className="text-lg mr-3"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          ⭐
                        </motion.span>
                        <span className="font-medium">Plan & Billing</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </motion.div>
                    
                    {/* Sign Out Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <button
                        onClick={async () => {
                          try {
                            closeSidebar()
                            const { auth } = await import('@/lib/auth')
                            await auth.signOut()
                            window.location.href = '/'
                          } catch (error) {
                            console.error('Sign out error:', error)
                            window.location.href = '/'
                          }
                        }}
                        className="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-red-300 hover:text-white hover:bg-red-600/20 relative overflow-hidden group"
                      >
                        <motion.span 
                          className="text-lg mr-3"
                          whileHover={{ scale: 1.1, rotate: -10 }}
                        >
                          👋
                        </motion.span>
                        <span className="font-medium">Sign Out</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Auth Actions - Only for non-authenticated users */}
                {!isAuthenticated && (
                  <motion.div 
                    className="border-t border-white/10 p-4 space-y-3"
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={menuItems.length + 2}
                  >
                    {/* Sign In Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/login"
                        onClick={closeSidebar}
                        className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl transition-all duration-200 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        <span className="font-medium">Sign In</span>
                      </Link>
                    </motion.div>
                    
                    {/* Sign Up Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/signup"
                        onClick={closeSidebar}
                        className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl transition-all duration-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40"
                      >
                        <span className="font-medium">Get Started</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}