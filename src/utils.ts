/**
 * Shared utilities for JWT operations
 */

/**
 * Parse time string to seconds
 */
export function parseTimeToSeconds(time: string | number): number {
  if (typeof time === 'number') {
    return time;
  }

  const match = time.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    case 'w': return value * 604800;
    default: throw new Error(`Unknown time unit: ${unit}`);
  }
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Validate algorithm security
 */
export function isSecureAlgorithm(algorithm: string): boolean {
  const secureAlgos = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'EdDSA'];
  return secureAlgos.includes(algorithm);
}

/**
 * Normalize issuer URL
 */
export function normalizeIssuer(issuer: string): string {
  return issuer.endsWith('/') ? issuer : `${issuer}/`;
}