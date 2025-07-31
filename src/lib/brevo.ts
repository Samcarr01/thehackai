import * as brevo from '@getbrevo/brevo'

// Initialize API client
const apiClient = brevo.ApiClient.instance
apiClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY!

// Initialize service instances
const contactsApi = new brevo.ContactsApi()
const transactionalEmailsApi = new brevo.TransactionalEmailsApi()

export const brevoService = {
  // Add contact to Brevo list on signup
  async addContactOnSignup(email: string, firstName?: string, lastName?: string, userTier: 'free' | 'pro' | 'ultra' = 'free') {
    try {
      const createContact = new brevo.CreateContact()
      
      // Set contact properties
      createContact.email = email
      createContact.attributes = {
        FIRSTNAME: firstName || '',
        LASTNAME: lastName || '',
        USER_TIER: userTier.toUpperCase(),
        SIGNUP_DATE: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        SIGNUP_SOURCE: 'website'
      }
      
      // Add to appropriate lists based on user tier
      const listIds = [1] // Main list ID (replace with your actual list ID)
      
      if (userTier === 'pro') {
        listIds.push(2) // Pro users list (replace with actual ID)
      } else if (userTier === 'ultra') {
        listIds.push(3) // Ultra users list (replace with actual ID)
      }
      
      createContact.listIds = listIds
      
      console.log('Adding contact to Brevo:', { email, userTier, listIds })
      
      const result = await contactsApi.createContact(createContact)
      console.log('✅ Contact added to Brevo successfully:', result.body)
      
      return { success: true, data: result.body }
    } catch (error: any) {
      // Handle case where contact already exists
      if (error.status === 400 && error.body?.message?.includes('Contact already exist')) {
        console.log('Contact already exists in Brevo, updating instead')
        return await this.updateContact(email, { USER_TIER: userTier.toUpperCase() })
      }
      
      console.error('❌ Error adding contact to Brevo:', error)
      return { success: false, error: error.message }
    }
  },

  // Update existing contact
  async updateContact(email: string, attributes: Record<string, any>) {
    try {
      const updateContact = new brevo.UpdateContact()
      updateContact.attributes = attributes
      
      const result = await contactsApi.updateContact(email, updateContact)
      console.log('✅ Contact updated in Brevo successfully')
      
      return { success: true, data: result.body }
    } catch (error: any) {
      console.error('❌ Error updating contact in Brevo:', error)
      return { success: false, error: error.message }
    }
  },

  // Update contact when they upgrade subscription
  async updateContactTier(email: string, newTier: 'pro' | 'ultra') {
    try {
      const updateContact = new brevo.UpdateContact()
      updateContact.attributes = {
        USER_TIER: newTier.toUpperCase(),
        UPGRADE_DATE: new Date().toISOString().split('T')[0]
      }
      
      // Add to appropriate tier list
      const listIds = [1] // Keep on main list
      if (newTier === 'pro') {
        listIds.push(2) // Add to Pro list
      } else if (newTier === 'ultra') {
        listIds.push(3) // Add to Ultra list
      }
      
      updateContact.listIds = listIds
      
      const result = await contactsApi.updateContact(email, updateContact)
      console.log(`✅ Contact upgraded to ${newTier} tier in Brevo`)
      
      return { success: true, data: result.body }
    } catch (error: any) {
      console.error('❌ Error updating contact tier in Brevo:', error)
      return { success: false, error: error.message }
    }
  },

  // Send welcome email campaign (optional)
  async sendWelcomeEmail(email: string, firstName?: string) {
    try {
      // This would send a pre-created welcome campaign
      // You need to create the campaign in Brevo dashboard first
      const sendTransacEmail = new brevo.SendSmtpEmail()
      
      sendTransacEmail.subject = 'Welcome to thehackai! 🚀'
      sendTransacEmail.htmlContent = `
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
      sendTransacEmail.sender = {
        name: 'thehackai',
        email: process.env.BREVO_FROM_EMAIL || 'hello@thehackai.com'
      }
      sendTransacEmail.to = [{ email, name: firstName }]
      
      const result = await transactionalEmailsApi.sendTransacEmail(sendTransacEmail)
      
      console.log('✅ Welcome email sent via Brevo')
      return { success: true, data: result.body }
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error)
      return { success: false, error: error.message }
    }
  },

  // Remove contact (for account deletion)
  async removeContact(email: string) {
    try {
      await contactsApi.deleteContact(email)
      console.log('✅ Contact removed from Brevo')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Error removing contact from Brevo:', error)
      return { success: false, error: error.message }
    }
  }
}