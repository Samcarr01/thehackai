/**
 * Performance tests for user profile operations
 * Target: Profile fetch under 500ms with proper deduplication
 */

import { userService } from '../user'
import { createClient } from '../supabase/client'

// Mock Supabase client to prevent actual DB calls during tests
jest.mock('../supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('User Profile Performance', () => {
  let mockSupabase: any
  
  beforeEach(() => {
    // Reset mocks and clear cache
    jest.clearAllMocks()
    
    // Clear internal caches
    const profileCache = (userService as any).profileCache || new Map()
    profileCache.clear()
    const dbCallQueue = (userService as any).dbCallQueue || new Map()
    dbCallQueue.clear()
    
    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      abortSignal: jest.fn().mockReturnThis()
    }
    
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('should fetch profile in under 500ms', async () => {
    // Mock fast DB response
    mockSupabase.abortSignal.mockResolvedValue({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_tier: 'free',
        is_pro: false,
        created_at: '2025-01-01T00:00:00Z'
      },
      error: null
    })
    
    const startTime = Date.now()
    const profile = await userService.getProfile('test-user-id')
    const duration = Date.now() - startTime
    
    expect(duration).toBeLessThan(500)
    expect(profile).toBeDefined()
    expect(profile?.id).toBe('test-user-id')
  })
  
  it('should dedupe concurrent profile requests', async () => {
    let callCount = 0
    
    // Mock DB response with delay to simulate real conditions
    mockSupabase.abortSignal.mockImplementation(() => {
      callCount++
      return new Promise(resolve => {
        setTimeout(() => resolve({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_tier: 'free',
            is_pro: false,
            created_at: '2025-01-01T00:00:00Z'
          },
          error: null
        }), 100) // 100ms delay
      })
    })
    
    const userId = 'test-user-id'
    
    // Fire multiple concurrent requests
    const [result1, result2, result3] = await Promise.all([
      userService.getProfile(userId),
      userService.getProfile(userId),
      userService.getProfile(userId)
    ])
    
    // Should only make one DB call due to deduplication
    expect(callCount).toBe(1)
    
    // All results should be identical
    expect(result1).toEqual(result2)
    expect(result2).toEqual(result3)
    expect(result1?.id).toBe(userId)
  })
  
  it('should handle timeout gracefully with AbortController', async () => {
    // Mock timeout scenario
    mockSupabase.abortSignal.mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    
    const startTime = Date.now()
    const profile = await userService.getProfile('timeout-user-id')
    const duration = Date.now() - startTime
    
    // Should return null on timeout without hanging
    expect(profile).toBeNull()
    expect(duration).toBeLessThan(6000) // Should timeout around 5s
  })
  
  it('should use cached profile on subsequent calls', async () => {
    // Mock successful first call
    mockSupabase.abortSignal.mockResolvedValueOnce({
      data: {
        id: 'cached-user-id',
        email: 'cached@example.com',
        user_tier: 'pro',
        is_pro: true,
        created_at: '2025-01-01T00:00:00Z'
      },
      error: null
    })
    
    const userId = 'cached-user-id'
    
    // First call - should hit DB
    const profile1 = await userService.getProfile(userId)
    expect(mockSupabase.abortSignal).toHaveBeenCalledTimes(1)
    
    // Second call - should use cache
    const profile2 = await userService.getProfile(userId)
    expect(mockSupabase.abortSignal).toHaveBeenCalledTimes(1) // No additional call
    
    expect(profile1).toEqual(profile2)
    expect(profile2?.user_tier).toBe('pro')
  })
  
  it('should optimize query with single() call', () => {
    // Trigger a profile fetch
    userService.getProfile('optimize-test-id')
    
    // Verify the query chain uses .single() for RLS optimization
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
    expect(mockSupabase.select).toHaveBeenCalledWith('*')
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'optimize-test-id')
    expect(mockSupabase.single).toHaveBeenCalled()
    expect(mockSupabase.abortSignal).toHaveBeenCalled()
  })
})