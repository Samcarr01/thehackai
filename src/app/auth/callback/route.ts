import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // Check if this is a password reset
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔗 Auth callback started:', { hasCode: !!code, type, next, origin })

  if (code) {
    console.log('🔄 Exchanging code for session...')
    
    try {
      const supabase = createClient()
      console.log('🔍 Auth callback: About to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('🔍 Code exchange raw response:', { data, error, timestamp: new Date().toISOString() })
    
      console.log('✅ Code exchange result:', { 
        hasSession: !!data?.session, 
        hasUser: !!data?.user, 
        userId: data?.user?.id,
        email: data?.user?.email,
        type,
        error: error?.message 
      })
    
    // Check if we have a valid session (this means confirmation worked)
    console.log('🔍 Auth callback session check:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      sessionData: data?.session ? 'EXISTS' : 'MISSING',
      userData: data?.user ? { id: data.user.id, email: data.user.email } : 'MISSING',
      errorExists: !!error,
      errorMsg: error?.message
    })
    
    if (data?.session && data?.user) {
      // Check if this is a password reset callback
      if (type === 'recovery') {
        console.log('Auth callback - Password reset, redirecting to reset page')
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/auth/reset-password`)
        } else {
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }
      }
      
      // Regular email confirmation - redirect to dashboard
      console.log('🚀 Email confirmation successful, redirecting to:', next)
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      let redirectUrl
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      console.log('🔗 Final redirect URL:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      // Auth error or no session - check if it's a "already confirmed" error
      console.error('🚨 Auth callback - No valid session/user:', { 
        error: error?.message,
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.user 
      })
      
      // Check if user is already authenticated despite the error
      try {
        console.log('🔍 Checking if user is already authenticated...')
        const { data: currentUser } = await supabase.auth.getUser()
        if (currentUser?.user) {
          console.log('✅ User is already authenticated, redirecting to dashboard')
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      } catch (checkError) {
        console.log('⚠️ Could not check current auth status:', checkError)
      }
      
      // If the error is about already being confirmed, redirect to login instead
      if (error?.message?.includes('already') || error?.message?.includes('expired') || error?.message?.includes('confirmed')) {
        console.log('🔄 Auth callback - Link already used/expired/confirmed, redirecting to login')
        return NextResponse.redirect(`${origin}/login?message=already_confirmed`)
      }
      
      // For any other error, redirect to error page
      console.log('❌ Auth callback - Redirecting to error page')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
    } catch (authError: any) {
      console.error('❌ Auth callback exception:', authError)
      
      // Check if it's an environment variable issue
      if (authError.message?.includes('Missing Supabase environment variables')) {
        console.error('🚨 Auth callback: Missing environment variables!')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=config`)
      }
      
      // Check if it's a 403 auth issue (likely domain/redirect URL config)
      if (authError.message?.includes('403') || authError.status === 403) {
        console.error('🚨 Auth callback: 403 Forbidden - likely domain/redirect URL configuration issue!')
        console.error('🔍 Current origin:', origin)
        console.error('🔍 Headers:', request.headers.get('host'), request.headers.get('x-forwarded-host'))
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=forbidden`)
      }
      
      // Check if it's a 429 rate limit issue
      if (authError.message?.includes('429') || authError.status === 429) {
        console.error('🚨 Auth callback: Rate limit detected!')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=rate_limit`)
      }
      
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // No code parameter - redirect to error page
  console.log('❌ Auth callback - No code parameter')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}