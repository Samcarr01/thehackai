// Simple script to update blog categories via admin endpoint
// Run this in browser console when logged in as admin

async function updateBlogCategories() {
  try {
    console.log('🔄 Starting blog category update...');
    
    const response = await fetch('/api/admin/update-blog-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Include authentication cookies
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Blog categories updated successfully!');
      console.log(`📊 Updated ${result.updated} out of ${result.total} posts`);
      
      if (result.updates && result.updates.length > 0) {
        console.log('\n📝 Category changes:');
        result.updates.forEach(update => {
          console.log(`• "${update.title}"`);
          console.log(`  ${update.oldCategory} → ${update.newCategory}`);
        });
      }
      
      return result;
    } else {
      console.error('❌ Failed to update categories:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating blog categories:', error);
    return null;
  }
}

// List current blog posts and their categories
async function listBlogPosts() {
  try {
    console.log('📋 Fetching current blog posts...');
    
    const response = await fetch('/api/admin/list-blog-posts', {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Found ${result.count} blog posts`);
      console.log('\n📊 Current category distribution:');
      Object.entries(result.categoryDistribution).forEach(([category, count]) => {
        console.log(`• ${category}: ${count} posts`);
      });
      
      console.log('\n📝 All posts:');
      result.posts.forEach(post => {
        console.log(`• "${post.title}" → ${post.category}`);
      });
      
      return result;
    } else {
      console.error('❌ Failed to list posts:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error listing blog posts:', error);
    return null;
  }
}

// Test the categorization logic first
async function testCategorization() {
  try {
    console.log('🧪 Testing categorization logic...');
    
    const response = await fetch('/api/admin/test-blog-categorization', {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Categorization test results:');
      result.tests.forEach(test => {
        console.log(`• "${test.title}" → ${test.predictedCategory}`);
      });
      return result;
    } else {
      console.error('❌ Test failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing categorization:', error);
    return null;
  }
}

console.log('Blog Category Management Tools Available:');
console.log('• listBlogPosts() - Show current blog posts and their categories');
console.log('• testCategorization() - Test the categorization logic');
console.log('• updateBlogCategories() - Update all existing blog posts');
console.log('');
console.log('👉 Run listBlogPosts() first to see current state');
console.log('👉 Run testCategorization() to test the logic');
console.log('👉 Finally run updateBlogCategories() to fix existing posts');