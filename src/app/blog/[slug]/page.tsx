import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogService } from '@/lib/blog'
import BlogPostClient from './BlogPostClient'
import { createClient } from '@/lib/supabase/server'
import { userService } from '@/lib/user'

interface Props {
  params: { slug: string }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await blogService.getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await blogService.getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found - thehackai',
      description: 'The blog post you are looking for could not be found.',
    }
  }

  // Extract first image from content for Open Graph
  const imageMatch = post.content.match(/!\[.*?\]\((.*?)\)/)
  const ogImage = imageMatch ? imageMatch[1] : '/images/blog-default.jpg'

  return {
    title: `${post.title} - thehackai Blog`,
    description: post.meta_description || `Read about ${post.title} on the thehackai blog. Expert insights on AI tools and productivity.`,
    keywords: `${post.category}, AI tools, productivity, ${post.title.toLowerCase()}`,
    authors: [{ name: 'thehackai Team' }],
    openGraph: {
      title: post.title,
      description: post.meta_description || `Read about ${post.title} on the thehackai blog.`,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: ['thehackai Team'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description || `Read about ${post.title} on the thehackai blog.`,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://thehackai.com/blog/${params.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await blogService.getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Get current user for navigation
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  let userProfile = null
  if (authUser) {
    userProfile = await userService.getProfile(authUser.id)
  }

  // Generate structured data for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'thehackai',
      url: 'https://thehackai.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'thehackai',
      url: 'https://thehackai.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thehackai.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://thehackai.com/blog/${params.slug}`,
    },
    wordCount: post.content.split(' ').length,
    articleSection: post.category,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient post={post} user={userProfile} />
    </>
  )
}