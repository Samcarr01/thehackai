-- Add status column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Update existing posts to be published (since they were visible before)
UPDATE blog_posts 
SET status = 'published' 
WHERE status IS NULL;