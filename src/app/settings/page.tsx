'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'
import DarkThemeBackground from '@/components/DarkThemeBackground'
import SmartNavigation from '@/components/SmartNavigation'
import { PageLoading, ButtonLoading } from '@/components/LoadingSpinner'
import SubscriptionManagement from '@/components/SubscriptionManagement'

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [error, setError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { user: authUser, error } = await auth.getUser()
        
        if (error || !authUser) {
          router.push('/login')
          return
        }

        let userProfile = await userService.getProfile(authUser.id)
        
        if (!userProfile) {
          userProfile = await userService.createProfile(authUser.id, authUser.email || '')
        }
        
        if (userProfile) {
          setUser(userProfile)
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Error loading user:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
    
    // Listen for auth state changes
    const { supabase } = auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Settings Page: Auth state changed:', event)
      if (event === 'SIGNED_OUT') {
        // User signed out - redirect to login
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - refresh user data
        let userProfile = await userService.getProfile(session.user.id)
        if (!userProfile) {
          userProfile = await userService.createProfile(session.user.id, session.user.email || '')
        }
        if (userProfile) {
          setUser(userProfile)
        }
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordLoading(true)
    setChangePasswordError('')
    setChangePasswordSuccess('')

    // Validation
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters long')
      setChangePasswordLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('New passwords do not match')
      setChangePasswordLoading(false)
      return
    }

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await auth.signIn(user!.email, currentPassword)
      
      if (signInError) {
        setChangePasswordError('Current password is incorrect')
        setChangePasswordLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await auth.updatePassword(newPassword)
      
      if (updateError) {
        setChangePasswordError(updateError.message)
      } else {
        setChangePasswordSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
        setShowChangePassword(false)
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setChangePasswordSuccess('')
        }, 5000)
      }
    } catch (err) {
      setChangePasswordError('An unexpected error occurred')
      console.error('Change password error:', err)
    } finally {
      setChangePasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      // Redirect to homepage with success message
      router.push('/?deleted=true')
    } catch (err) {
      console.error('Delete account error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageLoading text="Loading settings..." />
        <div className="fixed bottom-8 left-0 right-0 text-center z-40">
          <p className="text-gray-400 text-sm">Loading your account settings</p>
        </div>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DarkThemeBackground>
      <SmartNavigation user={user} currentPage="settings" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-100">Manage your account preferences and data</p>
        </div>

        {/* Account Information */}
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-8 border border-purple-100/50">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">Email</label>
              <div className="text-white bg-gray-700 px-4 py-2 rounded-lg">
                {user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">Subscription Status</label>
              <div className="flex items-center space-x-2">
                {user.user_tier === 'free' ? (
                  <span className="bg-gray-600 text-gray-100 px-3 py-1 rounded-full text-sm">
                    Free Account
                  </span>
                ) : user.user_tier === 'pro' ? (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm">
                    Pro Member
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm">
                    Ultra Member
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">Member Since</label>
              <div className="text-white">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-8 border border-purple-100/50">
          <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
          
          {changePasswordSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-green-900/20 border border-green-500/30">
              <p className="text-sm text-green-200">{changePasswordSuccess}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">Password</label>
              <p className="text-gray-300 text-sm mb-3">
                Update your password to keep your account secure
              </p>
              
              {!showChangePassword ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🔐 Change Password
                  </button>
                  <button
                    onClick={() => window.location.href = '/forgot-password'}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    📧 Reset via Email
                  </button>
                </div>
              ) : (
                <div className="space-y-4 bg-gray-800/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-100">Change Password</h3>
                    <button
                      onClick={() => {
                        setShowChangePassword(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmNewPassword('')
                        setChangePasswordError('')
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {changePasswordError && (
                    <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                      <p className="text-sm text-red-200">{changePasswordError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter new password"
                        required
                        minLength={8}
                      />
                      <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm new password"
                        required
                      />
                      {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                        <p className="mt-1 text-xs text-red-200">Passwords do not match</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={changePasswordLoading || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {changePasswordLoading ? (
                          <span className="flex items-center justify-center">
                            <ButtonLoading size="sm" />
                            <span className="ml-2">Updating...</span>
                          </span>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false)
                          setCurrentPassword('')
                          setNewPassword('')
                          setConfirmNewPassword('')
                          setChangePasswordError('')
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="mb-8">
          <SubscriptionManagement 
            user={user} 
            onUpdate={() => {
              // Refresh user data after subscription changes
              window.location.reload()
            }} 
          />
        </div>

        {/* Upgrade Section for Free Users */}
        {user.user_tier === 'free' && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Unlock Premium Features 🚀</h3>
                <p className="text-purple-100">
                  Upgrade to Pro or Ultra to access GPTs, playbooks, and priority support.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.href = '/checkout?tier=pro'}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  Pro - £7/month ✨
                </button>
                <button
                  onClick={() => window.location.href = '/checkout?tier=ultra'}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  Ultra - £19/month 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-red-900/20 rounded-2xl p-6 border border-red-500/30">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          
          {!showDeleteConfirm ? (
            <div>
              <p className="text-gray-100 mb-4">
                Once you delete your account, there is no going back. This action will:
              </p>
              <ul className="list-disc list-inside text-gray-100 mb-6 space-y-1">
                <li>Permanently delete your account and profile</li>
                <li>Cancel any active subscriptions</li>
                <li>Remove all your data from our systems</li>
                <li>This action cannot be undone</li>
              </ul>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div>
              <p className="text-red-400 font-semibold mb-4">
                ⚠️  Are you absolutely sure?
              </p>
              <p className="text-gray-100 mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-800/50 border border-red-600">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <span className="flex items-center">
                      <ButtonLoading size="sm" />
                      <span className="ml-2">Deleting...</span>
                    </span>
                  ) : (
                    <span>Delete My Account</span>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                    setError('')
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DarkThemeBackground>
  )
}