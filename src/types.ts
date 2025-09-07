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

// Enterprise provider configuration
export interface EnterpriseProvider {
  name: string;
  jwksUri: string;
  issuer: string;
  audience?: string;
  algorithms: string[];
  description: string;
}

// Security policy interface
export interface SecurityPolicy {
  maxTokenAge?: number; // seconds
  requiredClaims?: string[];
  forbiddenAlgorithms?: string[];
  minimumKeyLength?: number;
  requireHttps?: boolean;
  allowedIssuers?: string[];
  allowedAudiences?: string[];
  clockToleranceMax?: number;
}