-- Check current tier assignments in database
-- This will show us what's wrong with the current data

-- Check all GPTs and their tiers
SELECT 
  title,
  required_tier,
  is_featured,
  category,
  added_date
FROM gpts 
ORDER BY is_featured DESC, added_date DESC;

-- Check all Documents and their tiers  
SELECT 
  title,
  required_tier,
  is_featured,
  category,
  added_date
FROM documents 
ORDER BY is_featured DESC, added_date DESC;

-- Summary counts
SELECT 
  'GPTs' as content_type,
  required_tier,
  COUNT(*) as count
FROM gpts 
GROUP BY required_tier
UNION ALL
SELECT 
  'Documents' as content_type,
  required_tier,
  COUNT(*) as count
FROM documents 
GROUP BY required_tier
ORDER BY content_type, required_tier;