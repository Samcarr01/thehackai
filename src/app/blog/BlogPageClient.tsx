'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'
import { blogService, type BlogPost } from '@/lib/blog'
import { useAdmin } from '@/contexts/AdminContext'
import DarkThemeBackground from '@/components/DarkThemeBackground'
import SmartNavigation from '@/components/SmartNavigation'
import { globalNavigation } from '@/lib/navigation'

export default function BlogPageClient() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const { getEffectiveUser } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load blog posts and categories first (always accessible - public content)
        const [posts, blogCategories] = await Promise.all([
          blogService.getAllPosts(true), // Show all posts until status column is added
          blogService.getCategories()
        ])
        
        setBlogPosts(posts)
        setCategories(['All', ...blogCategories])
        
        // Try to get user info (optional - for better UX if logged in)
        try {
          const { user: authUser, error } = await auth.getUser()
          
          if (!error && authUser) {
            // Fetch user profile from our database
            let userProfile = await userService.getProfile(authUser.id)
            
            // If no profile exists, create one (for existing auth users)
            if (!userProfile) {
              userProfile = await userService.createProfile(authUser.id, authUser.email || '')
            }
            
            if (userProfile) {
              setUser(userProfile)
            }
          }
          // If not logged in, that's fine - blog is public
        } catch (authErr) {
          console.log('User not authenticated, showing public blog content')
          // Not an error - blog is public
        }
      } catch (err) {
        console.error('Error loading blog data:', err)
        // Still don't redirect - show what we can
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Get effective user for display (applies global admin toggle)
  const effectiveUser = getEffectiveUser(user)

  // Filter blog posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.meta_description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <DarkThemeBackground className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </DarkThemeBackground>
    )
  }

  // Blog is public - don't block access based on login status

  return (
    <DarkThemeBackground>
      <SmartNavigation 
        user={user} 
        currentPage="blog"
        onFeatureClick={globalNavigation.goToFeatures}
        onPricingClick={globalNavigation.goToPricing}
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12">
        {/* Header Section - Mobile optimized */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white mb-4 sm:mb-6">
            AI Tools & Strategies 🧠
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed px-2">
            {effectiveUser ? (
              "Discover powerful AI tools, proven strategies, and actionable insights to boost your productivity. Explore our latest findings and tutorials."
            ) : (
              "Free insights into AI tools, proven strategies, and actionable tutorials. Learn how to leverage AI effectively in your work. Sign up to access our full collection of GPTs and Playbooks."
            )}
          </p>
        </div>

        {/* Search and Filter Section - Mobile optimized */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100/50">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-gray-800 border border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-100 text-sm sm:text-base"
                  />
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      category === selectedCategory
                        ? 'gradient-purple text-white shadow-lg'
                        : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts or Empty State - Mobile optimized */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-slate-800/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-300">
                        {post.read_time} min read
                      </span>
                    </div>
                    
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors leading-tight">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-100 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                      {post.meta_description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-300 pt-3 sm:pt-4 border-t border-gray-100">
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    <span className="text-purple-600 group-hover:text-purple-700 font-medium">
                      Read →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : blogPosts.length === 0 ? (
          /* Empty state when no posts exist */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">📚</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white mb-4">
              Content Coming Soon!
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-lg mx-auto">
              I'm preparing helpful articles about AI tools, productivity strategies, 
              and actionable guides to help you work smarter with AI.
            </p>
            
            {/* Newsletter Signup */}
            <div className="max-w-md mx-auto">
              <div className="bg-slate-800/80 rounded-2xl p-6 shadow-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Get Notified 🔔
                </h3>
                <p className="text-sm text-gray-100 mb-4">
                  Be the first to read new articles about AI tools and strategies
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="gradient-purple text-white px-6 py-2 rounded-xl font-medium hover:scale-105 transform transition-all duration-200">
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No results for current filter */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white mb-4">
              No articles found
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-lg mx-auto">
              Try adjusting your search terms or selecting a different category.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All')
              }}
              className="gradient-purple text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transform transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                What to Expect 🎯
              </h3>
              <ul className="space-y-3 text-gray-100">
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Step-by-step AI implementation guides</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Real-world case studies and success stories</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Latest AI tools and platform reviews</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Productivity tips and workflow optimization</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Why Subscribe? ⚡
              </h3>
              <ul className="space-y-3 text-gray-100">
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>100% free access to all articles</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>No paywalls or premium content barriers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Weekly insights delivered to your inbox</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Early access to new GPTs and playbooks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DarkThemeBackground>
  )
}