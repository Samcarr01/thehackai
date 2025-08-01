import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Brevo configuration...')
    
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasBREVO_API_KEY: !!process.env.BREVO_API_KEY,
      hasBREVO_FROM_EMAIL: !!process.env.BREVO_FROM_EMAIL,
      brevoApiKeyStart: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) + '...' : 'MISSING',
      brevoFromEmail: process.env.BREVO_FROM_EMAIL || 'NOT_SET'
    }
    
    console.log('📊 Environment check:', envCheck)
    
    // Test Brevo API connection if key exists
    let apiTest = null
    if (process.env.BREVO_API_KEY) {
      try {
        console.log('🔄 Testing Brevo API connection...')
        
        // Test with a simple API call to get account info
        const response = await fetch('https://api.brevo.com/v3/account', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          }
        })
        
        if (response.ok) {
          const accountData = await response.json()
          apiTest = {
            status: 'success',
            accountEmail: accountData.email,
            companyName: accountData.companyName,
            plan: accountData.plan
          }
          console.log('✅ Brevo API connection successful:', apiTest)
        } else {
          const errorText = await response.text()
          apiTest = {
            status: 'error',
            httpStatus: response.status,
            error: errorText
          }
          console.error('❌ Brevo API connection failed:', apiTest)
        }
      } catch (apiError: any) {
        apiTest = {
          status: 'error',
          error: apiError.message
        }
        console.error('❌ Brevo API test error:', apiError)
      }
    }
    
    return NextResponse.json({
      status: 'config_check_complete',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      apiTest: apiTest
    })
  } catch (error: any) {
    console.error('❌ Brevo config check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}