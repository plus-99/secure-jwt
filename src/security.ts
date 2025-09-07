import { JWTPayload, SecureAlgorithm, SecurityPolicy } from './types';

// Import SecurityValidationError from errors module
import { SecurityValidationError } from './errors';

// Default security policy (enterprise-grade)
export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  maxTokenAge: 3600, // 1 hour
  requiredClaims: ['exp', 'iat', 'sub'],
  forbiddenAlgorithms: ['none', 'HS256'], // Recommend asymmetric algorithms for production
  minimumKeyLength: 256,
  requireHttps: true,
  clockToleranceMax: 300 // 5 minutes max
};

// Relaxed policy for development
export const DEVELOPMENT_SECURITY_POLICY: SecurityPolicy = {
  maxTokenAge: 86400, // 24 hours
  requiredClaims: ['exp', 'sub'],
  forbiddenAlgorithms: ['none'],
  minimumKeyLength: 128,
  requireHttps: false,
  clockToleranceMax: 600 // 10 minutes
};

/**
 * Validate JWT payload against security policy
 */
export function validateJWTSecurity(
  payload: JWTPayload, 
  algorithm: string,
  policy: SecurityPolicy = DEFAULT_SECURITY_POLICY
): string[] {
  const violations: string[] = [];

  // Check required claims
  if (policy.requiredClaims) {
    for (const claim of policy.requiredClaims) {
      if (!(claim in payload)) {
        violations.push(`Missing required claim: ${claim}`);
      }
    }
  }

  // Check forbidden algorithms
  if (policy.forbiddenAlgorithms?.includes(algorithm)) {
    violations.push(`Forbidden algorithm: ${algorithm}`);
  }

  // Check token age
  if (policy.maxTokenAge && payload.iat) {
    const tokenAge = Math.floor(Date.now() / 1000) - payload.iat;
    if (tokenAge > policy.maxTokenAge) {
      violations.push(`Token too old: ${tokenAge}s (max: ${policy.maxTokenAge}s)`);
    }
  }

  // Check expiration is set and reasonable
  if (!payload.exp) {
    violations.push('Token must have expiration time (exp claim)');
  } else {
    const expirationTime = payload.exp - Math.floor(Date.now() / 1000);
    if (policy.maxTokenAge && expirationTime > policy.maxTokenAge) {
      violations.push(`Token expiration too long: ${expirationTime}s (max: ${policy.maxTokenAge}s)`);
    }
  }

  // Check issuer if specified
  if (policy.allowedIssuers && payload.iss) {
    if (!policy.allowedIssuers.includes(payload.iss)) {
      violations.push(`Issuer not allowed: ${payload.iss}`);
    }
  }

  // Check audience if specified
  if (policy.allowedAudiences && payload.aud) {
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    const hasAllowedAudience = audiences.some(aud => policy.allowedAudiences!.includes(aud));
    if (!hasAllowedAudience) {
      violations.push(`No allowed audience found in: ${audiences.join(', ')}`);
    }
  }

  // Check for suspicious patterns
  violations.push(...detectSuspiciousPatterns(payload));

  return violations;
}

/**
 * Detect suspicious patterns in JWT payload
 */
function detectSuspiciousPatterns(payload: JWTPayload): string[] {
  const warnings: string[] = [];

  // Check for overly long expiration
  if (payload.exp && payload.iat) {
    const lifetime = payload.exp - payload.iat;
    if (lifetime > 31536000) { // 1 year
      warnings.push(`Token lifetime very long: ${Math.floor(lifetime / 86400)} days`);
    }
  }

  // Check for missing standard claims
  if (!payload.sub) {
    warnings.push('Missing subject (sub) claim - recommended for user identification');
  }

  if (!payload.iss) {
    warnings.push('Missing issuer (iss) claim - recommended for token verification');
  }

  // Check for potentially sensitive data in payload
  const sensitiveFields = ['password', 'secret', 'key', 'token', 'credential', 'ssn', 'credit_card'];
  for (const [key, value] of Object.entries(payload)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      warnings.push(`Potentially sensitive data in claim: ${key}`);
    }
    
    // Check for very large claims
    if (typeof value === 'string' && value.length > 1000) {
      warnings.push(`Large claim detected: ${key} (${value.length} characters)`);
    }
  }

  return warnings;
}

