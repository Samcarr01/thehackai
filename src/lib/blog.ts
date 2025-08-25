import { createClient } from './supabase/client'

export interface BlogPost {
  id: string
  title: string
  content: string
  slug: string
  published_at: string
  meta_description: string
  category: string
  read_time: number
  status?: 'draft' | 'published' // Optional for now
  created_at: string
  updated_at: string
  generated_images?: Array<{
    url: string
    prompt: string
    description: string
    placement: string
    original_dalle_url?: string
  }>
}

export const blogService = {
  async getAllPosts(includesDrafts = false): Promise<BlogPost[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }

    // Add default status to existing posts
    return (data || []).map(post => ({
      ...post,
      status: post.status || 'published'
    }))
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    return this.getAllPosts(false)
  },

  async getDraftPosts(): Promise<BlogPost[]> {
    // Temporarily return empty array until status column is added
    return []
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return null
    }

    return data
  },

  async getCategories(): Promise<string[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .order('category')

    if (error) {
      console.error('Error fetching blog categories:', error)
      return []
    }

    const categories = data?.map(item => item.category) || []
    return Array.from(new Set(categories))
  },

  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
    // Log the post data being saved
    console.log('Creating blog post with data:', {
      title: post.title,
      slug: post.slug,
      category: post.category,
      fieldsPresent: Object.keys(post),
      contentLength: post.content?.length || 0
    })
    
    try {
      // Use admin API route for blog post creation to bypass RLS
      const response = await fetch('/api/admin/create-blog-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Blog API creation failed:', errorData)
        throw new Error(errorData.error || 'Blog post creation failed')
      }

      const result = await response.json()
      console.log('✅ Blog post created successfully via API:', result.post?.id)
      return result.post

    } catch (err) {
      console.error('Exception creating blog post:', err)
      throw err // Re-throw to catch in UI
    }
  },

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return null
    }

    return data
  },

  async deletePost(id: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return false
    }

    return true
  }
}