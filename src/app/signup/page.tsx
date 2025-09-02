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
import { ButtonLoading } from '@/components/LoadingSpinner'

export default function SignupPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { user: authUser, error } = await auth.getUser()
        
        if (!error && authUser) {
          let userProfile = await userService.getProfile(authUser.id)
          if (!userProfile) {
            userProfile = await userService.createProfile(authUser.id, authUser.email || '')
          }
          setUser(userProfile)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setUserLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent rapid successive submissions to avoid rate limiting
    const now = Date.now()
    if (now - lastSubmitTime < 10000) { // 10 second minimum between submissions
      setError('Please wait 10 seconds before trying again.')
      return
    }
    
    setLastSubmitTime(now)
    setLoading(true)
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name')
      setLoading(false)
      return
    }
    
    try {
      const { data, error } = await auth.signUp(email, password, firstName, lastName)
      
      if (error) {
        // Provide more user-friendly error messages
        let friendlyError = error.message
        if (error.message.includes('already registered')) {
          friendlyError = 'This email is already registered. Try signing in instead!'
        } else if (error.message.includes('invalid email')) {
          friendlyError = 'Please enter a valid email address.'
        } else if (error.message.includes('weak password')) {
          friendlyError = 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.'
        } else if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
          friendlyError = 'Too many signup attempts. Please wait 10 seconds and try again.'
        }
        setError(friendlyError)
      } else if (data && data.user) {
        console.log('✅ Signup successful, user created:', {
          userId: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          timestamp: new Date().toISOString()
        })
        setSuccess(true)
        
        // Add user to Brevo email list (completely optional - doesn't block signup)
        console.log('🔄 Starting Brevo integration for user:', data.user.email)
        const brevoPromise = (async () => {
          try {
            console.log('🔄 Starting background Brevo integration...')
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000) // Shorter 3 second timeout
            
            const brevoResponse = await fetch('/api/brevo/add-contact', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                firstName: firstName,
                lastName: lastName,
                userTier: 'free',
                sendWelcomeEmail: true
              }),
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            // Check response and log detailed results
            console.log('📊 Brevo API response status:', brevoResponse.status)
            
            if (brevoResponse.ok) {
              const brevoResult = await brevoResponse.json()
              console.log('✅ Brevo integration success:', brevoResult)
            } else {
              const errorText = await brevoResponse.text()
              console.log('❌ Brevo API error:', {
                status: brevoResponse.status,
                statusText: brevoResponse.statusText,
                error: errorText,
                headers: Array.from(brevoResponse.headers.entries())
              })
            }
          } catch (brevoError: any) {
            // Log all Brevo errors but never let them affect signup
            if (brevoError.name === 'AbortError') {
              console.log('⚠️ Brevo API timeout (normal, signup unaffected)')
            } else if (brevoError.message?.includes('429')) {
              console.log('⚠️ Brevo API rate limited (normal, signup unaffected)')
            } else {
              console.log('⚠️ Brevo integration error (normal, signup unaffected):', brevoError?.message)
            }
          }
        })()
        
        // Fire and forget - never wait for Brevo
        brevoPromise.catch(() => {
          console.log('⚠️ Background Brevo integration completed with errors (signup unaffected)')
        })
        
        // Don't redirect immediately - user needs to confirm email
      }
    } catch (err) {
      setError('Something went wrong. Please check your internet connection and try again.')
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
      <SmartNavigation user={user} currentPage="signup" />
      
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            Start Your AI Journey! 🚀
          </h2>
          <p className="mt-2 text-center text-sm text-gray-100">
            Get instant access to curated AI tools and expert playbooks
          </p>
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/30">
              ✨ 100% Free • No Credit Card Required
            </span>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Free access highlight */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-green-900/20 border border-green-500/30 shadow-md">
              <span className="text-green-300 font-semibold text-lg">Free to start</span>
              <span className="text-green-200 ml-2">• Upgrade to Pro or Ultra</span>
            </div>
          </div>

          <div className="glass rounded-2xl px-8 py-8 shadow-xl border border-purple-100">
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 border-2 border-green-500/30 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  🎉 Account Created Successfully!
                </h3>
                <p className="text-gray-300 mb-6">
                  We've sent a confirmation link to <strong className="text-white">{email}</strong>
                </p>
                
                <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl p-6 mb-6 border border-green-500/30">
                  <h4 className="font-bold text-green-300 mb-4 text-lg">📧 What happens next:</h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                      <span className="text-gray-200">Check your email inbox (and spam folder if needed)</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                      <span className="text-gray-200">Click the "Confirm your account" link in the email</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                      <span className="text-gray-200">You'll be instantly signed in and can explore all free content!</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                      <span className="text-gray-200">Upgrade to Pro or Ultra anytime for direct GPT links and PDF downloads</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-200 text-sm">
                    💡 <strong>Didn't receive the email?</strong> Check your spam folder first, then{' '}
                    <button 
                      onClick={() => {
                        setSuccess(false)
                        setFirstName('')
                        setLastName('')
                        setEmail('')
                        setPassword('')
                        setConfirmPassword('')
                        setError('')
                      }}
                      className="text-yellow-300 underline hover:no-underline font-medium"
                    >
                      click here to try again
                    </button>
                  </p>
                </div>

                <div className="text-center">
                  <Link 
                    href="/login"
                    className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    <span>Already confirmed? Sign in here</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 bg-red-900/30 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 text-xl">❌</span>
                      <div>
                        <h3 className="font-medium text-red-200">Error</h3>
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* What's included free vs pro */}
                <div className="mb-6 space-y-4">
                  <div className="p-4 bg-green-900/20 rounded-xl border border-green-500/30">
                    <h3 className="text-sm font-semibold text-green-200 mb-3">Free access includes:</h3>
                    <div className="space-y-2 text-sm text-green-100">
                      <div className="flex items-center space-x-2">
                        <span>👀</span>
                        <span>Preview all GPTs & playbooks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📝</span>
                        <span>Full access to all blog posts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🔍</span>
                        <span>Explore categories & descriptions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                    <h3 className="text-sm font-semibold text-purple-200 mb-3">Upgrade to Pro for:</h3>
                    <div className="space-y-2 text-sm text-purple-100">
                      <div className="flex items-center space-x-2">
                        <span>🤖</span>
                        <span>Direct links to all GPTs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📚</span>
                        <span>Download all PDF playbooks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>⚡</span>
                        <span>Priority support</span>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

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
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-gray-100"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-gray-300">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                      Confirm password
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
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agree"
                        name="agree"
                        type="checkbox"
                        required
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agree" className="text-gray-200">
                        I agree to the{' '}
                        <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || !agreed}
                      className="w-full flex justify-center items-center space-x-2 gradient-purple text-white py-3 px-4 rounded-xl text-sm font-semibold button-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <ButtonLoading size="sm" />
                          <span className="ml-2">Creating account & sending confirmation...</span>
                        </span>
                      ) : (
                        <>
                          <span>Create Free Account</span>
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
                      className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl border border-gray-600 bg-slate-800/80 text-sm font-medium text-gray-100 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md group"
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
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                      Sign in here 👋
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-300">
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>⚡</span>
              <span>Instant access</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>❌</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-300 hover:text-purple-600 transition-colors flex items-center justify-center space-x-1">
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