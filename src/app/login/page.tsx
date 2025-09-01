'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'
import DarkThemeBackground from '@/components/DarkThemeBackground'
import Footer from '@/components/Footer'
import SmartNavigation from '@/components/SmartNavigation'

export default function LoginPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  // Check for existing session and load remember me preference
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user: authUser } = await auth.getUser()
        if (authUser) {
          // User is already logged in, redirect to dashboard
          router.push('/dashboard')
          return
        }
        
        // No authenticated user, set user to null
        setUser(null)
      } catch (error) {
        // User is not logged in, continue to login page
      } finally {
        setUserLoading(false)
      }
      
      // Load remember me preference
      if (typeof window !== 'undefined') {
        const remembered = localStorage.getItem('rememberMe') === 'true'
        setRememberMe(remembered)
      }
    }
    
    checkSession()
  }, [router])

  // Check for URL parameters (like success messages)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const message = urlParams.get('message')
      
      if (message === 'already_confirmed') {
        setSuccessMessage('✅ Your email is already confirmed! You can sign in now.')
        // Clear the URL parameter
        window.history.replaceState({}, '', '/login')
      } else if (message === 'session_expired') {
        setError('⚠️ Your session expired. Please sign in again.')
        // Clear the URL parameter
        window.history.replaceState({}, '', '/login')
      }
      
      // Check for error parameter
      const errorParam = urlParams.get('error')
      if (errorParam === 'auth_failed') {
        setError('❌ Failed to load dashboard. Please try signing in again.')
        // Clear the URL parameter
        window.history.replaceState({}, '', '/login')
      }
    }
  }, [])

  // Handle remember me checkbox change
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
    if (typeof window !== 'undefined') {
      if (checked) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await auth.signIn(email, password, rememberMe)
      
      if (error) {
        setError(error.message)
      } else if (data.user) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await auth.signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Google sign in failed')
    }
  }

  return (
    <DarkThemeBackground className="flex flex-col min-h-screen">
      <SmartNavigation user={user} currentPage="login" />
      
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <span 
                className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                thehackai
              </span>
            </Link>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Welcome back! 👋
          </h2>
          <p className="mt-2 text-center text-sm text-gray-100">
            Sign in to access your AI workflows
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass rounded-2xl px-8 py-8 shadow-xl border border-purple-100">
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 rounded-xl bg-green-900/20 border border-green-500/30">
                <p className="text-sm text-green-200">{successMessage}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    🔑 Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 gradient-purple text-white py-3 px-4 rounded-xl text-sm font-semibold button-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <span className="text-lg">🚀</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/80 text-gray-300">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl border border-gray-600 bg-slate-800/80 text-sm font-medium text-gray-100 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md group mobile-touch-target touch-feedback"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-100">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                  Create free account ✨
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link href="/" className="text-sm text-gray-300 hover:text-purple-600 transition-colors flex items-center justify-center space-x-1 py-2">
            <span>←</span>
            <span>Back to thehackai</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </DarkThemeBackground>
  )
}