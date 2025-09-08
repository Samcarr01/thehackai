'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type AdminViewMode = 'admin' | 'free' | 'pro' | 'ultra'

interface AdminContextType {
  adminViewMode: AdminViewMode
  setAdminViewMode: (mode: AdminViewMode) => void
  getEffectiveUser: (user: any) => any
  isHydrated: boolean
  resetToAdmin: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminViewMode, setAdminViewModeState] = useState<AdminViewMode>('admin')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Load admin view mode preference from localStorage after hydration
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('adminViewMode') as AdminViewMode
      console.log('AdminContext: Loading from localStorage:', savedMode)
      if (savedMode && ['admin', 'free', 'pro', 'ultra'].includes(savedMode)) {
        console.log('AdminContext: Setting admin view mode to:', savedMode)
        setAdminViewModeState(savedMode)
      } else {
        // If no valid saved mode, default to 'admin' and clear localStorage
        console.log('AdminContext: No valid saved mode, defaulting to admin')
        localStorage.removeItem('adminViewMode')
        setAdminViewModeState('admin')
      }
      setIsHydrated(true)
    }
  }, [])

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'adminViewMode' && e.newValue) {
          const newMode = e.newValue as AdminViewMode
          if (['admin', 'free', 'pro', 'ultra'].includes(newMode)) {
            setAdminViewModeState(newMode)
          }
        }
      }

      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const setAdminViewMode = (mode: AdminViewMode) => {
    console.log('AdminContext: Changing admin view mode from', adminViewMode, 'to', mode)
    setAdminViewModeState(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminViewMode', mode)
    }
  }

  const resetToAdmin = () => {
    console.log('AdminContext: Resetting to admin mode for tier testing')
    setAdminViewModeState('admin')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminViewMode')
    }
  }

  const getEffectiveUser = (user: any) => {
    // Only apply toggle for admin user
    if (user && user.email === 'samcarr1232@gmail.com' && adminViewMode !== 'admin') {
      // Simulate different user tiers
      if (adminViewMode === 'free') {
        return { 
          ...user, 
          is_pro: false, 
          user_tier: 'free', 
          email: 'test-free@example.com' 
        }
      } else if (adminViewMode === 'pro') {
        return { 
          ...user, 
          is_pro: true, 
          user_tier: 'pro', 
          email: 'test-pro@example.com' 
        }
      } else if (adminViewMode === 'ultra') {
        return { 
          ...user, 
          is_pro: true, 
          user_tier: 'ultra', 
          email: 'test-ultra@example.com' 
        }
      }
    }
    return user
  }

  return (
    <AdminContext.Provider value={{ adminViewMode, setAdminViewMode, getEffectiveUser, isHydrated, resetToAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}