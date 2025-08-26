import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface HealthCheck {
  service: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  details?: any
  responseTime?: number
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const results: HealthCheck[] = []

  try {
    console.log('🔍 Starting comprehensive system health check...')

    // 1. Database Connection Test
    try {
      const dbStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.from('users').select('count').limit(1)
      const dbTime = Date.now() - dbStart
      
      results.push({
        service: 'Database Connection',
        status: error ? 'error' : 'healthy',
        message: error ? `Database error: ${error.message}` : 'Database connected successfully',
        responseTime: dbTime
      })
    } catch (error) {
      results.push({
        service: 'Database Connection',
        status: 'error',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 2. User Authentication System
    try {
      const authStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.from('users').select('id, email, user_tier').limit(5)
      const authTime = Date.now() - authStart
      
      results.push({
        service: 'User Authentication',
        status: error ? 'error' : 'healthy',
        message: error ? `Auth system error: ${error.message}` : `${data?.length || 0} users accessible`,
        responseTime: authTime,
        details: { userCount: data?.length || 0 }
      })
    } catch (error) {
      results.push({
        service: 'User Authentication',
        status: 'error',
        message: `Auth system failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 3. Content Management (GPTs)
    try {
      const gptsStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.from('gpts').select('id, title, required_tier').limit(10)
      const gptsTime = Date.now() - gptsStart
      
      const tierCounts = data?.reduce((acc: any, gpt) => {
        acc[gpt.required_tier] = (acc[gpt.required_tier] || 0) + 1
        return acc
      }, {}) || {}
      
      results.push({
        service: 'GPTs Content',
        status: error ? 'error' : 'healthy',
        message: error ? `GPTs error: ${error.message}` : `${data?.length || 0} GPTs available`,
        responseTime: gptsTime,
        details: { totalGPTs: data?.length || 0, tierDistribution: tierCounts }
      })
    } catch (error) {
      results.push({
        service: 'GPTs Content',
        status: 'error',
        message: `GPTs system failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 4. Document Management
    try {
      const docsStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.from('documents').select('id, title, required_tier').limit(10)
      const docsTime = Date.now() - docsStart
      
      const tierCounts = data?.reduce((acc: any, doc) => {
        acc[doc.required_tier] = (acc[doc.required_tier] || 0) + 1
        return acc
      }, {}) || {}
      
      results.push({
        service: 'Documents Content',
        status: error ? 'error' : 'healthy',
        message: error ? `Documents error: ${error.message}` : `${data?.length || 0} documents available`,
        responseTime: docsTime,
        details: { totalDocs: data?.length || 0, tierDistribution: tierCounts }
      })
    } catch (error) {
      results.push({
        service: 'Documents Content',
        status: 'error',
        message: `Documents system failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 5. Blog System
    try {
      const blogStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.from('blog_posts').select('id, title, category').limit(10)
      const blogTime = Date.now() - blogStart
      
      results.push({
        service: 'Blog System',
        status: error ? 'error' : 'healthy',
        message: error ? `Blog error: ${error.message}` : `${data?.length || 0} blog posts available`,
        responseTime: blogTime,
        details: { totalPosts: data?.length || 0 }
      })
    } catch (error) {
      results.push({
        service: 'Blog System',
        status: 'error',
        message: `Blog system failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 6. Storage System (Blog Images)
    try {
      const storageStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.storage.from('blog-images').list('', { limit: 1 })
      const storageTime = Date.now() - storageStart
      
      results.push({
        service: 'Blog Image Storage',
        status: error ? 'error' : 'healthy',
        message: error ? `Storage error: ${error.message}` : 'Blog image storage accessible',
        responseTime: storageTime
      })
    } catch (error) {
      results.push({
        service: 'Blog Image Storage',
        status: 'error',
        message: `Storage system failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 7. Document Storage
    try {
      const docStorageStart = Date.now()
      const supabase = createAdminClient()
      const { data, error } = await supabase.storage.from('documents').list('', { limit: 1 })
      const docStorageTime = Date.now() - docStorageStart
      
      results.push({
        service: 'Document Storage',
        status: error ? 'error' : 'healthy',
        message: error ? `Doc storage error: ${error.message}` : 'Document storage accessible',
        responseTime: docStorageTime
      })
    } catch (error) {
      results.push({
        service: 'Document Storage',
        status: 'error',
        message: `Document storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // 8. Environment Variables Check
    const envChecks = {
      'Supabase URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'Supabase Anon Key': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Supabase Service Key': !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      'OpenAI API Key': !!process.env.OPENAI_API_KEY,
      'Perplexity API Key': !!process.env.PERPLEXITY_API_KEY,
      'Stripe Secret Key': !!process.env.STRIPE_SECRET_KEY,
      'Brevo API Key': !!process.env.BREVO_API_KEY
    }
    
    const missingEnvVars = Object.entries(envChecks).filter(([_, exists]) => !exists).map(([key]) => key)
    
    results.push({
      service: 'Environment Variables',
      status: missingEnvVars.length > 0 ? 'warning' : 'healthy',
      message: missingEnvVars.length > 0 
        ? `Missing: ${missingEnvVars.join(', ')}` 
        : 'All environment variables configured',
      details: envChecks
    })

    // 9. API Integrations Test
    try {
      const apiStart = Date.now()
      
      // Test OpenAI API (we know it's out of credits but test connection)
      const openaiTest = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      })
      
      const apiTime = Date.now() - apiStart
      
      results.push({
        service: 'OpenAI API Connection',
        status: openaiTest.ok ? 'healthy' : 'warning',
        message: openaiTest.ok 
          ? 'OpenAI API connection successful' 
          : `OpenAI API issue: ${openaiTest.status} ${openaiTest.statusText}`,
        responseTime: apiTime,
        details: { status: openaiTest.status }
      })
    } catch (error) {
      results.push({
        service: 'OpenAI API Connection',
        status: 'error',
        message: `OpenAI API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // Calculate overall system health
    const totalTime = Date.now() - startTime
    const healthyCount = results.filter(r => r.status === 'healthy').length
    const warningCount = results.filter(r => r.status === 'warning').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    const overallStatus = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'healthy'
    
    console.log('✅ System health check completed:', {
      totalChecks: results.length,
      healthy: healthyCount,
      warnings: warningCount,
      errors: errorCount,
      overallStatus
    })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall_status: overallStatus,
      total_checks: results.length,
      summary: {
        healthy: healthyCount,
        warnings: warningCount,
        errors: errorCount
      },
      total_response_time: totalTime,
      checks: results
    })

  } catch (error) {
    console.error('❌ System health check failed:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall_status: 'error',
      error: 'Health check system failure',
      details: error instanceof Error ? error.message : 'Unknown error',
      partial_results: results
    }, { status: 500 })
  }
}