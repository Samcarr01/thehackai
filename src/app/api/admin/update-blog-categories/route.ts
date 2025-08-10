import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Function to intelligently categorize based on title/content
function getCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase()
  
  // AI Tools
  if (titleLower.includes('chatgpt') || titleLower.includes('claude') || titleLower.includes('ai tool') || 
      titleLower.includes('openai') || titleLower.includes('artificial intelligence') || titleLower.includes('machine learning')) {
    return 'AI Tools'
  }
  
  // Productivity 
  if (titleLower.includes('productivity') || titleLower.includes('efficiency') || titleLower.includes('time management') ||
      titleLower.includes('organize') || titleLower.includes('workflow optimization')) {
    return 'Productivity'
  }
  
  // Business Strategy
  if (titleLower.includes('business') || titleLower.includes('strategy') || titleLower.includes('planning') ||
      titleLower.includes('growth') || titleLower.includes('leadership') || titleLower.includes('decision')) {
    return 'Business Strategy'
  }
  
  // Automation
  if (titleLower.includes('automation') || titleLower.includes('workflow') || titleLower.includes('automate') ||
      titleLower.includes('zapier') || titleLower.includes('integration')) {
    return 'Automation'
  }
  
  // Content Creation
  if (titleLower.includes('content') || titleLower.includes('writing') || titleLower.includes('creative') ||
      titleLower.includes('blog') || titleLower.includes('video') || titleLower.includes('design')) {
    return 'Content Creation'
  }
  
  // Marketing
  if (titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('social media') ||
      titleLower.includes('advertising') || titleLower.includes('campaign')) {
    return 'Marketing'
  }
  
  // Development
  if (titleLower.includes('development') || titleLower.includes('coding') || titleLower.includes('programming') ||
      titleLower.includes('code') || titleLower.includes('developer')) {
    return 'Development'
  }
  
  // Data Analysis
  if (titleLower.includes('data') || titleLower.includes('analytics') || titleLower.includes('analysis') ||
      titleLower.includes('visualization') || titleLower.includes('reporting')) {
    return 'Data Analysis'
  }
  
  // Design
  if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux') ||
      titleLower.includes('graphic') || titleLower.includes('visual')) {
    return 'Design'
  }
  
  // Research
  if (titleLower.includes('research') || titleLower.includes('study') || titleLower.includes('investigation') ||
      titleLower.includes('academic') || titleLower.includes('discovery')) {
    return 'Research'
  }
  
  // Default to AI Tools if nothing matches
  return 'AI Tools'
}

export async function POST(request: NextRequest) {
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
    
    console.log('✅ Admin access verified for blog category updates')
    
    // Get all blog posts
    const { data: blogPosts, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, category')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching blog posts:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
    }
    
    if (!blogPosts || blogPosts.length === 0) {
      return NextResponse.json({ 
        message: 'No blog posts found',
        updated: 0,
        posts: []
      })
    }
    
    console.log(`📊 Found ${blogPosts.length} blog posts to categorize`)
    
    let updatedCount = 0
    const updates = []
    
    // Process each blog post
    for (const post of blogPosts) {
      const newCategory = getCategoryFromTitle(post.title)
      
      // Only update if category is different
      if (post.category !== newCategory) {
        console.log(`📝 Updating "${post.title}": "${post.category}" → "${newCategory}"`)
        
        const { error: updateError } = await supabaseAdmin
          .from('blog_posts')
          .update({ category: newCategory })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ Failed to update post ${post.id}:`, updateError)
        } else {
          updatedCount++
          updates.push({
            title: post.title,
            oldCategory: post.category,
            newCategory: newCategory
          })
        }
      } else {
        console.log(`✅ "${post.title}" already correctly categorized as "${post.category}"`)
      }
    }
    
    console.log(`✅ Category update complete: ${updatedCount}/${blogPosts.length} posts updated`)
    
    return NextResponse.json({
      message: `Successfully updated ${updatedCount} blog post categories`,
      updated: updatedCount,
      total: blogPosts.length,
      updates: updates
    })
    
  } catch (error) {
    console.error('Blog category update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}