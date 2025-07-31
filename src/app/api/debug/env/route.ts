import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow this endpoint in development or for admin
  const isProduction = process.env.NODE_ENV === 'production'
  const adminEmail = 'samcarr1232@gmail.com'
  
  // In production, require auth header or admin key
  if (isProduction) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer debug-admin-key') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasBrevo: !!process.env.BREVO_API_KEY,
      hasStripe: !!process.env.STRIPE_SECRET_KEY,
      supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...'
        : 'MISSING',
      timestamp: new Date().toISOString()
    }

    console.log('🔍 Environment check:', envCheck)

    return NextResponse.json({
      status: 'success',
      environment: envCheck
    })
  } catch (error: any) {
    console.error('❌ Environment check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}