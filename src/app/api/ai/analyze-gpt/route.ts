import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  let url: string = ''
  
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const requestData = await request.json()
    url = requestData.url

    if (!url) {
      return NextResponse.json(
        { error: 'GPT URL is required' },
        { status: 400 }
      )
    }

    // Fetch the GPT page to get actual title and description
    let gptData: any = {}
    try {
      console.log('🔍 Fetching GPT page:', url)
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (pageResponse.ok) {
        const html = await pageResponse.text()
        console.log('📄 Fetched HTML length:', html.length)
        
        // Extract title from multiple possible locations
        const titlePatterns = [
          /<title[^>]*>([^<]+)<\/title>/i,
          /<h1[^>]*>([^<]+)<\/h1>/i,
          /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          /<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["'][^>]*>/i
        ]
        
        for (const pattern of titlePatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            gptData.title = match[1]
              .replace(' | ChatGPT', '')
              .replace(' - ChatGPT', '')
              .replace('ChatGPT - ', '')
              .trim()
            console.log('✅ Found title:', gptData.title)
            break
          }
        }

        // Extract description from multiple possible locations
        const descPatterns = [
          /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          /<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)<\/p>/i,
          /<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)<\/div>/i
        ]
        
        for (const pattern of descPatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            gptData.description = match[1].trim()
            console.log('✅ Found description:', gptData.description.substring(0, 100) + '...')
            break
          }
        }

        // Try to extract GPT name from URL if title extraction failed
        if (!gptData.title) {
          const urlMatch = url.match(/\/g\/g-[a-f0-9]+-(.+)$/i)
          if (urlMatch && urlMatch[1]) {
            gptData.title = urlMatch[1]
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
            console.log('✅ Extracted title from URL:', gptData.title)
          }
        }
        
        console.log('📊 Final extracted data:', gptData)
      } else {
        console.log('❌ Failed to fetch page:', pageResponse.status, pageResponse.statusText)
      }
    } catch (fetchError) {
      console.error('❌ Error fetching GPT page:', fetchError)
    }

    // Enhanced AI analysis with deeper understanding
    const analysisPrompt = `
You are a specialist in analyzing AI tools and GPTs. Analyze this ChatGPT GPT:

URL: ${url}
${gptData.title ? `Extracted title: "${gptData.title}"` : ''}
${gptData.description ? `Extracted description: "${gptData.description}"` : ''}

ANALYSIS INSTRUCTIONS:

1. **URL Intelligence:** Extract meaning from the URL path:
   - Look for keywords in the GPT ID section after "/g/"
   - Identify patterns that suggest functionality
   - Consider common GPT naming conventions

2. **Title Optimization:** Create a professional, searchable title:
   - Remove marketing fluff and excessive emojis
   - Focus on core functionality (e.g., "Email Writer" not "🚀 Amazing Email Creator Pro!")
   - Make it immediately understandable to potential users
   - Use title case formatting

3. **Description Excellence:** Write a compelling 2-3 sentence description:
   - Start with the specific problem it solves
   - Include 2-3 concrete use cases or benefits
   - Mention the target audience (entrepreneurs, marketers, developers, etc.)
   - Use active voice and benefit-focused language

4. **Smart Categorization:** Choose the most accurate category:
   - Business Planning: Strategy, business models, market analysis, planning
   - Productivity: Task management, workflows, efficiency tools
   - Communication: Email, messaging, presentations, social media
   - Automation: Process automation, workflow automation, task automation  
   - Marketing: Content marketing, advertising, campaigns, growth
   - Design: UI/UX, graphics, visual content, creative work
   - Development: Programming, coding, technical implementation
   - Education: Learning, teaching, training, educational content
   - Writing: Content creation, copywriting, editing, creative writing
   - Analysis: Data analysis, research analysis, reporting
   - Research: Information gathering, fact-checking, competitive research
   - Customer Service: Support, help desk, customer communication

QUALITY STANDARDS:
- Titles should be 2-6 words, descriptive, and professional
- Descriptions should be 150-250 characters, benefit-focused
- Categories should reflect primary function, not secondary features

Respond in clean JSON:
{
  "title": "Professional Descriptive Title",
  "description": "Compelling description explaining what it does, key benefits, and who should use it for maximum value.",
  "category": "Most Accurate Primary Category"
}
`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `You are an AI tool analysis specialist with expertise in ChatGPT GPTs and productivity tools. Your job is to create professional, accurate, and compelling titles and descriptions.

EXPERTISE AREAS:
- Understanding GPT functionality from URLs and metadata
- Writing benefit-focused, conversion-optimized descriptions  
- Professional categorization of AI tools
- Creating searchable, SEO-friendly titles

ANALYSIS APPROACH:
1. Extract meaningful insights from URLs, especially GPT ID patterns
2. Focus on core functionality over marketing language
3. Write for the target user, not generic audiences
4. Prioritize clarity and immediate value proposition
5. Use professional, confident tone without hype

QUALITY METRICS:
- Titles: Clear, searchable, 2-6 words, immediately understandable
- Descriptions: 150-250 chars, problem-focused, benefit-driven, audience-specific
- Categories: Primary function only, most specific available option

You excel at transforming vague or marketing-heavy GPT information into professional, actionable content that helps users make informed decisions.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 600
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ OpenAI API error:', openaiResponse.status, errorText)
      throw new Error(`OpenAI API request failed: ${openaiResponse.status} - ${errorText}`)
    }

    const aiResult = await openaiResponse.json()
    const content = aiResult.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    // Clean the content - remove markdown code blocks if present
    let cleanContent = content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Parse the JSON response
    const analyzed = JSON.parse(cleanContent)

    return NextResponse.json({
      title: analyzed.title || gptData.title || 'GPT Analysis',
      description: analyzed.description || gptData.description || 'AI-powered GPT tool',
      category: analyzed.category || 'Productivity'
    })

  } catch (error) {
    console.error('❌ GPT analysis error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: url
    })
    
    // Try to extract a better title from URL as fallback
    let fallbackTitle = 'GPT Tool'
    try {
      const urlMatch = url.match(/\/g\/g-[a-f0-9]+-(.+)$/i)
      if (urlMatch && urlMatch[1]) {
        fallbackTitle = urlMatch[1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
      }
    } catch (urlError) {
      console.error('Error extracting title from URL:', urlError)
    }
    
    // Enhanced fallback response if AI analysis fails
    return NextResponse.json({
      title: fallbackTitle,
      description: 'AI-powered GPT tool for enhanced productivity and automation. Visit the ChatGPT link to learn more about its specific capabilities.',
      category: 'Productivity'
    })
  }
}