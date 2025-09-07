import { verifyJWT } from '../src/verify';
import { getJWKS, getJWKSCacheStats } from '../src/keys';

async function jwksExample() {
  console.log('🔑 JWKS Example\n');

  try {
    // Example JWKS URIs (these are real but for demo purposes)
    const jwksUris = [
      'https://www.googleapis.com/oauth2/v3/certs', // Google
      'https://appleid.apple.com/auth/keys', // Apple
    ];

    console.log('📊 JWKS Cache Stats (before):', getJWKSCacheStats());

    // Fetch JWKS from different providers
    for (const uri of jwksUris) {
      console.log(`\\nFetching JWKS from: ${uri}`);
      try {
        const jwks = await getJWKS(uri);
        console.log(`✅ Fetched ${jwks.keys?.length || 0} keys`);
        
        if (jwks.keys && jwks.keys[0]) {
          console.log('First key info:', {
            kid: jwks.keys[0].kid,
            kty: jwks.keys[0].kty,
            alg: jwks.keys[0].alg,
            use: jwks.keys[0].use
          });
        }
      } catch (error) {
        console.log(`❌ Failed to fetch from ${uri}:`, error.message);
      }
    }

    console.log('\\n📊 JWKS Cache Stats (after):', getJWKSCacheStats());

    // Example of verifying with JWKS (would need a real token)
    console.log('\\n🔍 JWKS Verification Example:');
    console.log('To verify a token with JWKS:');
    console.log(`
const payload = await verifyJWT(token, {
  jwksUri: 'https://your-provider/.well-known/jwks.json',
  issuer: 'https://your-provider',
  audience: 'your-app-id'
});
    `);

    // Enterprise provider examples
    console.log('\\n🏢 Enterprise Provider Examples:');
    const enterpriseExamples = [
      {
        name: 'Auth0',
        jwksUri: 'https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json',
        issuer: 'https://YOUR_DOMAIN.auth0.com/'
      },
      {
        name: 'AWS Cognito',
        jwksUri: 'https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID/.well-known/jwks.json',
        issuer: 'https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID'
      },
      {
        name: 'Okta',
        jwksUri: 'https://YOUR_DOMAIN.okta.com/oauth2/default/.well-known/jwks.json',
        issuer: 'https://YOUR_DOMAIN.okta.com/oauth2/default'
      }
    ];

    enterpriseExamples.forEach(provider => {
      console.log(`\\n${provider.name}:`);
      console.log(`  JWKS URI: ${provider.jwksUri}`);
      console.log(`  Issuer: ${provider.issuer}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  jwksExample();
}

export { jwksExample };