/**
 * Recommend algorithm based on use case
 */
export function recommendAlgorithm(useCase: 'microservices' | 'spa' | 'mobile' | 'api' | 'enterprise'): {
  algorithm: SecureAlgorithm;
  reasoning: string;
} {
  switch (useCase) {
    case 'microservices':
      return {
        algorithm: 'RS256',
        reasoning: 'Asymmetric algorithm allows service-to-service verification without sharing secrets'
      };
    
    case 'spa':
      return {
        algorithm: 'RS256',
        reasoning: 'Public key verification in browser, private key stays on server'
      };
    
    case 'mobile':
      return {
        algorithm: 'ES256',
        reasoning: 'Elliptic curve signatures are faster on mobile devices'
      };
    
    case 'api':
      return {
        algorithm: 'HS256',
        reasoning: 'Symmetric algorithm is faster for API-to-API communication with shared secrets'
      };
    
    case 'enterprise':
      return {
        algorithm: 'RS256',
        reasoning: 'Industry standard for enterprise SSO and federation'
      };
    
    default:
      return {
        algorithm: 'HS256',
        reasoning: 'Default secure symmetric algorithm'
      };
  }
}

/**
 * Generate security assessment report
 */
export function generateSecurityAssessment(
  payload: JWTPayload,
  algorithm: string,
  policy: SecurityPolicy = DEFAULT_SECURITY_POLICY
): {
  score: number;
  violations: string[];
  warnings: string[];
  recommendations: string[];
} {
  const violations = validateJWTSecurity(payload, algorithm, policy);
  const warnings = detectSuspiciousPatterns(payload);
  const recommendations: string[] = [];

  // Calculate security score (0-100)
  let score = 100;
  score -= violations.length * 15; // Major violations
  score -= warnings.length * 5;   // Minor warnings
  score = Math.max(0, score);

  // Generate recommendations
  if (algorithm === 'HS256') {
    recommendations.push('Consider using RS256 for better security in distributed systems');
  }
  
  if (!payload.iss) {
    recommendations.push('Add issuer (iss) claim to identify token source');
  }
  
  if (!payload.aud) {
    recommendations.push('Add audience (aud) claim to specify intended recipients');
  }
  
  if (payload.exp && payload.iat) {
    const lifetime = payload.exp - payload.iat;
    if (lifetime > 3600) {
      recommendations.push('Consider shorter token lifetime for better security');
    }
  }

  return {
    score,
    violations,
    warnings,
    recommendations
  };
}

/**
 * Check if algorithm is considered secure for production
 */
export function isProductionSecure(algorithm: string): boolean {
  const productionSecureAlgos = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'EdDSA'];
  return productionSecureAlgos.includes(algorithm);
}

/**
 * Validate issuer URL security
 */
export function validateIssuerSecurity(issuer: string): string[] {
  const issues: string[] = [];
  
  if (!issuer.startsWith('https://')) {
    issues.push('Issuer should use HTTPS for security');
  }
  
  if (issuer.includes('localhost') || issuer.includes('127.0.0.1')) {
    issues.push('Localhost issuer not suitable for production');
  }
  
  if (issuer.endsWith('/')) {
    // This is actually OK, just normalizing
  }
  
  try {
    const url = new URL(issuer);
    if (url.port && !['443', '80'].includes(url.port)) {
      issues.push('Non-standard port in issuer URL may indicate development setup');
    }
  } catch {
    issues.push('Invalid issuer URL format');
  }
  
  return issues;
}