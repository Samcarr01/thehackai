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

  // Enhanced Animation variants with premium easing
  const sidebarVariants = {
    closed: { 
      scale: 0.85,
      opacity: 0,
      y: 20,
      transition: { 
        type: 'spring' as const,
        stiffness: 500,
        damping: 45,
        mass: 0.8
      }
    },
    open: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { 
        type: 'spring' as const,
        stiffness: 400,
        damping: 35,
        mass: 0.9,
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    }
  }

  const overlayVariants = {
    closed: { 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    open: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  const itemVariants = {
    closed: { 
      x: -15, 
      opacity: 0,
      scale: 0.95
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.15 + (i * 0.03),
        type: 'spring' as const,
        stiffness: 450,
        damping: 30,
        mass: 0.8
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
      {/* Premium Mobile Hamburger Button */}
      <motion.button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        }}
        whileHover={{ 
          scale: 1.05,
          rotate: isOpen ? 0 : 5,
          transition: { type: 'spring', stiffness: 400, damping: 25 }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
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
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Premium Overlay with Enhanced Blur */}
            <motion.div 
              className="fixed inset-0 z-40 md:hidden"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            {/* Premium Floating Sidebar Card */}
            <motion.div 
              className="fixed top-1/2 left-4 right-4 z-50 md:hidden max-w-[340px] mx-auto"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              role="dialog"
              aria-label="Navigation menu"
              style={{
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '28px',
                boxShadow: `
                  0 40px 80px -20px rgba(0, 0, 0, 0.8),
                  0 24px 48px -12px rgba(0, 0, 0, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.06),
                  inset 0 1px 0 rgba(255, 255, 255, 0.12),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `
              }}
            >
              <div className="flex flex-col overflow-hidden p-7">
                
                {/* Premium Close Button */}
                <motion.button
                  onClick={closeSidebar}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ 
                    scale: 0.92,
                    transition: { duration: 0.1 }
                  }}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  custom={0}
                >
                  <svg 
                    className="w-4 h-4 text-white/70 group-hover:text-white/90 transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Premium User Profile Section */}
                {isAuthenticated && userEmail && (
                  <motion.div 
                    className="mb-7 pb-5"
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={1}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Premium Avatar with Ring */}
                      <div className="relative">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75 blur-sm"></div>
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-xl ${
                          userTier === 'ultra' 
                            ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600' 
                            : userTier === 'pro'
                              ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}
                        style={{
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}>
                          <span className="text-white font-semibold text-base">
                            {avatarLetter}
                          </span>
                        </div>
                        {/* Enhanced Online Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Enhanced User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base truncate mb-1">
                          {displayName}
                        </h3>
                        <motion.div 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeStyle()}`}
                          style={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                            transition: { type: 'spring', stiffness: 400, damping: 25 }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="mr-1.5 text-sm">{getTierIcon()}</span>
                          <span className="text-xs font-bold tracking-wide">{getTierLabel()}</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Premium Main Navigation */}
                <div className="mb-6">
                  <nav className="space-y-2">
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
                          className="group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden"
                          style={{
                            ...(isActivePage(item.href) ? {
                              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(126, 34, 206, 0.9) 100%)',
                              boxShadow: '0 8px 24px rgba(147, 51, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(147, 51, 234, 0.3)'
                            } : {
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                              border: '1px solid rgba(255, 255, 255, 0.05)'
                            })
                          }}
                        >
                          {/* Enhanced Animated Background */}
                          {isActivePage(item.href) && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-2xl"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              layoutId="activeBackground"
                            />
                          )}
                          
                          {/* Icon with Enhanced Animation */}
                          <motion.div 
                            className="relative z-10 mr-4 flex items-center justify-center w-6 h-6"
                            whileHover={{ 
                              scale: 1.15, 
                              rotate: isActivePage(item.href) ? 0 : 12,
                              transition: { type: 'spring', stiffness: 500, damping: 30 }
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className={`text-lg ${
                              isActivePage(item.href) 
                                ? 'text-white drop-shadow-sm' 
                                : 'text-white/75 group-hover:text-white/95'
                            }`}>
                              {item.icon}
                            </span>
                          </motion.div>
                          
                          {/* Enhanced Text */}
                          <span className={`font-medium text-sm relative z-10 flex-1 transition-colors duration-200 ${
                            isActivePage(item.href) 
                              ? 'text-white font-semibold' 
                              : 'text-white/85 group-hover:text-white/95'
                          }`}>
                            {item.label}
                          </span>
                          
                          {/* Enhanced Active Indicator */}
                          {isActivePage(item.href) && (
                            <motion.div 
                              className="ml-auto w-2 h-2 bg-white rounded-full relative z-10 shadow-lg"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                            />
                          )}
                          
                          {/* Enhanced Hover Effects */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl" />
                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>
                
                {/* Premium Account Actions */}
                {isAuthenticated && (
                  <motion.div 
                    className="pt-5 space-y-3"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={menuItems.length + 2}
                  >
                    {/* Premium Plan Link */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/plan"
                        onClick={closeSidebar}
                        className="flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group"
                        style={{
                          background: isActivePage('/plan') 
                            ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(126, 34, 206, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(126, 34, 206, 0.1) 100%)',
                          border: `1px solid ${isActivePage('/plan') ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.2)'}`,
                          boxShadow: isActivePage('/plan') 
                            ? '0 8px 24px rgba(147, 51, 234, 0.25)'
                            : '0 4px 12px rgba(147, 51, 234, 0.1)'
                        }}
                      >
                        <motion.div 
                          className="mr-4 flex items-center justify-center w-6 h-6"
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: 15,
                            transition: { type: 'spring', stiffness: 500, damping: 30 }
                          }}
                        >
                          <span className="text-lg">⭐</span>
                        </motion.div>
                        <span className={`font-semibold text-sm flex-1 ${
                          isActivePage('/plan') ? 'text-white' : 'text-purple-200 group-hover:text-white'
                        }`}>
                          Plan & Billing
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      </Link>
                    </motion.div>
                    
                    {/* Premium Sign Out Button */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                    >
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
                        className="w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                          border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        <motion.div 
                          className="mr-4 flex items-center justify-center w-6 h-6"
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: -15,
                            transition: { type: 'spring', stiffness: 500, damping: 30 }
                          }}
                        >
                          <span className="text-lg">👋</span>
                        </motion.div>
                        <span className="font-semibold text-sm text-red-300 group-hover:text-white transition-colors duration-200">
                          Sign Out
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Premium Auth Actions */}
                {!isAuthenticated && (
                  <motion.div 
                    className="pt-5 space-y-3"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={menuItems.length + 2}
                  >
                    {/* Premium Sign In Button */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/login"
                        onClick={closeSidebar}
                        className="w-full flex items-center justify-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <span className="text-white/90 group-hover:text-white transition-colors duration-200">
                          Sign In
                        </span>
                      </Link>
                    </motion.div>
                    
                    {/* Premium Get Started Button */}
                    <motion.div 
                      whileHover={{ 
                        scale: 1.02,
                        transition: { type: 'spring', stiffness: 400, damping: 25 }
                      }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/signup"
                        onClick={closeSidebar}
                        className="w-full flex items-center justify-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm group relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(126, 34, 206, 0.9) 100%)',
                          border: '1px solid rgba(147, 51, 234, 0.4)',
                          boxShadow: '0 8px 24px rgba(147, 51, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <span className="text-white relative z-10">Get Started</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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