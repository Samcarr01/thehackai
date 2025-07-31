import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // Check if this is a password reset
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔗 Auth callback started:', { hasCode: !!code, type, next, origin })

  if (code) {
    console.log('🔄 Exchanging code for session...')
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
      console.log('✅ Code exchange result:', { 
        hasSession: !!data?.session, 
        hasUser: !!data?.user, 
        userId: data?.user?.id,
        email: data?.user?.email,
        type,
        error: error?.message 
      })
    
    // Check if we have a valid session (this means confirmation worked)
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
      console.error('Auth callback error:', error)
      
      // If the error is about already being confirmed, redirect to login instead
      if (error?.message?.includes('already') || error?.message?.includes('expired')) {
        console.log('Auth callback - Link already used or expired, redirecting to login')
        return NextResponse.redirect(`${origin}/login?message=already_confirmed`)
      }
      
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
    } catch (authError) {
      console.error('❌ Auth callback exception:', authError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // No code parameter - redirect to error page
  console.log('❌ Auth callback - No code parameter')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}