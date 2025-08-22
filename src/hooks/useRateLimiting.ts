import { useState } from 'react';

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
}

// Simple in-memory rate limiting for client-side
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

export const useRateLimiting = () => {
  const checkRateLimit = async (
    identifier: string, 
    maxRequests: number = 10,
    windowMinutes: number = 15
  ): Promise<RateLimitResult> => {
    try {
      const now = Date.now();
      const windowMs = windowMinutes * 60 * 1000;
      const windowStart = Math.floor(now / windowMs) * windowMs;
      
      const existing = rateLimitStore.get(identifier);
      
      if (!existing || existing.windowStart !== windowStart) {
        rateLimitStore.set(identifier, { count: 1, windowStart });
        return { allowed: true, remaining: maxRequests - 1 };
      }
      
      if (existing.count >= maxRequests) {
        return { 
          allowed: false, 
          remaining: 0,
          resetTime: new Date(windowStart + windowMs)
        };
      }
      
      existing.count++;
      rateLimitStore.set(identifier, existing);
      
      return { allowed: true, remaining: maxRequests - existing.count };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open for availability
      return { allowed: true };
    }
  };

  const checkAuthRateLimit = async (email?: string): Promise<boolean> => {
    const identifier = email || 'anonymous';
    const result = await checkRateLimit(identifier, 5, 15); // 5 attempts per 15 minutes
    return result.allowed;
  };

  const clearRateLimit = (identifier: string) => {
    rateLimitStore.delete(identifier);
  };

  return {
    checkRateLimit,
    checkAuthRateLimit,
    clearRateLimit
  };
};