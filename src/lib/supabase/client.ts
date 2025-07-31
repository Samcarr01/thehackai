import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
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
  
  console.log('✅ Creating Supabase client with env vars:', {
    hasUrl: !!url,
    hasKey: !!key,
    urlStart: url.substring(0, 30) + '...',
    keyStart: key.substring(0, 30) + '...'
  })
  
  return createBrowserClient(url, key)
}