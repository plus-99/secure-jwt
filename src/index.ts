// Public API exports for @plus99/secure-jwt
export { signJWT } from './sign';
export { verifyJWT, decodeJWT, getTokenExpiration, isTokenExpired } from './verify';
export { TokenExpiredError, InvalidSignatureError, InvalidTokenError, SecurityValidationError } from './errors';
export { getJWKS, clearJWKSCache, getJWKSCacheStats } from './keys';
export { parseTimeToSeconds, getCurrentTimestamp, isSecureAlgorithm, normalizeIssuer } from './utils';

// Re-export types
export type { 
  SecureAlgorithm, 
  SignOptions, 
  VerifyOptions, 
  JWTPayload, 
  EnterpriseProvider, 
  SecurityPolicy 
} from './types';

// Enterprise integrations
export { 
  verifyEnterpriseJWT, 
  ENTERPRISE_PROVIDERS, 
  getEnterpriseProviderInfo, 
  validateEnterpriseConfig,
  getOIDCConfiguration 
} from './enterprise';

// Security utilities
export {
  validateJWTSecurity,
  generateSecurityAssessment,
  recommendAlgorithm,
  DEFAULT_SECURITY_POLICY,
  DEVELOPMENT_SECURITY_POLICY,
  isProductionSecure,
  validateIssuerSecurity
} from './security';

// Version info
export const VERSION = '1.0.0';

// Default export for convenience
export default {
  signJWT: require('./sign').signJWT,
  verifyJWT: require('./verify').verifyJWT,
  decodeJWT: require('./verify').decodeJWT,
  TokenExpiredError: require('./errors').TokenExpiredError,
  InvalidSignatureError: require('./errors').InvalidSignatureError,
  InvalidTokenError: require('./errors').InvalidTokenError
};