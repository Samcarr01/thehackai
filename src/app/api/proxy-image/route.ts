import { NextRequest, NextResponse } from 'next/server'

// Simple image proxy to bypass authentication issues
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl || !imageUrl.includes('supabase.co')) {
    return new NextResponse('Invalid URL', { status: 400 })
  }
  
  try {
    // Fetch the image directly without any authentication headers
    const response = await fetch(imageUrl, {
      method: 'GET',
      cache: 'force-cache', // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      return new NextResponse(`Image fetch failed: ${response.statusText}`, { 
        status: response.status 
      })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Failed to fetch image', { status: 500 })
  }
}