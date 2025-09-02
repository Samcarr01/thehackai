import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  console.log('🧪 Debug: Starting analysis component tests')
  
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {}
  }

  // Test 1: Environment variables
  results.tests.environment = {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    openaiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 10) || 'none'
  }

  // Test 2: OpenAI client initialization
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    results.tests.clientInit = { success: true, hasClient: !!client }
  } catch (error) {
    results.tests.clientInit = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }

  // Test 3: Simple OpenAI API call with GPT-5
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    const response = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'user', content: 'Say "test successful" in JSON format with a message field' }],
      max_completion_tokens: 50
    })
    
    results.tests.gpt5Test = {
      success: true,
      hasResponse: !!response,
      hasChoices: !!response.choices,
      choicesLength: response.choices?.length || 0,
      message: response.choices[0]?.message?.content
    }
  } catch (error) {
    results.tests.gpt5Test = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown'
    }
  }

  // Test 4: PDF Parse library
  try {
    const pdf = (await import('pdf-parse')).default
    results.tests.pdfLibrary = {
      success: true,
      hasPdfParse: !!pdf
    }
  } catch (error) {
    results.tests.pdfLibrary = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  console.log('🧪 Debug: Test results:', results)
  
  return NextResponse.json(results, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}