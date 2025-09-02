import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  console.log('🔥 Document analysis started')
  console.log('🔧 Request details:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })

  // Declare fileInfo at function scope for error handler access
  let fileInfo: { name: string; size: number; type: string } | null = null

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ No OpenAI API key')
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('document') as File

    if (!file) {
      console.error('❌ No file provided')
      return NextResponse.json({ error: 'Document file is required' }, { status: 400 })
    }

    // Cache file info to avoid formData reuse issues
    fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type
    }

    console.log('📁 Processing file:', fileInfo.name, 'Size:', fileInfo.size)

    // Extract text content from PDF using proper PDF parser
    let documentText = ''
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      console.log('📖 Parsing PDF with pdf-parse...')
      // Dynamic import to prevent build issues
      const pdf = (await import('pdf-parse')).default
      const pdfData = await pdf(buffer)
      
      if (pdfData.text && pdfData.text.trim().length > 0) {
        // Clean and limit the extracted text
        documentText = pdfData.text
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/[^\w\s\.\,\!\?\:\;\-\(\)]/g, ' ') // Remove special chars
          .trim()
          .substring(0, 3000) // First 3000 characters for better context
          
        console.log('✅ Successfully extracted text:', documentText.length, 'characters')
        console.log('📝 Text sample:', documentText.substring(0, 300) + '...')
        console.log('📊 PDF Info:', {
          pages: pdfData.numpages,
          textLength: pdfData.text.length,
          hasText: pdfData.text.trim().length > 0
        })
      } else {
        console.warn('⚠️ No readable text found in PDF')
      }
    } catch (textError) {
      console.warn('⚠️ PDF parsing failed, using filename only:', textError instanceof Error ? textError.message : 'Unknown error')
    }

    // Get filename insights
    const fileName = fileInfo.name
    const nameWithoutExt = fileName.replace(/\.(pdf|docx?|txt)$/i, '')
    const cleanName = nameWithoutExt.replace(/[-_]/g, ' ')

    // Enhanced AI prompt with actual document content
    const prompt = `You are analyzing a business/technical document for a curated AI tools platform.

DOCUMENT INFORMATION:
Filename: "${fileName}"
Clean name: "${cleanName}"
${documentText ? `Document content sample: "${documentText}"` : 'No readable text extracted - analyze based on filename.'}

ANALYSIS REQUIREMENTS:

1. **Professional Title Creation:**
   - Make it descriptive and searchable (2-8 words)
   - Remove file extensions and technical suffixes
   - Focus on core topic/value (e.g., "AI Development Playbook" not "ai_dev_guide_v2")
   - Use title case formatting

2. **Comprehensive Description (4-6 sentences, 150-300 words):**
   - Start with the specific problem/challenge this document solves
   - Detail 3-4 concrete benefits and practical applications
   - Clearly identify the target audience (developers, marketers, entrepreneurs, etc.)
   - **REQUIRED: Include detailed AI integration examples** - Provide 2-3 specific ways users can leverage this content with AI tools like ChatGPT, Claude, or other AI assistants (e.g., "Use with ChatGPT to automatically generate 30-day content calendars and engagement-driving post variations" or "Apply with Claude to create personalized outreach sequences and automated response templates")
   - Highlight unique methodologies, frameworks, or strategies covered
   - Emphasize actionable takeaways and measurable outcomes
   - Make it comprehensive yet engaging and professional

3. **Accurate Categorization:**
   - Business Planning: Strategy, business models, market analysis, planning frameworks
   - Productivity: Workflows, efficiency, task management, optimization techniques  
   - Communication: Writing, presentations, messaging, social media strategies
   - Automation: Process automation, workflow automation, tool integration
   - Marketing: Content marketing, advertising, growth strategies, campaigns
   - Design: UI/UX, visual design, creative processes, design thinking
   - Development: Programming, coding, technical implementation, software development
   - Education: Learning, teaching, training materials, educational content
   - Writing: Content creation, copywriting, editing, creative writing techniques
   - Analysis: Data analysis, research methods, reporting, analytical frameworks
   - Research: Information gathering, competitive analysis, market research

ANALYSIS CONTEXT:
${documentText ? 'Base your analysis primarily on the document content, using the filename as supporting context.' : 'Since no text could be extracted, create a professional analysis based on the filename and common document patterns.'}

CRITICAL: Your response must be comprehensive. The description field should be 4-6 detailed sentences (minimum 150 words) with multiple specific AI usage examples.

Respond in clean JSON format:
{
  "title": "Professional Descriptive Title",
  "description": "Comprehensive 4-6 sentence description (150-300 words) explaining the problem this solves, specific benefits, target audience, multiple detailed AI integration examples, unique methodologies covered, and actionable outcomes users can expect.",
  "category": "Most Accurate Category"
}

REMEMBER: The description must be comprehensive and detailed, not brief!`

    console.log('🤖 Making OpenAI request with SDK...')
    console.log('🔧 Request details:', {
      model: 'gpt-5',
      promptLength: prompt.length,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      documentTextLength: documentText.length,
      clientInitialized: !!client
    })

    let openaiResponse
    try {
      openaiResponse = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: `You are a document analysis specialist for a premium AI tools platform. Your expertise includes analyzing business documents, technical guides, and educational materials to help users understand both their value AND how to use them with AI tools.

CORE COMPETENCIES:
- Extracting key insights from document content and metadata
- Creating professional, SEO-friendly titles that attract the right audience
- Writing compelling descriptions that clearly communicate value proposition
- Accurate categorization based on primary content focus
- **CRITICAL: Identifying specific AI usage applications** for every playbook/document

ANALYSIS STANDARDS:
- Titles: Professional, descriptive, 2-8 words, immediately clear purpose
- Descriptions: 4-6 sentences, 150-300 words, comprehensive and detailed, problem-focused, benefit-driven, audience-specific
- **AI Integration: ALWAYS include multiple detailed AI usage examples** (specific ChatGPT prompts, Claude applications, automation workflows with concrete examples)
- Categories: Primary function only, most specific match available

APPROACH:
1. Analyze document content first, filename second
2. Focus on practical value and actionable insights
3. Identify target audience and their specific needs
4. **Highlight how users can amplify this content with AI tools**
5. Provide concrete AI integration examples (specific prompts, tools, workflows)
6. Use professional but engaging language

CRITICAL REQUIREMENT: Every description MUST include a specific example of how users can apply this playbook with AI tools like ChatGPT, Claude, Midjourney, etc. Examples:
- "Use with ChatGPT to generate personalized outreach sequences"
- "Apply with Claude to create automated content calendars"
- "Combine with AI writing tools to produce high-converting sales copy"

You excel at transforming technical or business content into compelling, AI-integrated descriptions that help users understand both the value AND the AI-powered implementation possibilities.

FINAL REMINDER: Always write LONG, DETAILED descriptions (4-6 sentences, 150+ words) with multiple specific AI examples. Never write short descriptions!`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
        temperature: 0.2,
        max_completion_tokens: 800
      })
      console.log('📡 OpenAI SDK response received successfully')
    } catch (openaiError) {
      console.error('❌ OpenAI SDK call failed:', {
        error: openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error',
        stack: openaiError instanceof Error ? openaiError.stack : undefined,
        name: openaiError instanceof Error ? openaiError.name : 'Unknown'
      })
      throw openaiError
    }

    const content = openaiResponse.choices[0]?.message?.content

    console.log('🎯 AI raw response:', content)
    console.log('📏 Response length:', content ? content.length : 0)
    console.log('🔍 Full response object:', {
      choices: openaiResponse.choices?.length || 0,
      finishReason: openaiResponse.choices[0]?.finish_reason,
      usage: openaiResponse.usage
    })

    if (!content) {
      throw new Error('No content from OpenAI')
    }

    // Parse the JSON response
    let analyzed
    try {
      // Clean the content in case there are markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      console.log('🧹 Cleaning content for JSON parse...')
      console.log('🔍 Clean content preview:', cleanContent.substring(0, 500))
      analyzed = JSON.parse(cleanContent)
      console.log('✅ Parsed successfully:', analyzed)
    } catch (parseError) {
      console.error('❌ JSON parse failed:', {
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        contentLength: content ? content.length : 0,
        contentPreview: content ? content.substring(0, 500) : 'No content'
      })
      console.error('Raw content was:', content)
      
      // Create fallback result with AI integration
      analyzed = {
        title: cleanName.replace(/\b\w/g, l => l.toUpperCase()),
        description: 'Comprehensive guide with practical insights and actionable strategies for professional development. Use with AI writing tools to customize implementation and accelerate your learning process.',
        category: cleanName.includes('ai') || cleanName.includes('developer') || cleanName.includes('code') ? 'Development' : 'Business Planning'
      }
    }

    const result = {
      title: analyzed.title || cleanName.replace(/\b\w/g, l => l.toUpperCase()),
      description: analyzed.description || 'Comprehensive guide with practical insights and actionable strategies.',
      category: analyzed.category || 'Development'
    }

    console.log('🎉 Final result:', result)
    
    const response = NextResponse.json(result)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response

  } catch (error) {
    console.error('💥 Analysis failed:', error)
    console.error('💥 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    // Create intelligent fallback based on actual filename
    let fallbackTitle = 'Document Analysis'
    let fallbackDescription = 'Professional guide with practical insights and actionable strategies.'
    let fallbackCategory = 'Business Planning'
    
    try {
      if (fileInfo && fileInfo.name) {
        const fileName = fileInfo.name
        const nameWithoutExt = fileName.replace(/\.(pdf|docx?|txt)$/i, '')
        const cleanName = nameWithoutExt.replace(/[-_]/g, ' ')
        
        // Generate better fallback based on filename
        fallbackTitle = cleanName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        
        // Smart category assignment with AI integration
        const lowerName = cleanName.toLowerCase()
        if (lowerName.includes('social media') || lowerName.includes('marketing')) {
          fallbackCategory = 'Marketing'
          fallbackDescription = 'Strategic guide for building social media presence and marketing authority with proven tactics and frameworks. Use with ChatGPT to generate engaging content calendars and automated posting schedules.'
        } else if (lowerName.includes('ai') || lowerName.includes('developer')) {
          fallbackCategory = 'Development'  
          fallbackDescription = 'Technical guide covering AI development practices, coding strategies, and implementation frameworks. Apply with Claude to accelerate code generation and debugging workflows.'
        } else if (lowerName.includes('business') || lowerName.includes('strategy')) {
          fallbackCategory = 'Business Planning'
          fallbackDescription = 'Business strategy guide with actionable frameworks for growth, planning, and execution. Combine with AI writing tools to create comprehensive business plans and strategic presentations.'
        } else {
          fallbackDescription = 'Comprehensive guide with practical insights, proven strategies, and actionable frameworks for professional development. Use with AI assistants to personalize implementation and accelerate results.'
        }
      }
    } catch (fallbackError) {
      console.warn('Error creating intelligent fallback:', fallbackError)
    }

    const fallback = {
      title: fallbackTitle,
      description: fallbackDescription,
      category: fallbackCategory
    }

    console.log('🔄 Returning intelligent fallback:', fallback)
    
    const response = NextResponse.json(fallback)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response
  }
}