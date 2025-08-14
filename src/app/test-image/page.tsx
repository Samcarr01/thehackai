'use client'

export default function TestImagePage() {
  const imageUrl = "https://ndhljslogveuhijpifwf.supabase.co/storage/v1/object/public/blog-images/images/what-is-claude-code-key-features-and-why-it-stands-1-1754343989494.png"
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-8">Image Loading Test</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl mb-4">Test 1: Direct img tag (no attributes)</h2>
          <img src={imageUrl} alt="Test image 1" />
        </div>
        
        <div>
          <h2 className="text-xl mb-4">Test 2: img tag with crossOrigin</h2>
          <img src={imageUrl} alt="Test image 2" crossOrigin="anonymous" />
        </div>
        
        <div>
          <h2 className="text-xl mb-4">Test 3: img tag with loading lazy</h2>
          <img src={imageUrl} alt="Test image 3" loading="lazy" />
        </div>
        
        <div>
          <h2 className="text-xl mb-4">Test 4: img tag with all attributes</h2>
          <img 
            src={imageUrl} 
            alt="Test image 4" 
            loading="lazy" 
            crossOrigin="anonymous"
            style={{ aspectRatio: '16/9' }}
            width={800}
            height={450}
          />
        </div>
        
        <div>
          <h2 className="text-xl mb-4">Test 5: CSS background image</h2>
          <div 
            style={{ 
              backgroundImage: `url("${imageUrl}")`,
              backgroundSize: 'cover',
              width: '800px',
              height: '450px',
              border: '2px solid white'
            }}
          />
        </div>
        
        <div>
          <h2 className="text-xl mb-4">URL being tested:</h2>
          <code className="bg-gray-800 p-2 block break-all text-sm">{imageUrl}</code>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          console.log('🔍 Image Test Page Loaded');
          window.addEventListener('error', (e) => {
            console.error('🚨 Global Error:', e);
          }, true);
          
          document.querySelectorAll('img').forEach((img, index) => {
            img.addEventListener('load', () => {
              console.log('✅ Image ' + (index + 1) + ' loaded successfully');
            });
            img.addEventListener('error', (e) => {
              console.error('🚨 Image ' + (index + 1) + ' failed to load:', e);
            });
          });
        `
      }} />
    </div>
  )
}