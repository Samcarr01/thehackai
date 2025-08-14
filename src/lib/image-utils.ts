// Stable image URL generation for blog posts
export function getBlogImageUrl(imagePath: string): string {
  // If it's already a complete Supabase Storage URL, return as-is
  if (imagePath.includes('supabase.co/storage/v1/object/public/blog-images/')) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  const cleanPath = imagePath.replace(/^\//, ''); // Remove leading slash if present
  return `https://ndhljslogveuhijpifwf.supabase.co/storage/v1/object/public/blog-images/${cleanPath}`;
}

// Extract image URLs from blog content
export function extractImageUrls(content: string): string[] {
  const imageRegex = /!\[.*?\]\((https:\/\/.*?\.(?:png|jpg|jpeg|webp|gif))\)/g;
  const matches = Array.from(content.matchAll(imageRegex));
  return matches.map(match => match[1]);
}