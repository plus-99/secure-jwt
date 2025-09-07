import { getJWKS, clearJWKSCache, getJWKSCacheStats } from '../src/keys';

// Mock fetch for testing
global.fetch = jest.fn();

describe('JWKS functionality', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  
  beforeEach(() => {
    clearJWKSCache();
    jest.clearAllMocks();
  });

  test('should fetch JWKS from remote URL', async () => {
    const mockJWKS = {
      keys: [
        {
          kty: 'RSA',
          kid: 'test-key-id',
          use: 'sig',
          alg: 'RS256',
          n: 'test-modulus',
          e: 'AQAB'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJWKS
    } as Response);

    const jwks = await getJWKS('https://example.com/.well-known/jwks.json');
    
    expect(jwks).toEqual(mockJWKS);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/.well-known/jwks.json');
  });

  test('should cache JWKS responses', async () => {
    const mockJWKS = {
      keys: [{ kty: 'RSA', kid: 'test-key' }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJWKS
    } as Response);

    const uri = 'https://example.com/.well-known/jwks.json';
    
    // First call
    await getJWKS(uri);
    
    // Second call should use cache
    const jwks2 = await getJWKS(uri);
    
    expect(jwks2).toEqual(mockJWKS);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Only called once due to caching
  });

  test('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    } as Response);

    await expect(getJWKS('https://invalid.com/jwks.json'))
      .rejects.toThrow('Failed to fetch JWKS: Not Found');
  });

  test('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(getJWKS('https://example.com/jwks.json'))
      .rejects.toThrow('Failed to fetch JWKS from https://example.com/jwks.json: Network error');
  });

  test('should track cache statistics', async () => {
    const mockJWKS = { keys: [] };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockJWKS
    } as Response);

    const uri1 = 'https://example1.com/jwks.json';
    const uri2 = 'https://example2.com/jwks.json';
    
    await getJWKS(uri1);
    await getJWKS(uri2);
    
    const stats = getJWKSCacheStats();
    
    expect(stats.size).toBe(2);
    expect(stats.entries).toContain(uri1);
    expect(stats.entries).toContain(uri2);
  });

  test('should clear cache', async () => {
    const mockJWKS = { keys: [] };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockJWKS
    } as Response);

    await getJWKS('https://example.com/jwks.json');
    
    expect(getJWKSCacheStats().size).toBe(1);
    
    clearJWKSCache();
    
    expect(getJWKSCacheStats().size).toBe(0);
  });
});