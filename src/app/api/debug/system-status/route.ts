import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { brevoService } from '@/lib/brevo'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Running comprehensive system status check...')
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      domain: 'https://thehackai.com',
      status: 'checking...'
    }

    // 1. Check Supabase connection
    console.log('🔄 Testing Supabase connection...')
    let supabaseStatus = { status: 'error', error: 'unknown' }
    try {
      const supabase = createClient()
      const { data: testQuery, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (testError) {
        supabaseStatus = { status: 'error', error: testError.message }
      } else {
        supabaseStatus = { status: 'connected', message: 'Database connection successful' }
      }
    } catch (dbError: any) {
      supabaseStatus = { status: 'error', error: dbError.message }
    }

    // 2. Check if first_name/last_name columns exist
    console.log('🔄 Checking user table schema...')
    let schemaStatus = { status: 'error', error: 'unknown' }
    try {
      const supabase = createClient()
      const { data: schemaTest, error: schemaError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .limit(1)
      
      if (schemaError) {
        if (schemaError.message.includes('column') && schemaError.message.includes('does not exist')) {
          schemaStatus = { 
            status: 'migration_needed', 
            error: 'first_name/last_name columns missing',
            action: 'Run database migration'
          }
        } else {
          schemaStatus = { status: 'error', error: schemaError.message }
        }
      } else {
        schemaStatus = { status: 'ready', message: 'Name columns exist' }
      }
    } catch (schemaErr: any) {
      schemaStatus = { status: 'error', error: schemaErr.message }
    }

    // 3. Check Brevo configuration
    console.log('🔄 Testing Brevo configuration...')
    let brevoStatus = { status: 'error', error: 'unknown' }
    try {
      if (!process.env.BREVO_API_KEY) {
        brevoStatus = { status: 'not_configured', error: 'BREVO_API_KEY not set' }
      } else {
        // Test Brevo API connection
        const response = await fetch('https://api.brevo.com/v3/account', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          }
        })
        
        if (response.ok) {
          const accountData = await response.json()
          brevoStatus = { 
            status: 'connected', 
            account: accountData.email,
            plan: accountData.plan?.type || 'unknown'
          }
        } else {
          brevoStatus = { status: 'auth_error', error: `HTTP ${response.status}` }
        }
      }
    } catch (brevoErr: any) {
      brevoStatus = { status: 'error', error: brevoErr.message }
    }

    // 4. Check essential environment variables
    console.log('🔄 Checking environment variables...')
    const envStatus = {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      brevo: {
        apiKey: !!process.env.BREVO_API_KEY,
        fromEmail: !!process.env.BREVO_FROM_EMAIL
      },
      stripe: {
        secretKey: !!process.env.STRIPE_SECRET_KEY,
        publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
      },
      openai: {
        apiKey: !!process.env.OPENAI_API_KEY
      }
    }

    // 5. Overall system status
    let overallStatus = 'healthy'
    const issues = []

    if (supabaseStatus.status === 'error') {
      overallStatus = 'critical'
      issues.push('Database connection failed')
    }

    if (schemaStatus.status === 'migration_needed') {
      overallStatus = 'degraded'
      issues.push('Database migration needed')
    }

    if (brevoStatus.status === 'error' || brevoStatus.status === 'auth_error') {
      overallStatus = 'degraded'
      issues.push('Brevo integration issues')
    }

    console.log('📊 System status check complete:', { overallStatus, issues })

    return NextResponse.json({
      ...results,
      status: overallStatus,
      issues: issues,
      components: {
        database: supabaseStatus,
        schema: schemaStatus,
        brevo: brevoStatus,
        environment: envStatus
      },
      recommendations: schemaStatus.status === 'migration_needed' ? [
        'Run database migration to add first_name/last_name columns',
        'Visit /api/admin/migrate-names for migration instructions'
      ] : []
    })

  } catch (error: any) {
    console.error('❌ System status check error:', error)
    return NextResponse.json({
      status: 'critical',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}