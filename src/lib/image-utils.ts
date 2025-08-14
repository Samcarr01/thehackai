// Stable image URL generation for blog posts
export function getBlogImageUrl(imagePath: string): string {
  // Remove any existing Supabase URL prefix if present
  const cleanPath = imagePath.replace(/^.*\/storage\/v1\/object\/public\/blog-images\//, '');
  
  // Return stable public URL without auth context
  return `https://ndhljslogveuhijpifwf.supabase.co/storage/v1/object/public/blog-images/${cleanPath}`;
}

// Extract image URLs from blog content
export function extractImageUrls(content: string): string[] {
  const imageRegex = /!\[.*?\]\((https:\/\/.*?\.(?:png|jpg|jpeg|webp|gif))\)/g;
  const matches = Array.from(content.matchAll(imageRegex));
  return matches.map(match => match[1]);
}