import { signJWT } from '../src/sign';

async function signExample() {
  console.log('🔐 Sign JWT Example\n');

  try {
    // Basic signing
    const basicToken = await signJWT(
      { sub: 'user123', role: 'user' },
      { secret: 'your-secret-key', alg: 'HS256' }
    );
    console.log('Basic token:', basicToken.substring(0, 50) + '...');

    // Advanced signing with all options
    const advancedToken = await signJWT(
      { 
        sub: 'user456', 
        role: 'admin',
        permissions: ['read', 'write', 'delete'],
        name: 'John Doe'
      },
      { 
        secret: 'your-secret-key', 
        alg: 'HS256',
        expiresIn: '2h',
        issuer: 'https://auth.example.com',
        audience: 'https://api.example.com',
        subject: 'user456'
      }
    );
    console.log('Advanced token:', advancedToken.substring(0, 50) + '...');

    // Service token
    const serviceToken = await signJWT(
      { 
        service: 'payment-processor',
        version: '1.0.0',
        environment: 'production'
      },
      { 
        secret: 'service-secret-key', 
        alg: 'HS256',
        expiresIn: '30m',
        issuer: 'https://internal.example.com',
        audience: 'https://api.internal.example.com'
      }
    );
    console.log('Service token:', serviceToken.substring(0, 50) + '...');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  signExample();
}

export { signExample };