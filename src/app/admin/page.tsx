'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { userService, type UserProfile } from '@/lib/user'
import { gptsService } from '@/lib/gpts'
import { documentsService } from '@/lib/documents'
import { blogService, type BlogPost } from '@/lib/blog'
import { aiService } from '@/lib/ai'
import DarkThemeBackground from '@/components/DarkThemeBackground'
import NotificationModal from '@/components/NotificationModal'

interface AnalyzedContent {
  title: string
  description: string
  category: string
}

export default function AdminPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'content' | 'blog' | 'settings'>('content')
  const [gpts, setGpts] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [uploadType, setUploadType] = useState<'gpt' | 'document'>('gpt')
  const [gptUrl, setGptUrl] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzedContent, setAnalyzedContent] = useState<AnalyzedContent | null>(null)
  const [uploading, setUploading] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  })

  const router = useRouter()

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ isOpen: true, title, message, type })
  }

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user: authUser, error } = await auth.getUser()
        
        if (error || !authUser) {
          router.push('/login')
          return
        }

        const userProfile = await userService.getProfile(authUser.id)
        if (userProfile) {
          setUser(userProfile)
          
          if (userProfile.email !== 'samcarr1232@gmail.com') {
            router.push('/dashboard')
            return
          }
        }

        await loadContent()
      } catch (err) {
        console.error('Error loading data:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const loadContent = async () => {
    try {
      const [gptsData, documentsData, blogData] = await Promise.all([
        gptsService.getAllGPTs(),
        documentsService.getAllDocuments(),
        blogService.getAllPosts()
      ])
      
      setGpts(gptsData)
      setDocuments(documentsData)
      setBlogPosts(blogData)
    } catch (err) {
      console.error('Error loading content:', err)
    }
  }

  const handleAnalyze = async () => {
    if (!gptUrl && !documentFile) return

    setAnalyzing(true)
    try {
      let analyzed: AnalyzedContent | null = null

      if (uploadType === 'gpt' && gptUrl) {
        analyzed = await aiService.analyzeGPT(gptUrl)
      } else if (uploadType === 'document' && documentFile) {
        analyzed = await aiService.analyzeDocument(documentFile)
      }

      setAnalyzedContent(analyzed)
    } catch (err) {
      console.error('Analysis failed:', err)
      showNotification('Error', 'Analysis failed. Please try again.', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleUpload = async () => {
    if (!analyzedContent) return

    setUploading(true)
    try {
      if (uploadType === 'gpt' && gptUrl) {
        await gptsService.createGPT({
          title: analyzedContent.title,
          description: analyzedContent.description,
          chatgpt_url: gptUrl,
          category: analyzedContent.category,
        })
      } else if (uploadType === 'document' && documentFile) {
        await documentsService.createDocument({
          title: analyzedContent.title,
          description: analyzedContent.description,
          file: documentFile,
          category: analyzedContent.category,
        })
      }

      setGptUrl('')
      setDocumentFile(null)
      setAnalyzedContent(null)
      
      await loadContent()
      showNotification('Success', 'Content uploaded successfully!', 'success')
    } catch (err) {
      console.error('Upload failed:', err)
      showNotification('Error', 'Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleFeature = async (item: any, type: 'gpt' | 'document') => {
    try {
      const newFeaturedStatus = !item.is_featured
      
      if (type === 'gpt') {
        await gptsService.toggleFeature(item.id, newFeaturedStatus)
      } else {
        await documentsService.toggleFeature(item.id, newFeaturedStatus)
      }

      await loadContent()
      const action = newFeaturedStatus ? 'featured' : 'unfeatured'
      showNotification('Success', `"${item.title}" has been ${action}!`, 'success')
    } catch (err) {
      console.error('Toggle feature failed:', err)
      showNotification('Error', 'Failed to update feature status.', 'error')
    }
  }

  const handleDelete = async (item: any, type: 'gpt' | 'document') => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return
    }

    try {
      if (type === 'gpt') {
        await gptsService.deleteGPT(item.id)
      } else {
        await documentsService.deleteDocument(item.id)
      }

      await loadContent()
      showNotification('Success', `"${item.title}" deleted successfully!`, 'success')
    } catch (err) {
      console.error('Delete failed:', err)
      showNotification('Error', 'Delete failed. Please try again.', 'error')
    }
  }

  if (loading) {
    return (
      <DarkThemeBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DarkThemeBackground>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DarkThemeBackground>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                  <p className="text-gray-400">Content Management System</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                🔧 Admin Access
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-white/10 bg-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 overflow-x-auto py-4">
              {[
                { id: 'content', label: 'Content Management', icon: '📚' },
                { id: 'blog', label: 'Blog Posts', icon: '✍️' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeSection === 'content' && (
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <span className="mr-3">📤</span>
                  Upload New Content
                </h2>

                {/* Upload Type Toggle */}
                <div className="flex bg-slate-700 rounded-lg p-1 mb-6 max-w-sm">
                  <button
                    onClick={() => setUploadType('gpt')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      uploadType === 'gpt'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    🤖 GPT
                  </button>
                  <button
                    onClick={() => setUploadType('document')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      uploadType === 'document'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    📄 Document
                  </button>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  {uploadType === 'gpt' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ChatGPT URL
                      </label>
                      <input
                        type="url"
                        value={gptUrl}
                        onChange={(e) => setGptUrl(e.target.value)}
                        placeholder="https://chatgpt.com/g/g-..."
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PDF Document
                      </label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-sm text-gray-300">
                            {documentFile ? documentFile.name : 'Click to upload PDF'}
                          </p>
                        </label>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing || (!gptUrl && !documentFile)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </span>
                    ) : (
                      '🔍 Analyze with AI'
                    )}
                  </button>
                </div>

                {/* Analysis Results */}
                {analyzedContent && (
                  <div className="mt-6 p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Analysis Results</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={analyzedContent.title}
                          onChange={(e) => setAnalyzedContent({ ...analyzedContent, title: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          value={analyzedContent.description}
                          onChange={(e) => setAnalyzedContent({ ...analyzedContent, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select
                          value={analyzedContent.category}
                          onChange={(e) => setAnalyzedContent({ ...analyzedContent, category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Business Planning">Business Planning</option>
                          <option value="Productivity">Productivity</option>
                          <option value="Communication">Communication</option>
                          <option value="Automation">Automation</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Design">Design</option>
                          <option value="Development">Development</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </span>
                      ) : (
                        '🚀 Upload Content'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Content Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* GPTs */}
                <ContentList
                  title="GPTs Collection"
                  icon="🤖"
                  items={gpts}
                  onToggleFeature={(item) => handleToggleFeature(item, 'gpt')}
                  onDelete={(item) => handleDelete(item, 'gpt')}
                />

                {/* Documents */}
                <ContentList
                  title="Playbooks Collection"
                  icon="📚"
                  items={documents}
                  onToggleFeature={(item) => handleToggleFeature(item, 'document')}
                  onDelete={(item) => handleDelete(item, 'document')}
                />
              </div>
            </div>
          )}

          {activeSection === 'blog' && (
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">✍️</span>
                  Blog Posts
                </h2>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                  ➕ New Post
                </button>
              </div>

              {blogPosts.length > 0 ? (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{post.title}</h3>
                          <p className="text-sm text-gray-300 mb-2">{post.meta_description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span>{post.category}</span>
                            <span>•</span>
                            <span>{post.read_time} min read</span>
                            <span>•</span>
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-slate-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✍️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No blog posts yet</h3>
                  <p className="text-gray-400 mb-6">Create your first blog post to get started!</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="mr-3">⚙️</span>
                Admin Settings
              </h2>
              <p className="text-gray-400">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </DarkThemeBackground>
  )
}

// ContentList Component
interface ContentListProps {
  title: string
  icon: string
  items: any[]
  onToggleFeature: (item: any) => void
  onDelete: (item: any) => void
}

function ContentList({ title, icon, items, onToggleFeature, onDelete }: ContentListProps) {
  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="mr-3">{icon}</span>
        {title}
        <span className="ml-2 text-sm text-gray-400">({items.length})</span>
      </h3>

      {items.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white mb-1 truncate">{item.title}</h4>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                    {item.is_featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onToggleFeature(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.is_featured
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-400 hover:text-yellow-400'
                    }`}
                    title={item.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">{icon}</div>
          <p className="text-gray-400">No items yet. Upload your first content!</p>
        </div>
      )}
    </div>
  )
}