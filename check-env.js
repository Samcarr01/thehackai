// Quick script to check if environment variables are loaded
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Checking environment variables...')
console.log({
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? 'SET' : 'MISSING',
  'BREVO_API_KEY': process.env.BREVO_API_KEY ? 'SET' : 'MISSING'
})

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('✅ Supabase URL starts with:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...')
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('✅ Supabase Key starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...')
}