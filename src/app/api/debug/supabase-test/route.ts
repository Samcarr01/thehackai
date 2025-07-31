import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase configuration...')
    
    // Test environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      supabaseKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...'
    }
    
    console.log('📊 Environment check:', envCheck)
    
    // Test server client
    const serverSupabase = createClient()
    console.log('✅ Server client created')
    
    // Test a simple query
    const { data: testData, error: testError } = await serverSupabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('📊 Test query result:', { hasData: !!testData, error: testError?.message })
    
    // Try to get current user (should be null in API context)
    const { data: userData, error: userError } = await serverSupabase.auth.getUser()
    console.log('👤 Current user check:', { hasUser: !!userData?.user, error: userError?.message })
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      serverClient: 'created successfully',
      testQuery: {
        success: !testError,
        error: testError?.message || null
      },
      userCheck: {
        hasUser: !!userData?.user,
        error: userError?.message || null
      }
    })
  } catch (error: any) {
    console.error('❌ Supabase test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}