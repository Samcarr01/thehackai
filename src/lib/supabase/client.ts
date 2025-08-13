import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let client: SupabaseClient | null = null

export function createClient() {
  // Return existing client if already created
  if (client) {
    return client
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('🚨 Supabase environment variables missing:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlStart: url ? url.substring(0, 20) + '...' : 'missing',
      keyStart: key ? key.substring(0, 20) + '...' : 'missing'
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  // Only log once when creating the singleton
  console.log('✅ Creating Supabase client singleton')
  
  // Create and cache the client
  client = createBrowserClient(url, key, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true
    }
  })
  
  return client
}

// Export the client instance directly for better performance
export const supabase = createClient()