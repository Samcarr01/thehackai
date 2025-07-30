-- CORRECT TIER DISTRIBUTION FIX
-- Based on CLAUDE.md freemium model and user.ts pricing tiers

-- According to user.ts:
-- Free: 0 GPTs, 0 documents (preview only)  
-- Pro: 3 essential GPTs, 2 core playbooks
-- Ultra: All 7 GPTs, All 4 playbooks

-- STEP 1: Set most content to 'ultra' tier (premium)
UPDATE gpts SET required_tier = 'ultra';
UPDATE documents SET required_tier = 'ultra';

-- STEP 2: Set featured/essential content to 'pro' tier
-- Make the most important/featured GPTs accessible to Pro users (3 GPTs)
UPDATE gpts 
SET required_tier = 'pro' 
WHERE is_featured = true 
AND id IN (
  SELECT id FROM gpts 
  WHERE is_featured = true 
  ORDER BY added_date DESC 
  LIMIT 3
);

-- Make the most important/featured documents accessible to Pro users (2 documents)
UPDATE documents 
SET required_tier = 'pro' 
WHERE is_featured = true 
AND id IN (
  SELECT id FROM documents 
  WHERE is_featured = true 
  ORDER BY added_date DESC 
  LIMIT 2
);

-- VERIFICATION: Check the final distribution
SELECT 
  'Final GPTs Distribution' as check_type,
  required_tier,
  COUNT(*) as count
FROM gpts 
GROUP BY required_tier
UNION ALL
SELECT 
  'Final Documents Distribution' as check_type,
  required_tier,
  COUNT(*) as count
FROM documents 
GROUP BY required_tier
ORDER BY check_type, required_tier;