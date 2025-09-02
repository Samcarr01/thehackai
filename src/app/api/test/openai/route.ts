import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function GET() {
  console.log('🧪 OpenAI API test started')
  
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'No OpenAI API key configured' }, { status: 500 })
    }
    
    console.log('✅ API key present:', {
      hasKey: !!OPENAI_API_KEY,
      keyStart: OPENAI_API_KEY.substring(0, 10) + '...',
      keyLength: OPENAI_API_KEY.length
    })
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'user',
            content: 'Say hello in JSON format with just a message field'
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    })
    
    console.log('📡 OpenAI response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API error:', errorText)
      return NextResponse.json({
        error: 'OpenAI API failed',
        status: response.status,
        details: errorText
      }, { status: 500 })
    }
    
    const result = await response.json()
    console.log('✅ OpenAI success:', result)
    
    return NextResponse.json({
      success: true,
      openaiResponse: result,
      testMessage: result.choices[0]?.message?.content
    })
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error)
    return NextResponse.json({
      error: 'OpenAI test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}