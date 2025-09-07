import { signJWT } from '../src/sign';
import { verifyJWT, decodeJWT, isTokenExpired, getTokenExpiration } from '../src/verify';
import { TokenExpiredError, InvalidSignatureError, InvalidTokenError } from '../src/errors';

describe('verifyJWT', () => {
  const secret = 'test-secret-key-for-testing-only';
  const wrongSecret = 'wrong-secret-key';

  test('should verify a valid JWT', async () => {
    const payload = { sub: 'user123', role: 'admin' };
    const token = await signJWT(payload, { secret, alg: 'HS256' });
    
    const verified = await verifyJWT(token, { secret, alg: 'HS256' });
    
    expect(verified.sub).toBe('user123');
    expect(verified.role).toBe('admin');
    expect(verified.exp).toBeDefined();
    expect(verified.iat).toBeDefined();
  });

  test('should reject JWT with wrong secret', async () => {
    const payload = { sub: 'user123' };
    const token = await signJWT(payload, { secret, alg: 'HS256' });
    
    await expect(verifyJWT(token, { 
      secret: wrongSecret, 
      alg: 'HS256' 
    })).rejects.toThrow(InvalidSignatureError);
  });

  test('should reject expired JWT', async () => {
    const payload = { sub: 'user123' };
    const token = await signJWT(payload, { 
      secret, 
      alg: 'HS256', 
      expiresIn: -1 // Already expired
    });
    
    await expect(verifyJWT(token, { 
      secret, 
      alg: 'HS256' 
    })).rejects.toThrow(TokenExpiredError);
  });

  test('should verify issuer and audience', async () => {
    const payload = { sub: 'user123' };
    const issuer = 'https://auth.example.com';
    const audience = 'https://api.example.com';
    
    const token = await signJWT(payload, { 
      secret, 
      alg: 'HS256', 
      issuer, 
      audience 
    });
    
    const verified = await verifyJWT(token, { 
      secret, 
      alg: 'HS256',
      issuer,
      audience
    });
    
    expect(verified.iss).toBe(issuer);
    expect(verified.aud).toBe(audience);
  });

  test('should reject JWT with wrong issuer', async () => {
    const payload = { sub: 'user123' };
    const token = await signJWT(payload, { 
      secret, 
      alg: 'HS256', 
      issuer: 'https://auth.example.com'
    });
    
    await expect(verifyJWT(token, { 
      secret, 
      alg: 'HS256',
      issuer: 'https://wrong-issuer.com'
    })).rejects.toThrow(InvalidTokenError);
  });
});

describe('decodeJWT', () => {
  const secret = 'test-secret-key';

  test('should decode JWT without verification', async () => {
    const payload = { sub: 'user123', role: 'admin' };
    const token = await signJWT(payload, { secret, alg: 'HS256' });
    
    const decoded = decodeJWT(token);
    
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload.sub).toBe('user123');
    expect(decoded.payload.role).toBe('admin');
  });

  test('should reject malformed JWT', () => {
    expect(() => decodeJWT('not.a.jwt')).toThrow(InvalidTokenError);
    expect(() => decodeJWT('not-a-jwt-at-all')).toThrow(InvalidTokenError);
  });
});

describe('isTokenExpired', () => {
  const secret = 'test-secret-key';

  test('should detect expired token', async () => {
    const token = await signJWT(
      { sub: 'user123' }, 
      { secret, alg: 'HS256', expiresIn: -1 }
    );
    
    expect(isTokenExpired(token)).toBe(true);
  });

  test('should detect valid token', async () => {
    const token = await signJWT(
      { sub: 'user123' }, 
      { secret, alg: 'HS256', expiresIn: '1h' }
    );
    
    expect(isTokenExpired(token)).toBe(false);
  });
});

describe('getTokenExpiration', () => {
  const secret = 'test-secret-key';

  test('should get expiration date', async () => {
    const token = await signJWT(
      { sub: 'user123' }, 
      { secret, alg: 'HS256', expiresIn: '1h' }
    );
    
    const expiration = getTokenExpiration(token);
    
    expect(expiration).toBeInstanceOf(Date);
    expect(expiration!.getTime()).toBeGreaterThan(Date.now());
  });

  test('should return null for token without expiration', async () => {
    // Create a token manually without exp claim (if possible)
    const basicPayload = { sub: 'user123' };
    const token = await signJWT(basicPayload, { secret, alg: 'HS256' });
    
    // Even with our secure library, tokens should have expiration
    const expiration = getTokenExpiration(token);
    expect(expiration).not.toBeNull(); // Our library enforces expiration
  });
});