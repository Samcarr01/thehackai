import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { type UserTier } from '@/lib/user'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Admin tier update API called')
    
    const { userId, tier, ...subscriptionData } = await request.json()
    
    if (!userId || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    console.log('🔄 Updating user tier:', { userId, tier, subscriptionData })
    
    // Use admin client for tier updates
    const supabase = createAdminClient()
    
    const updates = {
      user_tier: tier,
      is_pro: tier === 'pro' || tier === 'ultra', // Backward compatibility
      ...subscriptionData,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database tier update error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Database update failed', 
        details: error.message 
      }, { status: 400 })
    }
    
    console.log('✅ Tier updated successfully:', data)
    
    return NextResponse.json({ 
      success: true, 
      user: data 
    })
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}