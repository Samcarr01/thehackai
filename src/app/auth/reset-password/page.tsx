'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/auth'
import DarkThemeBackground from '@/components/DarkThemeBackground'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validToken, setValidToken] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { session } = await auth.getSession()
      if (session) {
        setValidToken(true)
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }
    
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    try {
      const { error } = await auth.updatePassword(password)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!validToken && !error) {
    return (
      <DarkThemeBackground className="flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-100">Verifying reset link...</p>
      </DarkThemeBackground>
    )
  }

  return (
    <DarkThemeBackground className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <span 
              className="text-3xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              thehackai
            </span>
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-white">
          {success ? 'Password updated! 🎉' : 'Set new password 🔐'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-100">
          {success 
            ? "Your password has been successfully updated"
            : "Choose a strong password for your account"
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass rounded-2xl px-8 py-8 shadow-xl border border-purple-100">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
              <p className="text-sm text-red-200">{error}</p>
              {error.includes('Invalid or expired') && (
                <div className="mt-3">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Request new reset link →
                  </Link>
                </div>
              )}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 gradient-purple-subtle rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">🎉</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-200">
                  Your password has been successfully updated!
                </p>
                <p className="text-xs text-gray-300">
                  Redirecting to dashboard in 3 seconds...
                </p>
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="block w-full text-center gradient-purple text-white py-3 px-4 rounded-xl text-sm font-semibold button-hover shadow-lg"
                >
                  Go to Dashboard 🚀
                </Link>
              </div>
            </div>
          ) : validToken ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                  placeholder="Enter your new password"
                />
                <p className="mt-2 text-xs text-gray-300">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                  placeholder="Confirm your new password"
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-200">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full flex justify-center items-center space-x-2 gradient-purple text-white py-3 px-4 rounded-xl text-sm font-semibold button-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <span className="text-lg">🔐</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">❌</span>
              </div>
              
              <p className="text-sm text-gray-200">
                This reset link is invalid or has expired.
              </p>
              
              <Link
                href="/forgot-password"
                className="block w-full text-center gradient-purple text-white py-3 px-4 rounded-xl text-sm font-semibold button-hover shadow-lg"
              >
                Request New Reset Link 🔄
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-100">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                Sign in here 👋
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
    </DarkThemeBackground>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <DarkThemeBackground className="flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-100">Loading...</p>
      </DarkThemeBackground>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}