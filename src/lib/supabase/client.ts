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

// Add method to get stable image URLs without auth context
export function getPublicImageUrl(bucket: string, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}

// Prevent auth state pollution of image requests
export function createImageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables for image client')
  }
  
  // Minimal client for public image access only
  return createBrowserClient(url, key, {
    auth: {
      persistSession: false, // Don't persist for image requests
      autoRefreshToken: false,
    }
  })
}