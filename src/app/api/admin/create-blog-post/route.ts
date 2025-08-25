import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { type BlogPost } from '@/lib/blog'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Admin blog post creation API called')
    
    const postData = await request.json()
    
    if (!postData.title || !postData.content || !postData.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    console.log('🔧 Creating blog post:', { 
      title: postData.title, 
      slug: postData.slug,
      category: postData.category,
      contentLength: postData.content?.length || 0 
    })
    
    // Use admin client for blog post creation
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: postData.title,
        content: postData.content,
        slug: postData.slug,
        meta_description: postData.meta_description,
        published_at: postData.published_at,
        category: postData.category,
        read_time: postData.read_time,
        status: postData.status || 'published',
        generated_images: postData.generated_images || null
      }])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database blog post creation error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Database insert failed', 
        details: error.message 
      }, { status: 400 })
    }
    
    console.log('✅ Blog post created successfully:', data.id)
    
    return NextResponse.json({ 
      success: true, 
      post: data 
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