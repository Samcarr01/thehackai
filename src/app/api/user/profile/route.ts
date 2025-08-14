import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side profile API that uses service role for performance
// This bypasses RLS sequential scans while maintaining security
export async function GET(request: NextRequest) {
  try {
    // Get user ID from URL params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Create server client to properly handle auth cookies
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const userClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore cookie setting errors in API routes
          }
        },
      },
    })
    
    // Verify the requesting user matches the profile being requested
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    
    if (authError || !user) {
      console.log('🔐 API: Authentication failed:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (user.id !== userId) {
      console.log('🔐 API: User ID mismatch - can only access own profile')
      return NextResponse.json(
        { error: 'Can only access own profile' },
        { status: 403 }
      )
    }
    
    // Use service role client for fast profile lookup without RLS overhead
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      console.error('🚨 Server: Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('🔍 Server: Fetching profile for userId:', userId)
    
    // Fast profile query using service role (bypasses RLS sequential scan)
    // Database tests show this takes <1ms with index scan
    const startTime = Date.now()
    
    try {
      const { data: profileData, error: profileError } = await serviceClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      const queryTime = Date.now() - startTime
      console.log(`⚡ Server: Profile query completed in ${queryTime}ms`)
      
      if (profileError) {
        console.error('❌ Server: Database error:', profileError)
        return NextResponse.json(
          { error: `Database error: ${profileError.message}` },
          { status: 500 }
        )
      }
      
      if (!profileData) {
        console.log('📝 Server: Profile not found in database')
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      
      console.log('✅ Server: Profile found successfully')
      
      // Apply admin tier logic if needed
      let profile = profileData
      if (profileData.email === 'samcarr1232@gmail.com' && !profileData.user_tier) {
        profile = {
          ...profileData,
          is_pro: true,
          user_tier: 'ultra'
        }
      } else {
        profile = {
          ...profileData,
          is_pro: profileData.user_tier === 'pro' || profileData.user_tier === 'ultra'
        }
      }
      
      return NextResponse.json({ profile })
      
    } catch (queryError: any) {
      const queryTime = Date.now() - startTime
      console.error(`❌ Server: Query failed after ${queryTime}ms:`, queryError)
      
      // If it's a connection timeout, try once more
      if (queryTime > 4000 && (queryError.message?.includes('timeout') || queryError.message?.includes('connection'))) {
        console.log('🔄 Server: Retrying query due to connection timeout...')
        try {
          const { data: retryData, error: retryError } = await serviceClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
            
          if (!retryError && retryData) {
            console.log('✅ Server: Retry successful')
            let profile = retryData
            if (retryData.email === 'samcarr1232@gmail.com' && !retryData.user_tier) {
              profile = { ...retryData, is_pro: true, user_tier: 'ultra' }
            } else {
              profile = { ...retryData, is_pro: retryData.user_tier === 'pro' || retryData.user_tier === 'ultra' }
            }
            return NextResponse.json({ profile })
          }
        } catch (retryError) {
          console.error('❌ Server: Retry also failed:', retryError)
        }
      }
      
      return NextResponse.json(
        { error: 'Database connection timeout' },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error('❌ Server: Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}