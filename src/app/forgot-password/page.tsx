'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { auth } from '@/lib/auth'
import DarkThemeBackground from '@/components/DarkThemeBackground'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('Attempting password reset for:', email)
      const { error } = await auth.resetPassword(email)
      
      if (error) {
        console.error('Password reset error:', error)
        setError(`Failed to send reset email: ${error.message}`)
      } else {
        console.log('Password reset email sent successfully')
        setSent(true)
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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
          {sent ? 'Check your email! 📧' : 'Forgot password? 🔑'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-100">
          {sent 
            ? "We've sent a reset link to your email address"
            : "No worries, we'll send you reset instructions"
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass rounded-2xl px-8 py-8 shadow-xl border border-purple-100">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 gradient-purple-subtle rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">📧</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  We&apos;ve sent a password reset link to:
                </p>
                <p className="font-medium text-white">{email}</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                  className="w-full gradient-purple text-white py-3 px-4 rounded-xl text-sm font-semibold button-hover shadow-lg"
                >
                  Send another email 🔄
                </button>
                
                <Link
                  href="/login"
                  className="block w-full text-center bg-slate-800/80 text-purple-300 py-3 px-4 rounded-xl text-sm font-semibold border-2 border-purple-500/30 hover:border-purple-400/60 hover:bg-slate-700/80 transition-all duration-300"
                >
                  Back to login 👋
                </Link>
              </div>
            </div>
          ) : (
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
                <p className="mt-2 text-xs text-gray-300">
                  Enter the email address associated with your account
                </p>
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <span className="text-lg">🚀</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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