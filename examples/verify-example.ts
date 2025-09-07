import { signJWT } from '../src/sign';
import { verifyJWT, decodeJWT, isTokenExpired } from '../src/verify';
import { TokenExpiredError, InvalidSignatureError, InvalidTokenError } from '../src/errors';

async function verifyExample() {
  console.log('✅ Verify JWT Example\n');

  const secret = 'your-secret-key';

  try {
    // Create a token first
    const token = await signJWT(
      { sub: 'user123', role: 'admin', name: 'John Doe' },
      { secret, alg: 'HS256', expiresIn: '1h' }
    );
    console.log('Created token:', token.substring(0, 50) + '...');

    // Verify the token
    const payload = await verifyJWT(token, { secret, alg: 'HS256' });
    console.log('✅ Token verified!');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Decode without verification (for debugging)
    const decoded = decodeJWT(token);
    console.log('\\nDecoded header:', JSON.stringify(decoded.header, null, 2));
    console.log('Decoded payload:', JSON.stringify(decoded.payload, null, 2));

    // Check expiration
    console.log('\\nIs expired?', isTokenExpired(token));

    // Test with wrong secret
    console.log('\\nTesting with wrong secret...');
    try {
      await verifyJWT(token, { secret: 'wrong-secret', alg: 'HS256' });
    } catch (error) {
      if (error instanceof InvalidSignatureError) {
        console.log('✅ Correctly caught invalid signature');
      }
    }

    // Test with expired token
    console.log('\\nTesting with expired token...');
    const expiredToken = await signJWT(
      { sub: 'user456', role: 'user' },
      { secret, alg: 'HS256', expiresIn: -1 }
    );
    
    try {
      await verifyJWT(expiredToken, { secret, alg: 'HS256' });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log('✅ Correctly caught expired token');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  verifyExample();
}

export { verifyExample };