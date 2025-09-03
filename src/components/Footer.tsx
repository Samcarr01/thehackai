'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'

export default function Footer() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: authUser } = await auth.getUser()
        if (authUser) {
          let userProfile = await userService.getProfile(authUser.id)
          if (!userProfile) {
            const firstName = authUser.user_metadata?.first_name || ''
            const lastName = authUser.user_metadata?.last_name || ''
            userProfile = await userService.createProfile(authUser.id, authUser.email || '', firstName, lastName)
          }
          setUser(userProfile)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-white/10">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Mobile Compact Layout */}
        <div className="block md:hidden">
          {/* Brand Section - Mobile */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <span 
                className="text-xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                thehackai
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full border border-green-500/30 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-xs font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Links Grid - Mobile */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Platform Links */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/toolkit" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                    🛠️ Toolkit
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                    ✍️ Blog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                    💰 Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/solutions" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                    🎯 Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account Links */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Account</h3>
              <ul className="space-y-2">
                {user ? (
                  // Authenticated user links
                  <>
                    <li>
                      <Link href="/dashboard" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                        🏠 Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/settings" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                        ⚙️ Settings
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={async () => {
                          await auth.signOut()
                          window.location.reload()
                        }} 
                        className="text-gray-400 hover:text-purple-300 transition-colors text-sm text-left"
                      >
                        🚪 Sign Out
                      </button>
                    </li>
                    <li>
                      <Link href="/contact" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                        💬 Contact
                      </Link>
                    </li>
                  </>
                ) : (
                  // Guest user links
                  <>
                    <li>
                      <Link href="/login" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                        🔑 Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                        🚀 Get Started
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                        💬 Contact
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                    📄 Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-purple-300 transition-colors text-sm">
                    🔒 Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media - Mobile */}
          <div className="text-center mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">Follow Us</h3>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://twitter.com/Sam_thehackai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
                aria-label="Follow us on X (Twitter)"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              </a>
              <a 
                href="https://www.instagram.com/thehackai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
                aria-label="Follow us on Instagram"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Copyright - Mobile */}
          <div className="text-center border-t border-white/10 pt-4">
            <div className="text-gray-400 text-xs">
              © 2025 thehackai. All rights reserved.
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <span 
                  className="text-3xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                >
                  thehackai
                </span>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                Battle-tested AI workflows that actually work. Curated tools, GPTs, and playbooks for serious professionals.
              </p>
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
                  <span className="text-purple-300 font-semibold text-sm">🚀 Production Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Platform</h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/toolkit" 
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>🛠️</span>
                    <span>Our Toolkit</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>✍️</span>
                    <span>Blog</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>💰</span>
                    <span>Pricing</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/solutions" 
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>🎯</span>
                    <span>Solutions</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Support */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Account</h3>
              <ul className="space-y-4">
                {user ? (
                  // Authenticated user links
                  <>
                    <li>
                      <Link 
                        href="/dashboard" 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <span>🏠</span>
                        <span>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/settings" 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={async () => {
                          await auth.signOut()
                          window.location.reload()
                        }} 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2 text-left"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </li>
                    <li>
                      <Link 
                        href="/contact" 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <span>💬</span>
                        <span>Contact</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  // Guest user links
                  <>
                    <li>
                      <Link 
                        href="/login" 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <span>🔑</span>
                        <span>Sign In</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/signup" 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <span>🚀</span>
                        <span>Get Started</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/contact" 
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <span>💬</span>
                        <span>Contact</span>
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link 
                    href="/terms" 
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>📄</span>
                    <span>Terms</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>🔒</span>
                    <span>Privacy</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Follow Us</h3>
              <div className="space-y-4">
                <a 
                  href="https://twitter.com/Sam_thehackai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-3 group"
                  aria-label="Follow us on X (Twitter)"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span>X (Twitter)</span>
                </a>
                <a 
                  href="https://www.instagram.com/thehackai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-300 transition-colors duration-300 flex items-center space-x-3 group"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span>Instagram</span>
                </a>
                <div className="text-gray-500 text-sm flex items-center space-x-2 pt-2">
                  <span>📋</span>
                  <span>LinkedIn & Facebook coming soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2025 thehackai. All rights reserved.
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-gray-400 text-sm">
                  Made with ❤️ for AI professionals
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}