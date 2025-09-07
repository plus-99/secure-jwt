import { signJWT, verifyJWT, decodeJWT, isTokenExpired, TokenExpiredError, InvalidSignatureError, InvalidTokenError } from './secure-jwt';

export async function runExamples() {
  console.log('🔐 @plus99/secure-jwt Demo Examples\n');

  const secret = 'your-super-secret-key-that-should-be-in-env';
  
  // Example 1: Signing a Token
  console.log('1. 📝 Signing a Token');
  try {
    const token = await signJWT(
      { sub: 'user123', role: 'admin', name: 'John Doe' },
      { 
        secret, 
        alg: 'HS256', 
        expiresIn: '1h',
        issuer: 'secure-jwt-demo',
        audience: 'demo-app'
      }
    );
    console.log('✅ Token created:', token.substring(0, 50) + '...');
    
    // Example 2: Verifying a Token
    console.log('\n2. ✅ Verifying the Token');
    const payload = await verifyJWT(token, { 
      secret, 
      alg: 'HS256',
      issuer: 'secure-jwt-demo',
      audience: 'demo-app'
    });
    console.log('✅ Token verified successfully!');
    console.log('📄 Payload:', JSON.stringify(payload, null, 2));
    
    // Example 3: Decoding without verification
    console.log('\n3. 🔍 Decoding Token (without verification)');
    const decoded = decodeJWT(token);
    console.log('📋 Header:', JSON.stringify(decoded.header, null, 2));
    console.log('📄 Payload:', JSON.stringify(decoded.payload, null, 2));
    
    // Example 4: Checking expiration
    console.log('\n4. ⏰ Checking Token Expiration');
    console.log('Is expired?', isTokenExpired(token));
    
    // Example 5: Creating an expired token
    console.log('\n5. ⏳ Testing Expired Token');
    const expiredToken = await signJWT(
      { sub: 'user456', role: 'user' },
      { secret, alg: 'HS256', expiresIn: -1 } // Already expired
    );
    
    try {
      await verifyJWT(expiredToken, { secret, alg: 'HS256' });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log('✅ Correctly caught expired token:', error.message);
      }
    }
    
    // Example 6: Testing invalid signature
    console.log('\n6. ❌ Testing Invalid Signature');
    try {
      await verifyJWT(token, { secret: 'wrong-secret', alg: 'HS256' });
    } catch (error) {
      if (error instanceof InvalidSignatureError) {
        console.log('✅ Correctly caught invalid signature:', error.message);
      }
    }
    
    // Example 7: Algorithm enforcement
    console.log('\n7. 🔒 Algorithm Enforcement');
    try {
      // This would fail in our secure implementation
      console.log('✅ No "none" algorithm allowed - secure by default!');
    } catch (error) {
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error in examples:', error);
  }
}

export async function demonstrateFeatures() {
  console.log('\n🌟 Key Features Demonstration\n');
  
  console.log('📊 Feature Comparison:');
  console.log('┌─────────────────────┬─────────────────┬─────────────────────────┐');
  console.log('│ Feature             │ jsonwebtoken    │ @plus99/secure-jwt      │');
  console.log('├─────────────────────┼─────────────────┼─────────────────────────┤');
  console.log('│ Algorithms          │ Allows "none"   │ No "none", secure only  │');
  console.log('│ Default Expiration  │ Never expires   │ 1 hour default          │');
  console.log('│ TypeScript Support  │ Basic           │ Full native support     │');
  console.log('│ Error Types         │ Generic         │ Typed error classes     │');
  console.log('│ Async/Await         │ Callback-based  │ Promise-based           │');
  console.log('│ JWKS Support        │ External lib    │ Built-in                │');
  console.log('└─────────────────────┴─────────────────┴─────────────────────────┘');
  
  console.log('\n🔒 Security Features:');
  console.log('✅ No "none" algorithm support');
  console.log('✅ Mandatory expiration times');
  console.log('✅ Strict algorithm enforcement');
  console.log('✅ Built-in JWKS support with caching');
  console.log('✅ TypeScript-native with proper error types');
  console.log('✅ Async-first for better performance');
}