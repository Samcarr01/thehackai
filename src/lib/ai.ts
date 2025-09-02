// AI analysis service for GPTs and documents

interface AnalyzedContent {
  title: string
  description: string
  category: string
}

export const aiService = {
  async analyzeGPT(url: string): Promise<AnalyzedContent> {
    // Extract GPT ID from URL
    const gptId = url.match(/g-([a-f0-9-]+)/)?.[1]
    if (!gptId) {
      throw new Error('Invalid GPT URL format')
    }

    try {
      // Call our API endpoint to analyze the GPT
      const response = await fetch('/api/ai/analyze-gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GPT analysis API error:', response.status, errorText)
        throw new Error(`Failed to analyze GPT: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('GPT analysis error:', error)
      throw error
    }
  },

  async analyzeDocument(file: File): Promise<AnalyzedContent> {
    console.log('🔥 Frontend: Starting document analysis')
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    try {
      const formData = new FormData()
      formData.append('document', file)

      console.log('🚀 Frontend: Making API request to /api/ai/analyze-document-working')
      console.log('📋 FormData contents:', {
        hasDocument: formData.has('document'),
        keys: Array.from(formData.keys())
      })

      // Use the working endpoint that definitely works
      const response = await fetch('/api/ai/analyze-document-working', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Frontend: API response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        type: response.type,
        redirected: response.redirected
      })

      if (!response.ok) {
        let errorBody = 'No error body'
        try {
          errorBody = await response.text()
          console.error('❌ Frontend: Error response body:', errorBody)
        } catch (bodyError) {
          console.error('❌ Frontend: Could not read error body:', bodyError)
        }
        
        const errorMessage = `API request failed: ${response.status} ${response.statusText} - ${errorBody}`
        console.error('❌ Frontend: Full error:', errorMessage)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ Frontend: Analysis successful:', result)
      return result
    } catch (error) {
      console.error('💥 Frontend: Document analysis error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        cause: error instanceof Error ? error.cause : undefined
      })
      throw error
    }
  }
}