import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting name fields migration...')
    
    const supabase = createClient()

    // Check if user is admin (samcarr1232@gmail.com)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.email !== 'samcarr1232@gmail.com') {
      console.error('❌ Unauthorized migration attempt:', user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin user verified, proceeding with migration')

    // Check if columns already exist
    const { data: existingColumns, error: checkError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .limit(1)

    if (!checkError) {
      console.log('✅ Name columns already exist - migration not needed')
      return NextResponse.json({
        status: 'success',
        message: 'Name columns already exist',
        timestamp: new Date().toISOString()
      })
    }

    console.log('🔄 Name columns do not exist, running migration...')

    // Since we can't run DDL through the API, we'll check if the migration is needed
    // and provide instructions for manual migration
    console.log('❌ Cannot run DDL migration through API')
    
    return NextResponse.json({
      status: 'migration_needed',
      message: 'Name columns do not exist - manual migration required',
      instructions: [
        '1. Log into your Supabase dashboard',
        '2. Go to SQL Editor',
        '3. Run the following SQL:',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT, ADD COLUMN IF NOT EXISTS last_name TEXT;',
        'UPDATE public.users SET first_name = \'\', last_name = \'\' WHERE first_name IS NULL OR last_name IS NULL;'
      ],
      sqlFile: '/src/lib/add-name-fields.sql',
      timestamp: new Date().toISOString()
    })

    console.log('✅ Migration completed successfully')

    // Verify the migration worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(3)

    console.log('📊 Migration verification:', { 
      hasData: !!verifyData, 
      count: verifyData?.length || 0,
      error: verifyError?.message 
    })

    return NextResponse.json({
      status: 'success',
      message: 'Name fields migration completed successfully',
      verification: {
        usersFound: verifyData?.length || 0,
        hasNameFields: !verifyError
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Migration error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'POST to this endpoint to run the name fields migration',
    note: 'Only admin user (samcarr1232@gmail.com) can run this migration',
    migration: 'Adds first_name and last_name columns to users table'
  })
}