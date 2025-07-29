'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type UserProfile, userService } from '@/lib/user'
import { useAdmin } from '@/contexts/AdminContext'
import { auth } from '@/lib/auth'
import InternalMobileNavigation from './InternalMobileNavigation'

interface SmartNavigationProps {
  user: UserProfile | null
  currentPage?: 'gpts' | 'documents' | 'blog' | 'dashboard' | 'settings'
  onFeatureClick?: () => void
  onPricingClick?: () => void
  loading?: boolean
}

export default function SmartNavigation({ user, currentPage, onFeatureClick, onPricingClick, loading = false }: SmartNavigationProps) {
  const { adminViewMode, toggleAdminView, getEffectiveUser } = useAdmin()
  const router = useRouter()
  const [localUser, setLocalUser] = useState<UserProfile | null>(user)\n  const [authChecked, setAuthChecked] = useState(false)
  
  // Use local user state or prop user, whichever is more recent
  const currentUser = localUser || user
  
  // Get effective user for display (applies global admin toggle)
  const effectiveUser = getEffectiveUser(currentUser)
  
  // Update local user when prop changes
  useEffect(() => {
    setLocalUser(user)
  }, [user])
  
  // Initial auth check on component mount to fix redirect timing issues
  useEffect(() => {
    const checkInitialAuth = async () => {
      if (!user && !authChecked) {
        try {
          const { user: authUser } = await auth.getUser()
          if (authUser) {
            let userProfile = await userService.getProfile(authUser.id)
            if (!userProfile) {
              userProfile = await userService.createProfile(authUser.id, authUser.email || '')
            }
            setLocalUser(userProfile)
            console.log('SmartNavigation: Initial auth check found user:', userProfile.email)
          }
        } catch (error) {
          console.error('SmartNavigation: Initial auth check failed:', error)
        } finally {
          setAuthChecked(true)
        }
      }
    }
    
    checkInitialAuth()
  }, [user, authChecked])
  
  // Listen for auth state changes to update mobile navigation immediately
  useEffect(() => {
    const { supabase } = auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('SmartNavigation: Auth state changed:', event)
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - get profile and update local state
        let userProfile = await userService.getProfile(session.user.id)
        if (!userProfile) {
          userProfile = await userService.createProfile(session.user.id, session.user.email || '')
        }
        setLocalUser(userProfile)
      } else if (event === 'SIGNED_OUT') {
        // User signed out - clear local state
        setLocalUser(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // Debug logging for mobile navigation issues
  console.log('SmartNavigation Mobile Debug:', {
    hasUser: !!currentUser,
    hasEffectiveUser: !!effectiveUser,
    userEmail: currentUser?.email,
    effectiveUserEmail: effectiveUser?.email,
    showingInternalMobile: !!(effectiveUser || currentUser),
    adminViewMode: adminViewMode,
    mobileNavComponent: (effectiveUser || currentUser) ? 'InternalMobileNavigation' : 'PublicMobileNavigation'
  })
  
  const handleSignOut = async () => {
    try {
      console.log('Desktop sign out initiated...')
      
      // Clear any localStorage items first
      localStorage.removeItem('supabase-auth-persist')
      localStorage.removeItem('rememberMe')
      
      const { error } = await auth.signOut()
      if (error) {
        console.error('Desktop sign out error:', error)
        // Force navigation if signOut fails
        window.location.href = '/'
      } else {
        console.log('Desktop sign out successful')
        // Don't force reload - let auth state listeners handle the update
        router.push('/')
      }
    } catch (error) {
      console.error('Desktop sign out error:', error)
      // Force navigation even if sign out failed
      window.location.href = '/'
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Section */}
          <Link 
            href={effectiveUser ? "/dashboard" : "/"} 
            className="flex items-center space-x-3 group"
          >
            <div className="w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              <Image
                src="/logo.png"
                alt="thehackai logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
              thehackai
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {effectiveUser ? (
              // Logged in navigation
              <>
                {/* Main Navigation */}
                <nav className="flex items-center space-x-1 mr-6">
                  {[
                    { href: "/", label: "Home", icon: "🏠" },
                    { href: "/dashboard", label: "Dashboard", page: "dashboard", icon: "📊" },
                    { href: "/gpts", label: "GPTs", page: "gpts", icon: "🤖" },
                    { href: "/documents", label: "Playbooks", page: "documents", icon: "📚" },
                    { href: "/blog", label: "Blog", page: "blog", icon: "✍️" }
                  ].map((item) => {
                    const isActive = currentPage === item.page
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                        )}
                      </Link>
                    )
                  })}
                  
                  {/* Admin Link */}
                  {currentUser && currentUser.email === 'samcarr1232@gmail.com' && adminViewMode === 'admin' && (
                    <Link
                      href="/admin"
                      className="relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ml-2 bg-red-900/30 text-red-200 border border-red-500/40 hover:bg-red-900/40 hover:border-red-400/60"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:scale-105 transition-transform duration-300">🔧</span>
                        <span>Admin</span>
                      </div>
                    </Link>
                  )}
                </nav>
                
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
                  {/* Tier Badge - Always show user's actual tier */}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 ${
                    effectiveUser && effectiveUser.user_tier === 'ultra'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : effectiveUser && effectiveUser.user_tier === 'pro' 
                        ? 'bg-purple-900/50 text-purple-200 border border-purple-500/30' 
                        : 'bg-gray-800/50 text-gray-300 border border-gray-600/30'
                  }`}>
                    <span>
                      {effectiveUser && effectiveUser.user_tier === 'ultra' ? '🚀' : 
                       effectiveUser && effectiveUser.user_tier === 'pro' ? '✨' : '🆓'}
                    </span>
                    <span>
                      {effectiveUser && effectiveUser.user_tier === 'ultra' ? 'Ultra' : 
                       effectiveUser && effectiveUser.user_tier === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </div>
                  
                  {/* Settings Link */}
                  <Link
                    href="/settings"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      currentPage === 'settings'
                        ? 'text-purple-300 bg-purple-900/30 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    ⚙️ Settings
                  </Link>
                  
                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              // Public navigation
              <>
                <nav className="flex items-center space-x-1 mr-6">
                  <Link
                    href="/"
                    className="px-4 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="group-hover:scale-105 transition-transform duration-300">🏠</span>
                      <span>Home</span>
                    </div>
                  </Link>
                  
                  {/* Features link - only show on homepage */}
                  {onFeatureClick && (
                    <button
                      onClick={onFeatureClick}
                      className="px-4 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:scale-105 transition-transform duration-300">⚡</span>
                        <span>Features</span>
                      </div>
                    </button>
                  )}
                  
                  {/* Pricing link - only show on homepage */}
                  {onPricingClick && (
                    <button
                      onClick={onPricingClick}
                      className="px-4 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:scale-105 transition-transform duration-300">💰</span>
                        <span>Pricing</span>
                      </div>
                    </button>
                  )}
                  
                  <Link
                    href="/blog"
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ${
                      currentPage === 'blog' 
                        ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`transition-transform duration-300 ${currentPage === 'blog' ? 'scale-110' : 'group-hover:scale-105'}`}>✍️</span>
                      <span>Blog</span>
                    </div>
                  </Link>
                </nav>
                
                {/* Auth Actions */}
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="group-hover:scale-105 transition-transform duration-300">🔑</span>
                      <span>Sign In</span>
                    </div>
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="group-hover:scale-105 transition-transform duration-300">🚀</span>
                      <span>Get Started</span>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden relative">
            {/* DEBUG: Show current auth state */}
            <div className="text-xs text-red-500 absolute top-0 right-0 bg-red-900 p-1 z-50 rounded">
              User: {currentUser ? '✅' : '❌'} | Eff: {effectiveUser ? '✅' : '❌'}
            </div>
            {effectiveUser || currentUser ? (
              <InternalMobileNavigation 
                userEmail={(effectiveUser || currentUser)?.email || ''}
                userTier={(effectiveUser || currentUser)?.user_tier || 'free'}
                showAdminLink={!!(currentUser && currentUser.email === 'samcarr1232@gmail.com' && adminViewMode === 'admin')}
              />
            ) : (
              // Public mobile navigation - only show when truly no user
              <div className="flex items-center space-x-3">
                <div className="bg-red-500 text-white p-2 text-center font-bold w-full rounded">
                  🚨 PUBLIC NAVIGATION - NO USER DETECTED! 🚨
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}