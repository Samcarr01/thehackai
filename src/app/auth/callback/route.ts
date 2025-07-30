import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // Check if this is a password reset
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Auth callback - Code exchange result:', { 
      hasSession: !!data?.session, 
      hasUser: !!data?.user, 
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
      console.log('Auth callback - Success, redirecting to:', next)
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
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
  }

  // No code parameter - redirect to error page
  console.log('Auth callback - No code parameter')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}