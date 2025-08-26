import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    console.log('🔧 DALL-E Test - API Key Check:', {
      hasApiKey: !!OPENAI_API_KEY,
      keyPrefix: OPENAI_API_KEY?.substring(0, 10) + '...',
      keyLength: OPENAI_API_KEY?.length
    })

    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        hasApiKey: false
      }, { status: 500 })
    }

    // Test with a simple prompt
    const testPrompt = "A simple test image of a computer"
    
    console.log('🎨 Testing DALL-E with prompt:', testPrompt)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: testPrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1
      })
    })

    console.log('📊 DALL-E API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ DALL-E API Error:', errorText)
      
      return NextResponse.json({
        error: 'DALL-E API request failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ DALL-E API Success:', {
      hasData: !!data?.data,
      imageCount: data?.data?.length || 0,
      firstImageUrl: data?.data?.[0]?.url ? 'present' : 'missing'
    })

    return NextResponse.json({
      success: true,
      message: 'DALL-E API is working',
      imageGenerated: !!data?.data?.[0]?.url,
      testImageUrl: data?.data?.[0]?.url
    })

  } catch (error) {
    console.error('❌ DALL-E Test Error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}