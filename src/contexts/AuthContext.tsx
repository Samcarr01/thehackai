'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { UserProfile, userService } from '@/lib/user'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache for user profile to prevent excessive database calls
let profileCache: { profile: UserProfile | null; timestamp: number } | null = null
const PROFILE_CACHE_TTL = 15 * 60 * 1000 // 15 minutes - extended cache for better performance

// In-memory session cache to reduce auth checks
let sessionCache: { user: User | null; timestamp: number } | null = null
const SESSION_CACHE_TTL = 5 * 60 * 1000 // 5 minutes session cache

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Optimized profile fetching with caching
  const fetchProfile = useCallback(async (userId: string) => {
    // Check cache first
    const now = Date.now()
    if (profileCache && profileCache.timestamp + PROFILE_CACHE_TTL > now) {
      console.log('🚀 Auth: Using cached profile')
      setProfile(profileCache.profile)
      return profileCache.profile
    }

    try {
      console.log('🔄 Auth: Fetching fresh profile')
      const fetchedProfile = await userService.getProfile(userId)
      
      // Update cache
      profileCache = {
        profile: fetchedProfile,
        timestamp: now
      }
      
      setProfile(fetchedProfile)
      return fetchedProfile
    } catch (err) {
      console.error('❌ Auth: Profile fetch error:', err)
      setError('Failed to load user profile')
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Clear cache to force refresh
      profileCache = null
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      profileCache = null // Clear cache
    } catch (err) {
      console.error('❌ Auth: Sign out error:', err)
      setError('Failed to sign out')
    }
  }, [])

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true

    // Get initial session with caching
    const initializeAuth = async () => {
      try {
        // Check session cache first
        const now = Date.now()
        if (sessionCache && sessionCache.timestamp + SESSION_CACHE_TTL > now) {
          console.log('🚀 Auth: Using cached session')
          if (sessionCache.user && mounted) {
            setUser(sessionCache.user)
            await fetchProfile(sessionCache.user.id)
          }
          if (mounted) {
            setLoading(false)
          }
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Auth: Session error:', error)
          setError(error.message)
        } else if (session?.user && mounted) {
          console.log('✅ Auth: Initial session found')
          // Update session cache
          sessionCache = {
            user: session.user,
            timestamp: now
          }
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          // Cache null user as well
          sessionCache = {
            user: null,
            timestamp: now
          }
        }
      } catch (err) {
        console.error('❌ Auth: Initialization error:', err)
        setError('Authentication initialization failed')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 Auth: State change:', event)
        
        setError(null) // Clear previous errors
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          profileCache = null // Clear cache on sign out
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}