import { verifyJWT, VerifyOptions, JWTPayload, InvalidTokenError } from './secure-jwt';
import fetch from 'node-fetch';

// Enterprise provider configurations
export interface EnterpriseProvider {
  name: string;
  jwksUri: string;
  issuer: string;
  audience?: string;
  algorithms: string[];
  description: string;
}

// Common enterprise providers
export const ENTERPRISE_PROVIDERS: Record<string, (config: any) => EnterpriseProvider> = {
  auth0: (config: { domain: string; audience?: string }) => ({
    name: 'Auth0',
    jwksUri: `https://${config.domain}/.well-known/jwks.json`,
    issuer: `https://${config.domain}/`,
    audience: config.audience,
    algorithms: ['RS256'],
    description: 'Auth0 Identity Platform'
  }),

  cognito: (config: { region: string; userPoolId: string; clientId?: string }) => ({
    name: 'AWS Cognito',
    jwksUri: `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}/.well-known/jwks.json`,
    issuer: `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`,
    audience: config.clientId,
    algorithms: ['RS256'],
    description: 'AWS Cognito User Pool'
  }),

  okta: (config: { domain: string; audience?: string }) => ({
    name: 'Okta',
    jwksUri: `https://${config.domain}/oauth2/default/.well-known/jwks.json`,
    issuer: `https://${config.domain}/oauth2/default`,
    audience: config.audience,
    algorithms: ['RS256'],
    description: 'Okta Identity Cloud'
  }),

  firebase: (config: { projectId: string }) => ({
    name: 'Firebase',
    jwksUri: 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    issuer: `https://securetoken.google.com/${config.projectId}`,
    audience: config.projectId,
    algorithms: ['RS256'],
    description: 'Firebase Authentication'
  }),

  azure: (config: { tenantId: string; clientId?: string }) => ({
    name: 'Azure AD',
    jwksUri: `https://login.microsoftonline.com/${config.tenantId}/discovery/v2.0/keys`,
    issuer: `https://login.microsoftonline.com/${config.tenantId}/v2.0`,
    audience: config.clientId,
    algorithms: ['RS256'],
    description: 'Azure Active Directory'
  }),

  oidc: (config: { issuer: string; audience?: string }) => ({
    name: 'OpenID Connect',
    jwksUri: `${config.issuer}/.well-known/jwks.json`,
    issuer: config.issuer,
    audience: config.audience,
    algorithms: ['RS256', 'ES256'],
    description: 'Generic OpenID Connect Provider'
  })
};

/**
 * Verify JWT from enterprise identity provider
 */
export async function verifyEnterpriseJWT(
  token: string, 
  provider: string, 
  config: any,
  options: Partial<VerifyOptions> = {}
): Promise<JWTPayload> {
  if (!ENTERPRISE_PROVIDERS[provider]) {
    throw new InvalidTokenError(`Unsupported enterprise provider: ${provider}`);
  }

  const providerConfig = ENTERPRISE_PROVIDERS[provider](config);
  
  const verifyOptions: VerifyOptions = {
    jwksUri: providerConfig.jwksUri,
    issuer: providerConfig.issuer,
    audience: providerConfig.audience,
    ...options
  };

  try {
    const payload = await verifyJWT(token, verifyOptions);
    
    // Additional enterprise-specific validations
    await validateEnterpriseToken(payload, provider, config);
    
    return payload;
  } catch (error) {
    throw new InvalidTokenError(`Enterprise verification failed for ${providerConfig.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Additional enterprise-specific token validations
 */
async function validateEnterpriseToken(payload: JWTPayload, provider: string, config: any): Promise<void> {
  switch (provider) {
    case 'auth0':
      // Auth0 specific validations
      if (!payload.sub || !payload.sub.startsWith('auth0|') && !payload.sub.startsWith('google-oauth2|') && !payload.sub.startsWith('facebook|')) {
        // Allow various Auth0 connection types
      }
      break;

    case 'cognito':
      // AWS Cognito specific validations
      if (!payload.token_use) {
        throw new InvalidTokenError('AWS Cognito token missing token_use claim');
      }
      if (payload.token_use !== 'id' && payload.token_use !== 'access') {
        throw new InvalidTokenError(`Invalid AWS Cognito token_use: ${payload.token_use}`);
      }
      break;

    case 'firebase':
      // Firebase specific validations
      if (!payload.auth_time) {
        throw new InvalidTokenError('Firebase token missing auth_time claim');
      }
      if (payload.firebase && !payload.firebase.identities) {
        throw new InvalidTokenError('Firebase token missing identity information');
      }
      break;

    case 'azure':
      // Azure AD specific validations
      if (!payload.tid) {
        throw new InvalidTokenError('Azure AD token missing tenant ID (tid)');
      }
      if (config.tenantId && payload.tid !== config.tenantId) {
        throw new InvalidTokenError(`Token tenant ID mismatch. Expected: ${config.tenantId}, Got: ${payload.tid}`);
      }
      break;
  }
}

/**
 * Get well-known configuration for OIDC provider
 */
export async function getOIDCConfiguration(issuer: string): Promise<any> {
  try {
    const configUrl = `${issuer}/.well-known/openid_configuration`;
    const response = await fetch(configUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OIDC configuration: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to get OIDC configuration from ${issuer}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate enterprise provider configuration
 */
export function validateEnterpriseConfig(provider: string, config: any): string[] {
  const errors: string[] = [];
  
  switch (provider) {
    case 'auth0':
      if (!config.domain) errors.push('Auth0 domain is required');
      if (config.domain && !config.domain.includes('.auth0.com') && !config.domain.includes('.us.auth0.com') && !config.domain.includes('.eu.auth0.com')) {
        errors.push('Auth0 domain should be a valid Auth0 domain');
      }
      break;

    case 'cognito':
      if (!config.region) errors.push('AWS Cognito region is required');
      if (!config.userPoolId) errors.push('AWS Cognito user pool ID is required');
      if (config.userPoolId && !config.userPoolId.match(/^[a-z0-9-]+_[a-zA-Z0-9]+$/)) {
        errors.push('AWS Cognito user pool ID format is invalid');
      }
      break;

    case 'firebase':
      if (!config.projectId) errors.push('Firebase project ID is required');
      break;

    case 'azure':
      if (!config.tenantId) errors.push('Azure AD tenant ID is required');
      break;

    case 'oidc':
      if (!config.issuer) errors.push('OIDC issuer is required');
      if (config.issuer && !config.issuer.startsWith('https://')) {
        errors.push('OIDC issuer must use HTTPS');
      }
      break;

    default:
      errors.push(`Unknown provider: ${provider}`);
  }
  
  return errors;
}

/**
 * Get enterprise provider information
 */
export function getEnterpriseProviderInfo(provider: string): EnterpriseProvider | null {
  if (!ENTERPRISE_PROVIDERS[provider]) {
    return null;
  }
  
  // Return example configuration for documentation
  const exampleConfigs: Record<string, any> = {
    auth0: { domain: 'your-domain.auth0.com', audience: 'your-api-identifier' },
    cognito: { region: 'us-east-1', userPoolId: 'us-east-1_ABC123DEF', clientId: 'your-client-id' },
    okta: { domain: 'your-domain.okta.com', audience: 'your-audience' },
    firebase: { projectId: 'your-project-id' },
    azure: { tenantId: 'your-tenant-id', clientId: 'your-client-id' },
    oidc: { issuer: 'https://your-oidc-provider.com', audience: 'your-audience' }
  };
  
  return ENTERPRISE_PROVIDERS[provider](exampleConfigs[provider]);
}