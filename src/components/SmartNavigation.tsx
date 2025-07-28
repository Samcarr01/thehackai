'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type UserProfile } from '@/lib/user'
import { useAdmin } from '@/contexts/AdminContext'
import { auth } from '@/lib/auth'
import InternalMobileNavigation from './InternalMobileNavigation'

interface SmartNavigationProps {
  user: UserProfile | null
  currentPage?: 'gpts' | 'documents' | 'blog' | 'dashboard'
}

export default function SmartNavigation({ user, currentPage }: SmartNavigationProps) {
  const { adminViewMode, toggleAdminView, getEffectiveUser } = useAdmin()
  const router = useRouter()
  
  // Get effective user for display (applies global admin toggle)
  const effectiveUser = getEffectiveUser(user)
  
  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
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
                    { href: "/blog", label: "Blog", page: "blog", icon: "✍️" },
                    { href: "/plan", label: "Plan", icon: "⚡" }
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
                  {user && user.email === 'samcarr1232@gmail.com' && adminViewMode === 'admin' && (
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
          {effectiveUser ? (
            <InternalMobileNavigation 
              userEmail={effectiveUser.email}
              userTier={effectiveUser.user_tier || 'free'}
              showAdminLink={!!(user && user.email === 'samcarr1232@gmail.com' && adminViewMode === 'admin')}
            />
          ) : (
            // Public mobile navigation
            <div className="md:hidden">
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm gradient-purple text-white px-3 py-2 rounded-full font-medium button-hover"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}