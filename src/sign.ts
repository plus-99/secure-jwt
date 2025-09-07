import * as jose from 'jose';
import { SignOptions, JWTPayload, SecureAlgorithm } from './types';
import { parseTimeToSeconds, getCurrentTimestamp, isSecureAlgorithm } from './utils';
import { validateKeyForAlgorithm } from './keys';

/**
 * Sign a JWT token with secure defaults
 */
export async function signJWT(payload: JWTPayload, options: SignOptions): Promise<string> {
  // Validate algorithm (no 'none' allowed)
  if (!isSecureAlgorithm(options.alg)) {
    throw new Error(`Insecure algorithm: ${options.alg}. Only secure algorithms are allowed.`);
  }

  // Validate key
  validateKeyForAlgorithm(options.secret, options.alg);

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
        jwt.setExpirationTime(getCurrentTimestamp() + options.expiresIn);
      }
    } else {
      jwt.setExpirationTime('1h'); // Secure default
    }

    if (options.notBefore) {
      if (typeof options.notBefore === 'string') {
        jwt.setNotBefore(options.notBefore);
      } else {
        jwt.setNotBefore(getCurrentTimestamp() + options.notBefore);
      }
    }

    if (options.audience) jwt.setAudience(options.audience);
    if (options.issuer) jwt.setIssuer(options.issuer);
    if (options.subject) jwt.setSubject(options.subject);

    return await jwt.sign(secret);
  } catch (error) {
    throw new Error(`Failed to sign JWT: ${error instanceof Error ? error.message : String(error)}`);
  }
}