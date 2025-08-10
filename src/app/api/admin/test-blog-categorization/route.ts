import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Function to test categorization logic
function testCategorization(title: string): string {
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

export async function GET(request: NextRequest) {
  try {
    // CRITICAL SECURITY: Verify admin authentication
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || user.email !== 'samcarr1232@gmail.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Test various blog title scenarios
    const testTitles = [
      "How to Use ChatGPT for Business",
      "Boost Your Productivity with These Tools", 
      "Business Strategy Guide for 2025",
      "Automate Your Workflow with Zapier",
      "Content Creation Tips and Tricks",
      "SEO Marketing Strategies that Work",
      "Learn Python Programming Basics",
      "Data Analysis with Power BI",
      "UI Design Best Practices",
      "Academic Research Methods",
      "Random Title About Something"
    ]
    
    const results = testTitles.map(title => ({
      title,
      predictedCategory: testCategorization(title)
    }))
    
    return NextResponse.json({
      message: 'Blog categorization test results',
      tests: results,
      categories: [
        'AI Tools',
        'Productivity', 
        'Business Strategy',
        'Automation',
        'Content Creation',
        'Marketing',
        'Development',
        'Data Analysis',
        'Design',
        'Research'
      ]
    })
    
  } catch (error) {
    console.error('Test categorization error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}