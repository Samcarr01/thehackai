import { createClient } from './supabase/client'

// Expose supabase client for auth state listening
const supabase = createClient()

export const auth = {
  supabase,
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
        }
      },
    })
    
    return { data, error }
  },

  async signIn(email: string, password: string, rememberMe: boolean = false) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Handle session persistence based on rememberMe
    if (data.session && rememberMe) {
      // Store user preference for longer session
      localStorage.setItem('supabase-auth-persist', 'true')
    } else {
      // Clear persistence preference for session-only auth
      localStorage.removeItem('supabase-auth-persist')
    }
    
    return { data, error }
  },

  async signOut() {
    const supabase = createClient()
    
    // Clear all auth-related localStorage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase-auth-persist')
      localStorage.removeItem('rememberMe')
      
      // Clear all supabase auth keys (they start with 'sb-')
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
    }
    
    const { error } = await supabase.auth.signOut()
    
    return { error }
  },

  // Clear all auth data in case of token issues
  async clearAuthData() {
    console.log('🧹 Clearing all auth data...')
    
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('supabase-auth-persist')
      localStorage.removeItem('rememberMe')
      
      // Clear all supabase auth keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key)
        }
      })
    }
    
    // Sign out from Supabase
    const supabase = createClient()
    await supabase.auth.signOut()
    
    console.log('✅ Auth data cleared')
  },

  async resetPassword(email: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    return { data, error }
  },

  async updatePassword(password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    
    return { data, error }
  },

  async signInWithGoogle() {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    return { data, error }
  },

  async getUser() {
    const supabase = createClient()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      // If we get a refresh token error, clear the session
      if (error && (error.message?.includes('Refresh Token') || error.message?.includes('Invalid Refresh'))) {
        console.log('🔄 Auth: Invalid refresh token detected, clearing session...')
        await this.signOut()
        return { user: null, error }
      }
      
      return { user, error }
    } catch (err: any) {
      console.error('❌ Auth: Error getting user:', err)
      return { user: null, error: err }
    }
  },

  async getSession() {
    const supabase = createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    return { session, error }
  },

  async refreshSession() {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.refreshSession()
    
    return { data, error }
  },

}