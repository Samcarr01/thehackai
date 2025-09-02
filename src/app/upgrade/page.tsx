'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DarkThemeBackground from '@/components/DarkThemeBackground'
import { PageLoading } from '@/components/LoadingSpinner'

export default function UpgradePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new pricing page
    router.replace('/pricing')
  }, [router])

  return (
    <DarkThemeBackground>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <PageLoading text="Redirecting to pricing..." />
          <p className="text-gray-500 text-sm mt-4">Taking you to our pricing plans</p>
        </div>
      </div>
    </DarkThemeBackground>
  )
}