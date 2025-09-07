import fetch from 'node-fetch';
import { InvalidTokenError } from './errors';

// Cache for JWKS keys
const jwksCache = new Map<string, any>();
const JWKS_CACHE_TTL = 300000; // 5 minutes

/**
 * Get JWKS from remote URL with caching
 */
export async function getJWKS(jwksUri: string): Promise<any> {
  const cacheKey = jwksUri;
  const cached = jwksCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < JWKS_CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const response = await fetch(jwksUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    
    const jwks = await response.json();
    jwksCache.set(cacheKey, { data: jwks, timestamp: Date.now() });
    return jwks;
  } catch (error) {
    throw new Error(`Failed to fetch JWKS from ${jwksUri}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Clear JWKS cache
 */
export function clearJWKSCache(): void {
  jwksCache.clear();
}

/**
 * Get JWKS cache stats
 */
export function getJWKSCacheStats(): { size: number; entries: string[] } {
  return {
    size: jwksCache.size,
    entries: Array.from(jwksCache.keys())
  };
}

/**
 * Validate key for algorithm
 */
export function validateKeyForAlgorithm(key: string | Buffer, algorithm: string): void {
  if (!key) {
    throw new InvalidTokenError('Key is required');
  }

  const keyString = key.toString();
  
  // Basic key length validation
  if (algorithm.startsWith('HS')) {
    if (keyString.length < 32) {
      throw new InvalidTokenError('HMAC key should be at least 32 characters for security');
    }
  }
  
  if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
    if (!keyString.includes('-----BEGIN') && !keyString.includes('-----END')) {
      throw new InvalidTokenError('RSA/ECDSA keys should be in PEM format');
    }
  }
}