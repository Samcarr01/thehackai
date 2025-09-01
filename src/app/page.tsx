'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'
import { contentStatsService, type ContentStats } from '@/lib/content-stats'
import GradientBackground from '@/components/NetworkBackground'
import { globalNavigation } from '@/lib/navigation'
import DarkThemeBackground from '@/components/DarkThemeBackground'
import ScrollAnimation from '@/components/ScrollAnimation'
import AnimatedCounter from '@/components/AnimatedCounter'
import TypewriterText from '@/components/TypewriterText'
import PromptRefinerDemo from '@/components/PromptRefinerDemo'
import PlaybookFlipDemo from '@/components/PlaybookFlipDemo'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'

function HomePageContent() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [contentStats, setContentStats] = useState<ContentStats | null>(null)
  const [showDeletedMessage, setShowDeletedMessage] = useState(false)
  const searchParams = useSearchParams()
  
  // Check for account deletion success message
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShowDeletedMessage(true)
      // Hide message after 5 seconds
      setTimeout(() => setShowDeletedMessage(false), 5000)
    }
  }, [searchParams])

  // Handle scrolling to anchor sections when page loads
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Wait a moment for page to fully load, then scroll with header offset
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1))
        if (element) {
          const headerOffset = 80 // Account for mobile header height
          const elementPosition = element.offsetTop - headerOffset
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          })
        }
      }, 300) // Increased delay to ensure full page load
    }
  }, [])

  // Check authentication status and get user profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: authUser } = await auth.getUser()
        if (authUser) {
          // Get user profile for Pro status
          let userProfile = await userService.getProfile(authUser.id)
          if (!userProfile) {
            const firstName = authUser.user_metadata?.first_name || ''
            const lastName = authUser.user_metadata?.last_name || ''
            userProfile = await userService.createProfile(authUser.id, authUser.email || '', firstName, lastName)
          }
          setUser(userProfile)
          console.log('Homepage: User authenticated:', userProfile?.email, userProfile?.user_tier)
        } else {
          setUser(null)
          console.log('Homepage: No authenticated user')
        }
        
        // Load content stats
        const stats = await contentStatsService.getContentStats('free')
        setContentStats(stats)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  const handleFeatureClick = globalNavigation.goToFeatures
  const handlePricingClick = globalNavigation.goToPricing

  return (
    <DarkThemeBackground>
      {/* Animated Background */}
      <GradientBackground />
      
      {/* Smart Navigation */}
      <SmartNavigation 
        user={user} 
        onFeatureClick={handleFeatureClick}
        onPricingClick={handlePricingClick}
      />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollAnimation animation="fade-up">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-full bg-purple-500/20 border border-purple-500/30">
            <span className="text-purple-300 text-sm font-medium">Battle-tested AI Playbooks & GPTs</span>
          </div>
          
          <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight text-center min-h-[60px] sm:min-h-[70px] md:min-h-[80px] lg:min-h-[90px] xl:min-h-[100px] flex items-center justify-center px-1">
            <>
              {/* Mobile text - shorter to prevent line breaks */}
              <div className="sm:hidden">
                <TypewriterText 
                  texts={[
                    "Battle-tested AI tools",
                    "Make AI smarter now", 
                    "Skip trial and error"
                  ]}
                  className="inline-block"
                />
              </div>
              {/* Desktop text - full length */}
              <div className="hidden sm:block">
                <TypewriterText 
                  texts={[
                    "Battle-tested AI workflows",
                    "Make any AI smarter instantly", 
                    "Skip months of trial and error"
                  ]}
                  className="inline-block"
                />
              </div>
            </>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Skip months of trial and error. Access my personal collection 
            of proven GPTs and PDF playbooks you can upload directly to any LLM as knowledge. Choose from 
            <span className="text-purple-400 font-medium">Pro (£7/month)</span> or <span className="text-pink-400 font-medium">Ultra (£19/month)</span> — with free preview access.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold button-hover shadow-xl flex items-center justify-center space-x-2 w-full sm:w-auto mobile-touch-target touch-feedback"
            >
              <span>Create Free Account</span>
              <span className="text-xl">🚀</span>
            </Link>
            <Link 
              href="/solutions"
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto mobile-touch-target touch-feedback"
            >
              <span>View Solutions</span>
              <span className="text-xl">🎯</span>
            </Link>
          </div>
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>🆓</span>
              <span>Free account required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Instant access</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Upgrade anytime</span>
            </div>
          </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                What&apos;s Inside thehackai 🚀
              </h2>
              <p className="text-xl text-gray-300">
                Create your free account to explore and upgrade anytime for full access
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature Card 1 */}
            <ScrollAnimation animation="fade-up" delay={100}>
              <div className="group bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 relative overflow-hidden h-full flex flex-col touch-feedback">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl animate-pulse transition-all duration-300">🤖</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">
                Proven GPTs
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow mobile-readable">
                Specialized ChatGPT tools for business planning, productivity, and automation. Direct links to working GPTs.
              </p>
              <div className="text-sm sm:text-base text-purple-400 font-medium flex items-center space-x-2 mt-auto">
                <span><AnimatedCounter end={contentStats?.totalGPTs || 7} /> GPTs available</span>
                <span className="text-xl animate-pulse">→</span>
              </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Feature Card 2 */}
            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="group bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 relative overflow-hidden h-full flex flex-col touch-feedback">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl animate-pulse transition-all duration-300">📚</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">
                AI Playbooks
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow mobile-readable">
                Step-by-step PDF guides perfect for uploading to any LLM as knowledge. Upload these directly to ChatGPT, Claude, Gemini, or any AI to give it instant expertise in specific areas.
              </p>
              <div className="text-sm sm:text-base text-purple-400 font-medium flex items-center space-x-2 mt-auto">
                <span>{contentStats?.totalPlaybooks || 10} playbooks available</span>
                <span className="text-xl">→</span>
              </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Feature Card 3 */}
            <ScrollAnimation animation="fade-up" delay={300}>
              <div className="group bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 relative overflow-hidden h-full flex flex-col touch-feedback">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl animate-pulse transition-all duration-300">🎯</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">
                Regular Updates
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 flex-grow mobile-readable">
                New GPTs and playbooks added as I discover and test them. Quality over quantity approach.
              </p>
              <div className="text-sm sm:text-base text-purple-400 font-medium flex items-center space-x-2 mt-auto">
                <span>Continuous updates</span>
                <span className="text-xl">→</span>
              </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                See What You Get 🎯
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-2 sm:px-0">
                Experience the quality of our GPTs and playbooks
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Side - PromptRefiner Demo */}
            <ScrollAnimation animation="slide-left" delay={100}>
              <div className="h-auto min-h-[300px] md:min-h-[350px] lg:h-[400px]">
                <PromptRefinerDemo />
              </div>
            </ScrollAnimation>

            {/* Right Side - Playbook Flip Demo */}
            <ScrollAnimation animation="slide-right" delay={200}>
              <div className="h-auto min-h-[300px] md:min-h-[350px] lg:h-[400px]">
                <PlaybookFlipDemo />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <ScrollAnimation animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Choose Your AI Mastery Level 🚀
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 px-2 sm:px-0">
              Battle-tested AI playbooks and GPTs that actually work. Make any AI smarter at what you need.
            </p>
          </ScrollAnimation>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto pt-4">
            {/* Free Preview */}
            <ScrollAnimation animation="slide-left" delay={100}>
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-600/50 hover:border-gray-500/50 transform hover:scale-105 hover:-translate-y-2 hover:-rotate-1 relative overflow-hidden h-full flex flex-col touch-feedback mt-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Free Preview</h3>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-300 mb-4">£0</div>
                  <ul className="text-left space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300 flex-grow">
                    <li className="flex items-center space-x-3">
                      <span className="text-green-400">✓</span>
                      <span>Browse all GPTs and playbooks</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-green-400">✓</span>
                      <span>Preview descriptions</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-green-400">✓</span>
                      <span>Access to blog content</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-green-400">✓</span>
                      <span>Explore what's inside</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollAnimation>
            
            {/* Pro Tier */}
            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl text-white transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-visible h-full flex flex-col touch-feedback border-2 border-purple-300 mt-4">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-semibold shadow-md">Most Popular</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Pro - Daily AI Use</h3>
                  <div className="text-3xl sm:text-4xl font-bold mb-4">£<AnimatedCounter end={7} duration={2500} className="inline" /><span className="text-lg sm:text-xl">/month</span></div>
                  <ul className="text-left space-y-2 sm:space-y-3 text-sm sm:text-base flex-grow">
                    <li className="flex items-center space-x-3">
                      <span className="text-purple-200">✓</span>
                      <span>{contentStats?.proAccessibleGPTs || 3} essential GPTs for daily productivity</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-purple-200">✓</span>
                      <span>{contentStats?.proAccessibleDocuments || 2} core playbooks for any LLM</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-purple-200">✓</span>
                      <span>Email support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-purple-200">✓</span>
                      <span>Perfect for getting started</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollAnimation>
            
            {/* Ultra Tier */}
            <ScrollAnimation animation="slide-right" delay={300}>
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl text-white transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 relative overflow-visible h-full flex flex-col touch-feedback mt-4">
                {/* Traveling light segment around border */}
                <div className="absolute -inset-1 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: `conic-gradient(from 0deg, transparent 0%, transparent 85%, #ff69b4 90%, #8b5cf6 95%, transparent 100%)`,
                    animation: 'spin 3s linear infinite'
                  }}></div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 z-10"></div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-white text-pink-700 px-3 py-1 rounded-full text-xs font-semibold shadow-md">Best Value</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Ultra - Upscale Your AI Game</h3>
                  <div className="text-3xl sm:text-4xl font-bold mb-4">£<AnimatedCounter end={19} duration={2500} className="inline" /><span className="text-lg sm:text-xl">/month</span></div>
                  <ul className="text-left space-y-2 sm:space-y-3 text-sm sm:text-base flex-grow">
                    <li className="flex items-center space-x-3">
                      <span className="text-pink-300">✓</span>
                      <span>All {contentStats?.totalGPTs || 7} GPTs for complete AI mastery</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-pink-300">✓</span>
                      <span>All {contentStats?.totalPlaybooks || 10} playbooks for expert knowledge</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-pink-300">✓</span>
                      <span>Priority support + early access</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="text-pink-300">✓</span>
                      <span>For serious AI power users</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <ScrollAnimation animation="scale" delay={100}>
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden touch-feedback">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Hack Your AI? 🔓
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8 px-2 sm:px-0">
            Make any AI smarter at what you need with our battle-tested playbooks and GPTs. Create your free account to explore!
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center space-x-2 bg-white text-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold hover:scale-105 transform transition-all duration-300 shadow-lg mobile-touch-target touch-feedback"
          >
            <span>Create Free Account</span>
            <span className="text-xl">🚀</span>
          </Link>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Footer */}
      <Footer />
    </DarkThemeBackground>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}