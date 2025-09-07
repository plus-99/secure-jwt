import * as jose from 'jose';
import { VerifyOptions, JWTPayload } from './types';
import { TokenExpiredError, InvalidSignatureError, InvalidTokenError } from './errors';
import { getJWKS } from './keys';

/**
 * Verify a JWT token with strict validation
 */
export async function verifyJWT(token: string, options: VerifyOptions): Promise<JWTPayload> {
  try {
    let keyOrSecret: any;
    
    if (options.jwksUri) {
      // Use JWKS for verification
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
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new TokenExpiredError('Token has expired');
      } else if (error.message.includes('signature')) {
        throw new InvalidSignatureError('Invalid token signature');
      } else {
        throw new InvalidTokenError(`Invalid token: ${error.message}`);
      }
    } else {
      throw new InvalidTokenError(`Invalid token: ${String(error)}`);
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
    throw new InvalidTokenError(`Failed to decode token: ${error instanceof Error ? error.message : String(error)}`);
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