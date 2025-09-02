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
      <div className="relative min-h-screen">
        <PageLoading text="Redirecting to pricing..." />
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-500 text-sm">Taking you to our pricing plans</p>
        </div>
      </div>
    </DarkThemeBackground>
  )
}