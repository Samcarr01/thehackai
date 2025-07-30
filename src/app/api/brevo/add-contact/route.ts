import { NextRequest, NextResponse } from 'next/server'
import { brevoService } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, userTier, sendWelcomeEmail } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Adding contact to Brevo:', { email, firstName, userTier })

    // Add contact to Brevo
    const result = await brevoService.addContactOnSignup(email, firstName, userTier || 'free')

    if (!result.success) {
      console.error('Failed to add contact to Brevo:', result.error)
      // Don't fail the signup process, just log the error
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 200 } // Return 200 so signup doesn't fail
      )
    }

    // Optionally send welcome email
    if (sendWelcomeEmail) {
      const welcomeResult = await brevoService.sendWelcomeEmail(email, firstName)
      if (!welcomeResult.success) {
        console.error('Failed to send welcome email:', welcomeResult.error)
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