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
    <>
      <PageLoading text="Redirecting to pricing..." />
      <div className="fixed bottom-8 left-0 right-0 text-center z-40">
        <p className="text-gray-400 text-sm">Taking you to our pricing plans</p>
      </div>
    </>
  )
}