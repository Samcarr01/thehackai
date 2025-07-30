import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripeHelpers } from '@/lib/stripe'

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

    // Get user's subscription details
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id, email, user_tier')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user has an active subscription
    if (!userProfile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found to cancel' },
        { status: 400 }
      )
    }

    // Cancel the subscription (set to cancel at period end)
    const cancelledSubscription = await stripeHelpers.cancelSubscription(userProfile.stripe_subscription_id)

    if (!cancelledSubscription) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Update user record to reflect cancellation
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user cancellation status:', updateError)
      // Don't fail the request - Stripe webhook will handle this
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. You will retain access until the end of your current billing period.',
      cancel_at_period_end: cancelledSubscription.cancel_at_period_end,
      current_period_end: cancelledSubscription.current_period_end ? new Date((cancelledSubscription as any).current_period_end * 1000).toISOString() : null
    })

  } catch (error: any) {
    console.error('Subscription cancellation failed:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription. Please contact support.' },
      { status: 500 }
    )
  }
}