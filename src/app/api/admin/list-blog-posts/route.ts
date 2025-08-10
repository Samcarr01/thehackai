import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // CRITICAL SECURITY: Verify admin authentication
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'samcarr1232@gmail.com') {
      console.error('❌ Admin access denied:', { 
        hasUser: !!user, 
        email: user?.email, 
        requiredEmail: 'samcarr1232@gmail.com' 
      })
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    console.log('✅ Admin access verified for blog post listing')
    
    // Get all blog posts with their current categories
    const { data: blogPosts, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, category, slug, published_at, created_at')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching blog posts:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
    }
    
    if (!blogPosts || blogPosts.length === 0) {
      return NextResponse.json({ 
        message: 'No blog posts found',
        count: 0,
        posts: []
      })
    }
    
    console.log(`📊 Found ${blogPosts.length} blog posts`)
    
    // Group by category to see current distribution
    const categoryCount = blogPosts.reduce((acc, post) => {
      const category = post.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      message: `Found ${blogPosts.length} blog posts`,
      count: blogPosts.length,
      categoryDistribution: categoryCount,
      posts: blogPosts.map(post => ({
        id: post.id,
        title: post.title,
        category: post.category,
        slug: post.slug,
        published: post.published_at,
        created: post.created_at
      }))
    })
    
  } catch (error) {
    console.error('Blog listing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}