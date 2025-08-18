import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Document upload API called')
    
    // Check if user is authenticated
    const authResult = await auth.getUser()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin (you can adjust this logic)
    if (authResult.user.email !== 'samcarr1232@gmail.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const requiredTier = formData.get('required_tier') as string
    const isFeatured = formData.get('is_featured') === 'true'
    
    if (!file || !title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    console.log('🔧 Uploading file:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      title,
      category,
      requiredTier
    })
    
    // Use admin client for storage operations
    const supabase = createAdminClient()
    
    // Upload file to Supabase Storage using admin client
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      return NextResponse.json({ 
        error: 'File upload failed', 
        details: uploadError.message 
      }, { status: 400 })
    }
    
    console.log('✅ File uploaded successfully:', uploadData)
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)
    
    console.log('📄 Public URL generated:', publicUrl)
    
    // Insert document record using admin client
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert([{
        title,
        description,
        pdf_url: publicUrl,
        category,
        is_featured: isFeatured,
        required_tier: requiredTier || 'ultra',
        added_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single()
    
    if (dbError) {
      console.error('❌ Database insert error:', dbError)
      
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([fileName])
      
      return NextResponse.json({ 
        error: 'Database insert failed', 
        details: dbError.message 
      }, { status: 400 })
    }
    
    console.log('✅ Document created successfully:', documentData)
    
    return NextResponse.json({ 
      success: true, 
      document: documentData 
    })
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}