import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔍 Debug auth callback:', { 
    hasCode: !!code, 
    codeStart: code ? code.substring(0, 10) + '...' : 'MISSING',
    type, 
    next, 
    origin,
    fullUrl: request.url,
    headers: {
      host: request.headers.get('host'),
      forwardedHost: request.headers.get('x-forwarded-host'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent')
    }
  })

  if (!code) {
    return NextResponse.json({
      status: 'error',
      message: 'No code parameter found',
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries())
    })
  }

  try {
    const supabase = createClient()
    console.log('🔄 Debug: About to exchange code for session...')
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('📊 Debug code exchange result:', { 
      success: !error,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      email: data?.user?.email,
      error: error?.message,
      errorCode: error?.code,
      timestamp: new Date().toISOString()
    })

    // Check current authentication status
    const { data: currentUser, error: getUserError } = await supabase.auth.getUser()
    console.log('👤 Current user check:', {
      hasCurrentUser: !!currentUser?.user,
      currentUserId: currentUser?.user?.id,
      currentUserEmail: currentUser?.user?.email,
      getUserError: getUserError?.message
    })

    return NextResponse.json({
      status: 'debug_complete',
      timestamp: new Date().toISOString(),
      codeExchange: {
        success: !error,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        email: data?.user?.email,
        error: error?.message,
        errorCode: error?.code
      },
      currentUser: {
        hasUser: !!currentUser?.user,
        userId: currentUser?.user?.id,
        email: currentUser?.user?.email,
        error: getUserError?.message
      },
      requestInfo: {
        url: request.url,
        origin,
        code: code ? code.substring(0, 20) + '...' : 'MISSING',
        type,
        next
      }
    })

  } catch (authError: any) {
    console.error('❌ Debug auth callback exception:', authError)
    
    return NextResponse.json({
      status: 'error',
      error: authError.message,
      stack: authError.stack,
      timestamp: new Date().toISOString(),
      requestInfo: {
        url: request.url,
        origin,
        hasCode: !!code
      }
    }, { status: 500 })
  }
}