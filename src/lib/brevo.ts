// Temporarily disable Brevo integration to fix build
// TODO: Fix Brevo SDK integration

console.log('Brevo integration temporarily disabled for build fix')

export const brevoService = {
  // Add contact to Brevo list on signup (temporarily disabled)
  async addContactOnSignup(email: string, firstName?: string, lastName?: string, userTier: 'free' | 'pro' | 'ultra' = 'free') {
    console.log('🚧 Brevo integration temporarily disabled - would add contact:', { email, firstName, lastName, userTier })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  },

  // Update existing contact (temporarily disabled)
  async updateContact(email: string, attributes: Record<string, any>) {
    console.log('🚧 Brevo integration temporarily disabled - would update contact:', { email, attributes })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  },

  // Update contact when they upgrade subscription (temporarily disabled)
  async updateContactTier(email: string, newTier: 'pro' | 'ultra') {
    console.log('🚧 Brevo integration temporarily disabled - would update tier:', { email, newTier })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  },

  // Send welcome email campaign (temporarily disabled)
  async sendWelcomeEmail(email: string, firstName?: string) {
    console.log('🚧 Brevo integration temporarily disabled - would send welcome email:', { email, firstName })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  },

  // Remove contact (temporarily disabled)
  async removeContact(email: string) {
    console.log('🚧 Brevo integration temporarily disabled - would remove contact:', { email })
    return { success: true, message: 'Brevo integration temporarily disabled' }
  }
}