import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Admin client using service role key for server-side operations
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }
  
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}