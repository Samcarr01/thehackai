// Simple Brevo integration using direct API calls instead of SDK

// Brevo list IDs from your dashboard
const BREVO_LIST_IDS = {
  ALL_USERS: 4,    // All Users list
  PRO_USERS: 5,    // Pro Users list  
  ULTRA_USERS: 6   // Ultra Users list
}

export const brevoService = {
  // Add contact to Brevo list on signup
  async addContactOnSignup(email: string, firstName?: string, lastName?: string, userTier: 'free' | 'pro' | 'ultra' = 'free') {
    const brevoApiKey = process.env.BREVO_API_KEY
    
    if (!brevoApiKey) {
      console.log('🚧 Brevo API key not configured - skipping email list addition')
      console.log('🔍 Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        hasBREVO_API_KEY: !!process.env.BREVO_API_KEY,
        keyStart: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) + '...' : 'MISSING'
      })
      return { success: true, message: 'Brevo API key not configured - email list addition skipped' }
    }

    try {
      console.log('🔄 Sending contact to Brevo:', { email, firstName, lastName, userTier })
      
      // Determine which lists to add user to based on tier
      let listIds: number[] = []
      
      // Add to "All Users" list  
      listIds.push(BREVO_LIST_IDS.ALL_USERS)
      
      // Add to tier-specific list
      if (userTier === 'pro') {
        listIds.push(BREVO_LIST_IDS.PRO_USERS)
      } else if (userTier === 'ultra') {
        listIds.push(BREVO_LIST_IDS.ULTRA_USERS)
      }
      // Free users only go to "All Users" list
      
      console.log('📋 Adding to Brevo lists:', { userTier, listIds })
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          attributes: {
            FIRSTNAME: firstName || '',
            LASTNAME: lastName || '',
            USER_TIER: userTier.toUpperCase(),
            SIGNUP_DATE: new Date().toISOString().split('T')[0],
            SIGNUP_SOURCE: 'website'
          },
          listIds: listIds
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        console.log('✅ Contact added to Brevo successfully:', email)
        return { success: true, message: 'Contact added to Brevo' }
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to add contact to Brevo:', { 
          status: response.status, 
          error: errorData,
          headers: response.headers,
          hasApiKey: !!brevoApiKey,
          apiKeyStart: brevoApiKey.substring(0, 10) + '...'
        })
        
        // Handle specific error messages
        if (response.status === 429) {
          console.error('🚨 Brevo API rate limit hit!')
          return { success: false, message: 'Brevo API rate limit - too many requests' }
        }
        
        if (response.status === 401 || errorData.includes('No API key found')) {
          console.error('🚨 Brevo API authentication failed!')
          return { success: false, message: 'Brevo API authentication failed - check API key' }
        }
        
        // Handle common Brevo errors
        if (response.status === 400 && (errorData.includes('already exists') || errorData.includes('duplicate_parameter') || errorData.includes('already associated'))) {
          console.log('✅ Contact already exists in Brevo - treating as success')
          return { success: true, message: 'Contact already exists in Brevo' }
        }
        
        return { success: false, message: `Brevo API error: ${response.status} - ${errorData}` }
      }
    } catch (error: any) {
      console.error('❌ Error calling Brevo API:', error)
      
      // Handle timeout specifically
      if (error.name === 'AbortError') {
        console.error('Brevo API timeout after 10 seconds')
        return { success: false, message: 'Brevo API timeout' }
      }
      
      return { success: false, message: error.message }
    }
  },

  // Update existing contact (temporarily disabled)
  async updateContact(email: string, attributes: Record<string, any>) {
    console.log('🚧 Brevo integration temporarily disabled - would update contact:', { email, attributes })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  },

  // Update contact when they upgrade subscription
  async updateContactTier(email: string, newTier: 'pro' | 'ultra') {
    const brevoApiKey = process.env.BREVO_API_KEY
    
    if (!brevoApiKey) {
      console.log('🚧 Brevo API key not configured - skipping tier update')
      return { success: true, message: 'Brevo API key not configured' }
    }

    try {
      console.log('🔄 Updating Brevo contact tier:', { email, newTier })
      
      // Determine new list assignments
      let newListIds: number[] = []
      newListIds.push(BREVO_LIST_IDS.ALL_USERS)
      
      if (newTier === 'pro') {
        newListIds.push(BREVO_LIST_IDS.PRO_USERS)
      } else if (newTier === 'ultra') {
        newListIds.push(BREVO_LIST_IDS.ULTRA_USERS)
      }
      
      console.log('📋 Updating to Brevo lists:', { newTier, newListIds })
      
      // Update contact attributes and lists
      const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          attributes: {
            USER_TIER: newTier.toUpperCase(),
            UPGRADE_DATE: new Date().toISOString().split('T')[0]
          },
          listIds: newListIds,
          unlinkListIds: [] // Remove from all other lists first if needed
        })
      })

      if (response.ok) {
        console.log('✅ Contact tier updated in Brevo successfully:', email)
        return { success: true, message: 'Contact tier updated in Brevo' }
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to update contact tier in Brevo:', errorData)
        return { success: false, message: `Brevo tier update error: ${response.status}` }
      }
    } catch (error: any) {
      console.error('❌ Error updating contact tier in Brevo:', error)
      return { success: false, message: error.message }
    }
  },

  // Send welcome email campaign
  async sendWelcomeEmail(email: string, firstName?: string) {
    if (!process.env.BREVO_API_KEY) {
      console.log('🚧 Brevo API key not configured for welcome email')
      return { success: true, message: 'Brevo API key not configured' }
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'thehackai',
            email: process.env.BREVO_FROM_EMAIL || 'hello@thehackai.com'
          },
          to: [{ email, name: firstName || 'there' }],
          subject: 'Welcome to thehackai! 🚀',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">Welcome to thehackai! 🚀</h1>
              <p>Hi ${firstName || 'there'},</p>
              <p>Thanks for joining thehackai! You now have access to:</p>
              <ul>
                <li>📚 All our blog posts and AI insights</li>
                <li>👀 Preview of our premium GPTs and playbooks</li>
                <li>🚀 Upgrade options for full access</li>
              </ul>
              <p>Ready to explore? <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color: #8B5CF6;">Visit your dashboard</a></p>
              <p>Best regards,<br>The thehackai Team</p>
            </div>
          `
        })
      })

      if (response.ok) {
        console.log('✅ Welcome email sent via Brevo:', email)
        return { success: true, message: 'Welcome email sent' }
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to send welcome email:', errorData)
        return { success: false, message: `Brevo email API error: ${response.status}` }
      }
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error)
      return { success: false, message: error.message }
    }
  },

  // Remove contact (temporarily disabled)
  async removeContact(email: string) {
    console.log('🚧 Brevo integration temporarily disabled - would remove contact:', { email })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  }
}