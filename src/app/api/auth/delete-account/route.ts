import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Create service role client for admin operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Start a transaction-like cleanup process
    // 1. Delete user data from our custom tables first
    const { error: profileError } = await serviceSupabase
      .from('users')
      .delete()
      .eq('id', user.id)
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      // Continue with deletion even if profile deletion fails
    }

    // 2. Delete the auth user (this will cascade to other auth-related tables)
    const { error: deleteError } = await serviceSupabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    // 3. Sign out the user session (using regular client)
    await supabase.auth.signOut()

    return NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}