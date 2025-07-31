import { NextRequest, NextResponse } from 'next/server'
import { brevoService } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing Brevo integration...')
    
    const body = await request.json()
    const { email, firstName, lastName, userTier } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email required for test' }, { status: 400 })
    }
    
    console.log('📧 Testing Brevo with:', { email, firstName, lastName, userTier })
    
    // Test the Brevo integration
    const result = await brevoService.addContactOnSignup(
      email, 
      firstName || 'Test', 
      lastName || 'User', 
      userTier || 'free'
    )
    
    console.log('📊 Brevo test result:', result)
    
    return NextResponse.json({
      status: 'test_complete',
      timestamp: new Date().toISOString(),
      input: { email, firstName, lastName, userTier },
      result: result,
      success: result.success,
      message: result.message
    })
  } catch (error: any) {
    console.error('❌ Brevo test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'POST to this endpoint with { email, firstName?, lastName?, userTier? } to test Brevo integration',
    example: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User', 
      userTier: 'free'
    }
  })
}