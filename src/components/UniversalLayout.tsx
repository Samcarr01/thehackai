'use client'

import { useEffect, useState } from 'react'
import UniversalMobileSidebar from './UniversalMobileSidebar'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'

interface UniversalLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function UniversalLayout({ children, className = '' }: UniversalLayoutProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: authUser } = await auth.getUser()
        
        if (authUser) {
          setIsAuthenticated(true)
          
          // Get user profile for tier information
          try {
            let profile = await userService.getProfile(authUser.id)
            if (!profile) {
              profile = await userService.createProfile(authUser.id, authUser.email || '')
            }
            setUser(profile)
          } catch (error) {
            console.error('Error fetching user profile:', error)
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Check if user is admin
  const isAdmin = user?.email === 'samcarr1232@gmail.com'

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Universal Mobile Sidebar - Only visible on mobile */}
      <UniversalMobileSidebar 
        userEmail={user?.email}
        userTier={user?.user_tier || 'free'}
        isAuthenticated={isAuthenticated}
        showAdminLink={isAdmin}
      />
      
      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}