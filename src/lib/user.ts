import { createClient } from './supabase/client'

export type UserTier = 'free' | 'pro' | 'ultra'

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  is_pro: boolean // Keep for backward compatibility
  user_tier: UserTier
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status?: string
  subscription_current_period_end?: string
  subscription_cancel_at_period_end?: boolean
  created_at: string
  updated_at: string
}

export const TIER_NAMES = {
  free: 'Free',
  pro: 'Pro',
  ultra: 'Ultra'
} as const

export const TIER_PRICES = {
  free: 0,
  pro: 7,
  ultra: 19
} as const

export const TIER_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Get started with AI',
    features: [
      'Blog access',
      'GPT previews',
      'Playbook previews',
      'Community access'
    ]
  },
  pro: {
    name: 'Pro',
    price: 7,
    description: 'Daily AI Use',
    features: [
      'Everything in Free',
      '3 essential GPTs',
      '2 core playbooks',
      'Email support'
    ]
  },
  ultra: {
    name: 'Ultra',
    price: 19,
    description: 'Upscale Your AI Game',
    features: [
      'Everything in Pro',
      'All 7 GPTs',
      'All 4 playbooks',
      'Priority support',
      'Early access'
    ]
  }
} as const

// Helper function to get user display name
export const getUserDisplayName = (user: UserProfile | null): string => {
  if (!user) return 'User'
  
  // If we have first and last name, use them
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`.trim()
  }
  
  // If we only have first name, use it
  if (user.first_name) {
    return user.first_name
  }
  
  // Fall back to extracting name from email
  const email = user.email
  const username = email.split('@')[0]
  
  // Remove common number patterns from the end
  const withoutNumbers = username.replace(/\d+$/, '')
  
  // Try to split on common patterns
  let parts: string[] = []
  
  // Check for common separators first
  if (withoutNumbers.includes('.')) {
    parts = withoutNumbers.split('.')
  } else if (withoutNumbers.includes('_')) {
    parts = withoutNumbers.split('_')
  } else if (withoutNumbers.includes('-')) {
    parts = withoutNumbers.split('-')
  } else {
    // Try to intelligently split camelCase or common name patterns
    const commonFirstNames = ['sam', 'john', 'jane', 'mike', 'chris', 'alex', 'david', 'sarah', 'emma', 'james']
    
    for (const firstName of commonFirstNames) {
      if (withoutNumbers.toLowerCase().startsWith(firstName)) {
        const remaining = withoutNumbers.slice(firstName.length)
        if (remaining.length > 0) {
          parts = [firstName, remaining]
          break
        }
      }
    }
    
    // If no pattern found, just use the whole username
    if (parts.length === 0) {
      parts = [withoutNumbers]
    }
  }
  
  // Capitalize each part
  const capitalizedParts = parts.map(part => 
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  )
  
  // Return the formatted name or fall back to username
  return capitalizedParts.length > 1 ? capitalizedParts.join(' ') : capitalizedParts[0] || username
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    // Give admin Ultra access (highest tier) only if user_tier is not explicitly set
    // Skip auto-upgrade if admin has manually set a tier for testing
    if (data && data.email === 'samcarr1232@gmail.com' && !data.user_tier) {
      return {
        ...data,
        is_pro: true,  // Backward compatibility
        user_tier: 'ultra' as UserTier
      }
    }
    
    // Ensure backward compatibility: sync is_pro with user_tier
    return {
      ...data,
      is_pro: data.user_tier === 'pro' || data.user_tier === 'ultra'
    }
  },

  async createProfile(userId: string, email: string, firstName?: string, lastName?: string): Promise<UserProfile | null> {
    const supabase = createClient()
    
    // Try to create profile with name fields, fallback if columns don't exist
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            first_name: firstName || '',
            last_name: lastName || '',
            is_pro: false,
            user_tier: 'free' as UserTier
          }
        ])
        .select()
        .single()
      
      if (error) {
        // If first_name/last_name columns don't exist, try without them
        if (error.message?.includes('column') && (error.message?.includes('first_name') || error.message?.includes('last_name'))) {
          console.log('Creating profile without name columns (schema not migrated yet)')
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                email: email,
                is_pro: false,
                user_tier: 'free' as UserTier
              }
            ])
            .select()
            .single()
          
          if (fallbackError) {
            console.error('Error creating user profile (fallback):', fallbackError)
            return null
          }
          
          return fallbackData
        }
        
        console.error('Error creating user profile:', error)
        return null
      }
      
      return data
    } catch (err) {
      console.error('Error in createProfile:', err)
      return null
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }
    
    return data
  },

  async updateTier(userId: string, tier: UserTier, subscriptionData?: {
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    subscriptionStatus?: string
    currentPeriodEnd?: string | undefined
    cancelAtPeriodEnd?: boolean
  }): Promise<boolean> {
    const supabase = createClient()
    
    const updates = {
      user_tier: tier,
      is_pro: tier === 'pro' || tier === 'ultra', // Backward compatibility
      ...subscriptionData
    }
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating user tier:', error)
      return false
    }
    
    return true
  },

  // Backward compatibility method
  async upgradeToPro(userId: string, stripeCustomerId: string): Promise<boolean> {
    return this.updateTier(userId, 'pro', {
      stripeCustomerId,
      subscriptionStatus: 'active'
    })
  },

  // Check if user has access to specific tier content
  hasAccessToTier(userTier: UserTier, requiredTier: UserTier): boolean {
    // Free content: everyone can access
    if (requiredTier === 'free') return true
    
    // Pro content: Pro and Ultra users can access
    if (requiredTier === 'pro') return userTier === 'pro' || userTier === 'ultra'
    
    // Ultra content: Only Ultra users can access
    if (requiredTier === 'ultra') return userTier === 'ultra'
    
    return false
  },

  // Get available content for user tier
  getAvailableContent(userTier: UserTier) {
    switch (userTier) {
      case 'free':
        return {
          gpts: 0,
          documents: 0,
          features: ['Blog access', 'Previews only']
        }
      case 'pro':
        return {
          gpts: 3,
          documents: 2,
          features: ['3 essential GPTs', '2 core playbooks', 'Email support']
        }
      case 'ultra':
        return {
          gpts: 7,
          documents: 4,
          features: ['All GPTs', 'All playbooks', 'Priority support', 'Early access']
        }
    }
  },

  // Get next tier upgrade info
  getUpgradeInfo(currentTier: UserTier) {
    switch (currentTier) {
      case 'free':
        return {
          nextTier: 'pro' as UserTier,
          price: TIER_PRICES.pro,
          benefits: ['Access to 3 essential GPTs', '2 core playbooks']
        }
      case 'pro':
        return {
          nextTier: 'ultra' as UserTier,
          price: TIER_PRICES.ultra,
          benefits: ['Access to all 7 GPTs', 'All 4 playbooks', 'Priority support']
        }
      case 'ultra':
        return null // Already at highest tier
    }
  }
}