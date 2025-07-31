import { NextRequest, NextResponse } from 'next/server'
import { brevoService } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  console.log('🔄 Brevo API route called')
  
  try {
    const requestBody = await request.json()
    console.log('📨 Request body:', requestBody)
    
    const { email, firstName, lastName, userTier, sendWelcomeEmail } = requestBody

    if (!email) {
      console.log('❌ No email provided in request')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('📧 Processing Brevo contact:', { email, firstName, lastName, userTier, sendWelcomeEmail })

    // Add contact to Brevo
    const result = await brevoService.addContactOnSignup(email, firstName, lastName, userTier || 'free')

    if (!result.success) {
      console.error('Failed to add contact to Brevo:', result.message || 'Unknown error')
      
      // Check if it's a rate limit or auth error that might be causing the 429
      if (result.message?.includes('rate limit') || result.message?.includes('429')) {
        // Don't fail the signup but log the rate limit
        console.error('🚨 Brevo rate limit detected during signup')
        return NextResponse.json(
          { success: false, error: 'Email service rate limited - signup completed but email list addition failed' },
          { status: 200 } // Return 200 so signup doesn't fail
        )
      }
      
      if (result.message?.includes('authentication') || result.message?.includes('API key')) {
        // Don't fail the signup but log the auth issue
        console.error('🚨 Brevo authentication issue during signup')
        return NextResponse.json(
          { success: false, error: 'Email service authentication failed - signup completed but email list addition failed' },
          { status: 200 } // Return 200 so signup doesn't fail
        )
      }
      
      // Don't fail the signup process, just log the error
      return NextResponse.json(
        { success: false, error: result.message || 'Unknown error' },
        { status: 200 } // Return 200 so signup doesn't fail
      )
    }

    // Optionally send welcome email
    if (sendWelcomeEmail) {
      const welcomeResult = await brevoService.sendWelcomeEmail(email, firstName)
      if (!welcomeResult.success) {
        console.error('Failed to send welcome email:', welcomeResult.message || 'Unknown error')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contact added to Brevo successfully'
    })

  } catch (error: any) {
    console.error('Brevo API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add contact to Brevo' },
      { status: 200 } // Return 200 so signup doesn't fail
    )
  }
}