import express from 'express';
import { signJWT, verifyJWT, decodeJWT, isTokenExpired, TokenExpiredError, InvalidSignatureError, InvalidTokenError } from './secure-jwt';
import { runExamples, demonstrateFeatures } from './examples';
import { verifyEnterpriseJWT, ENTERPRISE_PROVIDERS, getEnterpriseProviderInfo, validateEnterpriseConfig } from './enterprise';
import { validateJWTSecurity, generateSecurityAssessment, recommendAlgorithm, DEFAULT_SECURITY_POLICY, DEVELOPMENT_SECURITY_POLICY } from './security';

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

app.use(express.json());

// Middleware to add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Home page with demo information
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>@plus99/secure-jwt Demo</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .endpoint { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 10px 0; }
            .feature { background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 10px 0; }
            code { background: #e5e7eb; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
            .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .vs-section { background: white; padding: 15px; border-radius: 8px; }
            .vs-section.old { border-left: 4px solid #ef4444; }
            .vs-section.new { border-left: 4px solid #10b981; }
            button { background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin: 5px; }
            button:hover { background: #1d4ed8; }
            .response-area { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 @plus99/secure-jwt Demo</h1>
            <p>A secure, modern JWT library with TypeScript support and built-in security features</p>
        </div>

        <div class="section">
            <h2>🚀 Why @plus99/secure-jwt?</h2>
            <div class="comparison">
                <div class="vs-section old">
                    <h3>❌ jsonwebtoken Issues</h3>
                    <ul>
                        <li>Supports insecure "none" algorithm</li>
                        <li>Weak defaults (no expiration)</li>
                        <li>No built-in JWKS support</li>
                        <li>Blocking crypto operations</li>
                        <li>Poor TypeScript support</li>
                        <li>Generic error handling</li>
                    </ul>
                </div>
                <div class="vs-section new">
                    <h3>✅ @plus99/secure-jwt Solutions</h3>
                    <ul>
                        <li>No "none" algorithm - secure by default</li>
                        <li>Mandatory expiration (1h default)</li>
                        <li>Built-in JWKS support with caching</li>
                        <li>Async/non-blocking operations</li>
                        <li>Full TypeScript native support</li>
                        <li>Typed error classes for better handling</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🛠️ API Endpoints</h2>
            
            <div class="endpoint">
                <h3>POST /api/login</h3>
                <p>Generate a JWT token with user credentials</p>
                <button onclick="testLogin()">Test Login</button>
            </div>

            <div class="endpoint">
                <h3>GET /api/protected</h3>
                <p>Access protected resource (requires valid JWT)</p>
                <button onclick="testProtected()">Test Protected Route</button>
            </div>

            <div class="endpoint">
                <h3>POST /api/verify</h3>
                <p>Verify and decode a JWT token</p>
                <button onclick="testVerify()">Test Verify</button>
            </div>

            <div class="endpoint">
                <h3>GET /api/examples</h3>
                <p>Run comprehensive examples and feature demonstrations</p>
                <button onclick="runExamples()">Run Examples</button>
            </div>

            <div class="endpoint">
                <h3>POST /api/enterprise/verify</h3>
                <p>Verify tokens from enterprise providers (Auth0, AWS Cognito, etc.)</p>
                <button onclick="testEnterpriseVerify()">Test Enterprise Verify</button>
            </div>

            <div class="endpoint">
                <h3>POST /api/security/analyze</h3>
                <p>Analyze token security and get recommendations</p>
                <button onclick="analyzeTokenSecurity()">Analyze Security</button>
            </div>
        </div>

        <div class="section">
            <h2>📋 Response Output</h2>
            <div id="response" class="response-area">Click any button above to see the API responses...</div>
        </div>

        <script>
            let currentToken = '';
            
            function updateResponse(data) {
                document.getElementById('response').textContent = JSON.stringify(data, null, 2);
            }

            async function testLogin() {
                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'demo-user', role: 'admin' })
                    });
                    const data = await response.json();
                    currentToken = data.token;
                    updateResponse(data);
                } catch (error) {
                    updateResponse({ error: error.message });
                }
            }

            async function testProtected() {
                try {
                    const response = await fetch('/api/protected', {
                        headers: { 'Authorization': 'Bearer ' + currentToken }
                    });
                    const data = await response.json();
                    updateResponse(data);
                } catch (error) {
                    updateResponse({ error: error.message });
                }
            }

            async function testVerify() {
                try {
                    const response = await fetch('/api/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: currentToken })
                    });
                    const data = await response.json();
                    updateResponse(data);
                } catch (error) {
                    updateResponse({ error: error.message });
                }
            }

            async function runExamples() {
                try {
                    const response = await fetch('/api/examples');
                    const data = await response.text();
                    document.getElementById('response').textContent = data;
                } catch (error) {
                    updateResponse({ error: error.message });
                }
            }

            async function testEnterpriseVerify() {
                const sampleToken = currentToken || prompt('Enter a JWT token to analyze:');
                try {
                    const response = await fetch('/api/enterprise/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            token: sampleToken,
                            provider: 'auth0',
                            config: { domain: 'example.auth0.com' }
                        })
                    });
                    const data = await response.json();
                    updateResponse(data);
                } catch (error) {
                    updateResponse({ error: error.message });
                }
            }

            async function analyzeTokenSecurity() {
                const sampleToken = currentToken || prompt('Enter a JWT token to analyze:');
                try {
                    const response = await fetch('/api/security/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: sampleToken })
                    });
                    const data = await response.json();
                    updateResponse(data);
                } catch (error) {
                    updateResponse({ error: error.message });
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Login endpoint - generates JWT
app.post('/api/login', async (req, res) => {
  try {
    const { username, role = 'user' } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const token = await signJWT(
      { 
        sub: username, 
        role, 
        iat: Math.floor(Date.now() / 1000),
        login_time: new Date().toISOString()
      },
      { 
        secret: JWT_SECRET, 
        alg: 'HS256', 
        expiresIn: '1h',
        issuer: 'secure-jwt-demo',
        audience: 'demo-app'
      }
    );

    res.json({
      success: true,
      token,
      message: 'Login successful',
      features: {
        algorithm: 'HS256 (secure)',
        expiration: '1 hour (secure default)',
        typed_errors: true,
        async_operations: true
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate token', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Protected route - requires valid JWT
app.get('/api/protected', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, { 
      secret: JWT_SECRET, 
      alg: 'HS256',
      issuer: 'secure-jwt-demo',
      audience: 'demo-app'
    });

    res.json({
      success: true,
      message: 'Access granted to protected resource',
      user_info: {
        subject: payload.sub,
        role: payload.role,
        issued_at: new Date(payload.iat! * 1000).toISOString(),
        expires_at: new Date(payload.exp! * 1000).toISOString()
      },
      security_features: {
        algorithm_enforcement: 'Strict HS256 verification',
        expiration_check: 'Automatic validation',
        signature_verification: 'Cryptographically secure'
      }
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired', type: 'TokenExpiredError' });
    } else if (error instanceof InvalidSignatureError) {
      return res.status(401).json({ error: 'Invalid signature', type: 'InvalidSignatureError' });
    } else if (error instanceof InvalidTokenError) {
      return res.status(401).json({ error: 'Invalid token', type: 'InvalidTokenError' });
    } else {
      return res.status(500).json({ error: 'Verification failed', details: String(error) });
    }
  }
});

// Verify endpoint - verifies and decodes token
app.post('/api/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // First decode without verification for info
    const decoded = decodeJWT(token);
    const expired = isTokenExpired(token);

    try {
      // Then verify
      const payload = await verifyJWT(token, { 
        secret: JWT_SECRET, 
        alg: 'HS256',
        issuer: 'secure-jwt-demo',
        audience: 'demo-app'
      });

      res.json({
        valid: true,
        expired: false,
        header: decoded.header,
        payload,
        security_analysis: {
          algorithm: decoded.header.alg,
          secure_algorithm: decoded.header.alg !== 'none',
          has_expiration: !!payload.exp,
          signature_valid: true
        }
      });
    } catch (verifyError) {
      res.json({
        valid: false,
        expired,
        header: decoded.header,
        payload: decoded.payload,
        error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        error_type: verifyError instanceof Error ? verifyError.constructor.name : 'Unknown',
        security_analysis: {
          algorithm: decoded.header.alg,
          secure_algorithm: decoded.header.alg !== 'none',
          has_expiration: !!decoded.payload.exp,
          signature_valid: false
        }
      });
    }
  } catch (error) {
    res.status(400).json({ 
      valid: false, 
      error: 'Failed to decode token', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Examples endpoint
app.get('/api/examples', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  
  let output = '';
  const originalLog = console.log;
  console.log = (...args) => {
    output += args.join(' ') + '\\n';
  };

  try {
    await runExamples();
    await demonstrateFeatures();
  } catch (error) {
    output += `Error running examples: ${error}\\n`;
  } finally {
    console.log = originalLog;
  }

  res.send(output);
});

// Enterprise verification endpoint
app.post('/api/enterprise/verify', async (req, res) => {
  try {
    const { token, provider, config } = req.body;
    
    if (!token || !provider || !config) {
      return res.status(400).json({ 
        error: 'Token, provider, and config are required',
        example: {
          token: 'eyJ...',
          provider: 'auth0',
          config: { domain: 'your-domain.auth0.com' }
        }
      });
    }

    // Validate provider configuration
    const configErrors = validateEnterpriseConfig(provider, config);
    if (configErrors.length > 0) {
      return res.status(400).json({
        error: 'Invalid provider configuration',
        details: configErrors
      });
    }

    // Get provider info for demonstration (since we can't actually verify without real config)
    const providerInfo = getEnterpriseProviderInfo(provider);
    if (!providerInfo) {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    // For demo purposes, we'll decode the token and show what enterprise verification would look like
    try {
      const decoded = decodeJWT(token);
      
      res.json({
        success: true,
        provider: providerInfo.name,
        description: providerInfo.description,
        decoded_token: {
          header: decoded.header,
          payload: decoded.payload
        },
        enterprise_features: {
          jwks_uri: providerInfo.jwksUri,
          issuer_validation: providerInfo.issuer,
          audience_validation: providerInfo.audience,
          supported_algorithms: providerInfo.algorithms
        },
        demo_note: 'In production, this would verify against the actual JWKS endpoint'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to decode token for enterprise analysis',
        details: error instanceof Error ? error.message : String(error)
      });
    }

  } catch (error) {
    res.status(500).json({ 
      error: 'Enterprise verification failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Security analysis endpoint
app.post('/api/security/analyze', async (req, res) => {
  try {
    const { token, policy = 'default' } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Decode token for analysis
    const decoded = decodeJWT(token);
    const securityPolicy = policy === 'development' ? DEVELOPMENT_SECURITY_POLICY : DEFAULT_SECURITY_POLICY;
    
    // Generate security assessment
    const assessment = generateSecurityAssessment(decoded.payload, decoded.header.alg, securityPolicy);
    
    // Get algorithm recommendation
    const algorithmRec = recommendAlgorithm('enterprise');
    
    res.json({
      security_score: assessment.score,
      grade: assessment.score >= 90 ? 'A' : assessment.score >= 80 ? 'B' : assessment.score >= 70 ? 'C' : assessment.score >= 60 ? 'D' : 'F',
      violations: assessment.violations,
      warnings: assessment.warnings,
      recommendations: assessment.recommendations,
      token_analysis: {
        algorithm: decoded.header.alg,
        is_secure_algorithm: !['none', 'HS256'].includes(decoded.header.alg),
        has_expiration: !!decoded.payload.exp,
        has_proper_claims: ['sub', 'iat', 'exp'].every(claim => claim in decoded.payload),
        lifetime_seconds: decoded.payload.exp && decoded.payload.iat ? decoded.payload.exp - decoded.payload.iat : null
      },
      algorithm_recommendation: {
        suggested: algorithmRec.algorithm,
        reasoning: algorithmRec.reasoning
      },
      security_tips: [
        'Use asymmetric algorithms (RS256, ES256) for distributed systems',
        'Always set expiration times (exp claim)',
        'Include issuer (iss) and audience (aud) claims',
        'Use HTTPS for all JWT operations',
        'Rotate signing keys regularly',
        'Validate all claims in your application'
      ]
    });

  } catch (error) {
    res.status(400).json({ 
      error: 'Security analysis failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// List enterprise providers endpoint
app.get('/api/enterprise/providers', (req, res) => {
  const providers = Object.keys(ENTERPRISE_PROVIDERS).map(key => {
    const info = getEnterpriseProviderInfo(key);
    return {
      name: key,
      display_name: info?.name,
      description: info?.description,
      algorithms: info?.algorithms
    };
  });
  
  res.json({ providers });
});

// CLI examples endpoint
app.get('/api/cli/examples', (req, res) => {
  res.json({
    sign_examples: [
      'npm run cli sign \'{"sub":"user123","role":"admin"}\' --secret mysecret --expires 2h',
      'npm run cli sign payload.json --secret $JWT_SECRET --alg HS256',
      'npm run cli sign \'{"service":"api"}\' --secret mysecret --issuer https://auth.company.com'
    ],
    verify_examples: [
      'npm run cli verify $TOKEN --secret mysecret',
      'npm run cli verify token.jwt --jwks-uri https://auth0.auth0.com/.well-known/jwks.json',
      'npm run cli verify $TOKEN --secret mysecret --issuer https://auth.company.com'
    ],
    enterprise_examples: [
      '# Auth0 verification',
      'npm run cli verify $TOKEN --jwks-uri https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json',
      '# AWS Cognito verification',
      'npm run cli verify $TOKEN --jwks-uri https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID/.well-known/jwks.json'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: '@plus99/secure-jwt Demo',
    timestamp: new Date().toISOString(),
    features: [
      'Secure JWT signing and verification',
      'TypeScript native support',
      'Typed error handling',
      'Async/await API',
      'No "none" algorithm support',
      'Mandatory expiration times'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 @plus99/secure-jwt Demo Server running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Visit http://0.0.0.0:${PORT} for the interactive demo`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
  
  // Run examples on startup
  setTimeout(async () => {
    console.log('\\n' + '='.repeat(50));
    console.log('Running startup examples...');
    console.log('='.repeat(50));
    await runExamples();
    console.log('='.repeat(50));
  }, 1000);
});