import { NextRequest, NextResponse } from 'next/server'
import { getStripe, stripeHelpers } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID and email
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id, email, user_tier')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Special handling for admin user - allow access even without payment
    if (userProfile.email === 'samcarr1232@gmail.com') {
      // Admin user gets access to portal even without stripe_customer_id
      if (!userProfile.stripe_customer_id) {
        return NextResponse.json(
          { error: 'Admin user: No payment history found. Create a test subscription first to access billing portal.' },
          { status: 400 }
        )
      }
    } else {
      // Regular users must have a stripe_customer_id
      if (!userProfile?.stripe_customer_id) {
        return NextResponse.json(
          { error: 'No active subscription found. Please upgrade to a paid plan to access billing management.' },
          { status: 400 }
        )
      }
    }

    // Create portal session
    const session = await stripeHelpers.createPortalSession(userProfile.stripe_customer_id)

    return NextResponse.json({ 
      url: session.url 
    })

  } catch (error: any) {
    console.error('Portal session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}