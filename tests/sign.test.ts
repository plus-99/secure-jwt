import { signJWT } from '../src/sign';
import { decodeJWT } from '../src/verify';

describe('signJWT', () => {
  const secret = 'test-secret-key-for-testing-only';

  test('should sign a basic JWT with default options', async () => {
    const payload = { sub: 'user123', role: 'user' };
    const token = await signJWT(payload, { secret, alg: 'HS256' });
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    
    const decoded = decodeJWT(token);
    expect(decoded.payload.sub).toBe('user123');
    expect(decoded.payload.role).toBe('user');
    expect(decoded.payload.exp).toBeDefined(); // Should have default expiration
  });

  test('should sign JWT with custom expiration', async () => {
    const payload = { sub: 'user456' };
    const token = await signJWT(payload, { 
      secret, 
      alg: 'HS256', 
      expiresIn: '2h' 
    });
    
    const decoded = decodeJWT(token);
    const now = Math.floor(Date.now() / 1000);
    const twoHours = 2 * 60 * 60;
    
    expect(decoded.payload.exp).toBeGreaterThan(now);
    expect(decoded.payload.exp).toBeLessThanOrEqual(now + twoHours + 10); // Allow 10s tolerance
  });

  test('should sign JWT with issuer and audience', async () => {
    const payload = { sub: 'user789' };
    const token = await signJWT(payload, { 
      secret, 
      alg: 'HS256',
      issuer: 'https://auth.example.com',
      audience: 'https://api.example.com'
    });
    
    const decoded = decodeJWT(token);
    expect(decoded.payload.iss).toBe('https://auth.example.com');
    expect(decoded.payload.aud).toBe('https://api.example.com');
  });

  test('should reject insecure algorithms', async () => {
    const payload = { sub: 'user123' };
    
    await expect(signJWT(payload, { 
      secret, 
      alg: 'none' as any 
    })).rejects.toThrow('Insecure algorithm');
  });

  test('should set issued at time', async () => {
    const payload = { sub: 'user123' };
    const beforeSign = Math.floor(Date.now() / 1000);
    
    const token = await signJWT(payload, { secret, alg: 'HS256' });
    
    const afterSign = Math.floor(Date.now() / 1000);
    const decoded = decodeJWT(token);
    
    expect(decoded.payload.iat).toBeGreaterThanOrEqual(beforeSign);
    expect(decoded.payload.iat).toBeLessThanOrEqual(afterSign);
  });

  test('should handle different algorithms', async () => {
    const payload = { sub: 'user123' };
    const algorithms = ['HS256', 'HS384', 'HS512'] as const;
    
    for (const alg of algorithms) {
      const token = await signJWT(payload, { secret, alg });
      const decoded = decodeJWT(token);
      
      expect(decoded.header.alg).toBe(alg);
      expect(decoded.payload.sub).toBe('user123');
    }
  });
});