import * as jose from 'jose';
import fetch from 'node-fetch';

// Custom error types for better error handling
export class TokenExpiredError extends Error {
  name = 'TokenExpiredError';
  constructor(message: string) {
    super(message);
  }
}

export class InvalidSignatureError extends Error {
  name = 'InvalidSignatureError';
  constructor(message: string) {
    super(message);
  }
}

export class InvalidTokenError extends Error {
  name = 'InvalidTokenError';
  constructor(message: string) {
    super(message);
  }
}

// Supported secure algorithms (no 'none' algorithm)
export type SecureAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'EdDSA';

export interface SignOptions {
  secret: string | Buffer;
  alg: SecureAlgorithm;
  expiresIn?: string | number;
  notBefore?: string | number;
  audience?: string;
  issuer?: string;
  subject?: string;
}

export interface VerifyOptions {
  secret?: string | Buffer;
  alg?: SecureAlgorithm;
  jwksUri?: string;
  audience?: string;
  issuer?: string;
  clockTolerance?: number;
}

export interface JWTPayload {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

// Cache for JWKS keys
const jwksCache = new Map<string, any>();
const JWKS_CACHE_TTL = 300000; // 5 minutes

async function getJWKS(jwksUri: string): Promise<any> {
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
    throw new Error(`Failed to fetch JWKS from ${jwksUri}: ${error.message}`);
  }
}

/**
 * Sign a JWT token with secure defaults
 */
export async function signJWT(payload: JWTPayload, options: SignOptions): Promise<string> {
  // Validate algorithm (no 'none' allowed)
  const secureAlgorithms: SecureAlgorithm[] = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'EdDSA'];
  if (!secureAlgorithms.includes(options.alg)) {
    throw new Error(`Insecure algorithm: ${options.alg}. Only secure algorithms are allowed.`);
  }

  try {
    const secret = new TextEncoder().encode(options.secret.toString());
    
    // Create JWT with secure defaults
    const jwt = new jose.SignJWT(payload)
      .setProtectedHeader({ alg: options.alg })
      .setIssuedAt();

    // Set expiration (default to 1 hour if not specified)
    if (options.expiresIn) {
      if (typeof options.expiresIn === 'string') {
        jwt.setExpirationTime(options.expiresIn);
      } else {
        jwt.setExpirationTime(Math.floor(Date.now() / 1000) + options.expiresIn);
      }
    } else {
      jwt.setExpirationTime('1h'); // Secure default
    }

    if (options.notBefore) {
      if (typeof options.notBefore === 'string') {
        jwt.setNotBefore(options.notBefore);
      } else {
        jwt.setNotBefore(Math.floor(Date.now() / 1000) + options.notBefore);
      }
    }

    if (options.audience) jwt.setAudience(options.audience);
    if (options.issuer) jwt.setIssuer(options.issuer);
    if (options.subject) jwt.setSubject(options.subject);

    return await jwt.sign(secret);
  } catch (error) {
    throw new Error(`Failed to sign JWT: ${error.message}`);
  }
}

/**
 * Verify a JWT token with strict validation
 */
export async function verifyJWT(token: string, options: VerifyOptions): Promise<JWTPayload> {
  try {
    let keyOrSecret: any;
    
    if (options.jwksUri) {
      // Use JWKS for verification
      const jwks = await getJWKS(options.jwksUri);
      keyOrSecret = jose.createRemoteJWKSet(new URL(options.jwksUri));
    } else if (options.secret) {
      // Use secret for verification
      keyOrSecret = new TextEncoder().encode(options.secret.toString());
    } else {
      throw new Error('Either secret or jwksUri must be provided');
    }

    const { payload } = await jose.jwtVerify(token, keyOrSecret, {
      algorithms: options.alg ? [options.alg] : undefined,
      audience: options.audience,
      issuer: options.issuer,
      clockTolerance: options.clockTolerance || 0
    });

    return payload as JWTPayload;
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      throw new TokenExpiredError('Token has expired');
    } else if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      throw new InvalidSignatureError('Invalid token signature');
    } else {
      throw new InvalidTokenError(`Invalid token: ${error.message}`);
    }
  }
}

/**
 * Decode JWT header and payload without verification (for debugging)
 */
export function decodeJWT(token: string): { header: any; payload: JWTPayload } {
  try {
    const decoded = jose.decodeJwt(token);
    const header = jose.decodeProtectedHeader(token);
    return { header, payload: decoded as JWTPayload };
  } catch (error) {
    throw new InvalidTokenError(`Failed to decode token: ${error.message}`);
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const { payload } = decodeJWT(token);
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  return Date.now() > expiration.getTime();
}