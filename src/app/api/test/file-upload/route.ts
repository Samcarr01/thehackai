import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 File upload test started')
  
  try {
    const formData = await request.formData()
    const file = formData.get('document') as File
    
    if (!file) {
      console.log('❌ No file in formData')
      return NextResponse.json({ error: 'No file provided', formDataKeys: Array.from(formData.keys()) }, { status: 400 })
    }
    
    console.log('✅ File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })
    
    // Try to read first few bytes
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('✅ File content:', {
      bufferLength: buffer.length,
      firstBytes: buffer.slice(0, 50).toString('hex'),
      isPDF: buffer.slice(0, 4).toString() === '%PDF'
    })
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      content: {
        bufferLength: buffer.length,
        isPDF: buffer.slice(0, 4).toString() === '%PDF',
        firstBytes: buffer.slice(0, 20).toString('utf8', 'ignore')
      }
    })
    
  } catch (error) {
    console.error('❌ File upload test failed:', error)
    return NextResponse.json({ 
      error: 'File upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}