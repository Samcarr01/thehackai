import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    // Simple test to analyze text about social media
    const testAnalysis = {
      title: "Social Media Authority Playbook",
      description: "Strategic guide for building social media presence with proven tactics and frameworks. Use with ChatGPT to generate engaging content calendars and automated posting schedules for maximum audience growth.",
      category: "Marketing"
    }
    
    console.log('✅ Simple test working with input:', text)
    return NextResponse.json(testAnalysis)
    
  } catch (error) {
    console.error('❌ Simple test failed:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}