# @plus99/secure-jwt

A **drop-in but safer alternative** to `jsonwebtoken` with modern security practices, TypeScript support, and enterprise features.

[![TypeScript](https://img.shields.io/badge/TypeScript-Native-blue)](https://www.typescriptlang.org/)
[![Security](https://img.shields.io/badge/Security-First-green)](https://owasp.org/www-project-top-ten/)
[![Enterprise](https://img.shields.io/badge/Enterprise-Ready-orange)](https://enterprise.github.com/)

## 🚀 Why @plus99/secure-jwt?

The popular `jsonwebtoken` library has several security and developer experience issues:

| Issue | `jsonwebtoken` | `@plus99/secure-jwt` |
|-------|----------------|---------------------|
| ❌ Supports insecure `none` algorithm | ✅ Blocks `none` completely |
| ❌ No default expiration | ✅ Mandatory expiration (1h default) |
| ❌ Weak TypeScript support | ✅ Full TypeScript native |
| ❌ Generic error handling | ✅ Typed error classes |
| ❌ Blocking crypto operations | ✅ Async/non-blocking |
| ❌ No JWKS support | ✅ Built-in JWKS with caching |
| ❌ No enterprise integrations | ✅ Auth0, Cognito, Okta support |
| ❌ No CLI tooling | ✅ DevOps-ready CLI |

## 📦 Installation

```bash
npm install @plus99/secure-jwt
```

## 🏃‍♂️ Quick Start

### Signing JWTs

```typescript
import { signJWT } from '@plus99/secure-jwt';

const token = await signJWT(
  { sub: 'user123', role: 'admin' },
  { 
    secret: process.env.JWT_SECRET!, 
    alg: 'HS256',
    expiresIn: '1h' // Mandatory - no indefinite tokens!
  }
);
```

### Verifying JWTs

```typescript
import { verifyJWT, TokenExpiredError } from '@plus99/secure-jwt';

try {
  const payload = await verifyJWT(token, { 
    secret: process.env.JWT_SECRET!, 
    alg: 'HS256' 
  });
  console.log('Valid token:', payload);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    console.log('Token expired');
  }
}
```

### Enterprise Verification (JWKS)

```typescript
import { verifyJWT } from '@plus99/secure-jwt';

// Auth0
const payload = await verifyJWT(token, {
  jwksUri: 'https://your-domain.auth0.com/.well-known/jwks.json',
  issuer: 'https://your-domain.auth0.com/',
  audience: 'your-api-identifier'
});

// AWS Cognito
const payload = await verifyJWT(token, {
  jwksUri: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ABC123/.well-known/jwks.json'
});
```

## 🛠️ API Reference

### Core Functions

#### `signJWT(payload, options)`

Signs a JWT with secure defaults.

```typescript
interface SignOptions {
  secret: string | Buffer;
  alg: SecureAlgorithm;
  expiresIn?: string | number;  // Default: '1h'
  notBefore?: string | number;
  audience?: string;
  issuer?: string;
  subject?: string;
}

const token = await signJWT(payload, options);
```

#### `verifyJWT(token, options)`

Verifies a JWT with strict validation.

```typescript
interface VerifyOptions {
  secret?: string | Buffer;
  alg?: SecureAlgorithm;
  jwksUri?: string;            // For enterprise providers
  audience?: string;
  issuer?: string;
  clockTolerance?: number;
}

const payload = await verifyJWT(token, options);
```

#### `decodeJWT(token)`

Decodes JWT without verification (for debugging).

```typescript
const { header, payload } = decodeJWT(token);
```

### Error Types

All errors are typed for better error handling:

```typescript
import { 
  TokenExpiredError, 
  InvalidSignatureError, 
  InvalidTokenError 
} from '@plus99/secure-jwt';

try {
  await verifyJWT(token, options);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // Handle expired token
  } else if (error instanceof InvalidSignatureError) {
    // Handle invalid signature
  }
}
```

## 🏢 Enterprise Features

### Supported Providers

- **Auth0** - `verifyEnterpriseJWT(token, 'auth0', { domain: 'your-domain.auth0.com' })`
- **AWS Cognito** - `verifyEnterpriseJWT(token, 'cognito', { region: 'us-east-1', userPoolId: 'us-east-1_ABC123' })`
- **Okta** - `verifyEnterpriseJWT(token, 'okta', { domain: 'your-domain.okta.com' })`
- **Firebase** - `verifyEnterpriseJWT(token, 'firebase', { projectId: 'your-project' })`
- **Azure AD** - `verifyEnterpriseJWT(token, 'azure', { tenantId: 'your-tenant-id' })`
- **Generic OIDC** - `verifyEnterpriseJWT(token, 'oidc', { issuer: 'https://your-provider.com' })`

### Enterprise Verification

```typescript
import { verifyEnterpriseJWT } from '@plus99/secure-jwt';

const payload = await verifyEnterpriseJWT(
  token,
  'auth0',
  { domain: 'your-domain.auth0.com', audience: 'your-api' }
);
```

## 🔒 Security Features

### Built-in Security Analysis

```typescript
import { generateSecurityAssessment } from '@plus99/secure-jwt';

const decoded = decodeJWT(token);
const assessment = generateSecurityAssessment(
  decoded.payload, 
  decoded.header.alg
);

console.log(`Security Score: ${assessment.score}/100`);
console.log('Violations:', assessment.violations);
console.log('Recommendations:', assessment.recommendations);
```

### Algorithm Recommendations

```typescript
import { recommendAlgorithm } from '@plus99/secure-jwt';

const rec = recommendAlgorithm('enterprise');
console.log(`Recommended: ${rec.algorithm} - ${rec.reasoning}`);
```

## 🖥️ CLI Usage

The library includes a comprehensive CLI for DevOps workflows:

### Sign Tokens

```bash
# Basic signing
npx secure-jwt sign '{"sub":"user123","role":"admin"}' --secret mysecret

# Advanced options
npx secure-jwt sign payload.json \
  --secret $JWT_SECRET \
  --alg HS256 \
  --expires 2h \
  --issuer https://auth.company.com \
  --audience https://api.company.com
```

### Verify Tokens

```bash
# Verify with secret
npx secure-jwt verify $TOKEN --secret mysecret

# Verify with JWKS (Enterprise)
npx secure-jwt verify $TOKEN \
  --jwks-uri https://your-domain.auth0.com/.well-known/jwks.json

# Strict validation
npx secure-jwt verify $TOKEN \
  --secret mysecret \
  --issuer https://auth.company.com \
  --audience https://api.company.com
```

### Debugging

```bash
# Decode without verification
npx secure-jwt decode $TOKEN

# Generate sample payloads
npx secure-jwt generate --type user
npx secure-jwt generate --type api
```

### Enterprise Examples

```bash
# Auth0
npx secure-jwt verify $TOKEN \
  --jwks-uri https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json

# AWS Cognito
npx secure-jwt verify $TOKEN \
  --jwks-uri https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID/.well-known/jwks.json

# Show all CLI examples
npx secure-jwt examples
```

## 🎮 Interactive Playground

Start the interactive web playground to test all features:

```bash
npm run dev
```

Visit `http://localhost:5000` to access the playground with:
- JWT signing and verification forms
- Enterprise provider testing
- Security analysis tools
- Real-time examples

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
npm run test:watch
```

## 📚 Examples

Run example scripts to see the library in action:

```bash
npm run examples:sign
npm run examples:verify
npm run examples:jwks
```

## 🏗️ Development

### Project Structure

```
src/
├── index.ts          # Public API exports
├── sign.ts           # JWT signing
├── verify.ts         # JWT verification
├── errors.ts         # Custom error classes
├── types.ts          # TypeScript interfaces
├── utils.ts          # Utilities
├── keys.ts           # JWKS handling
├── enterprise.ts     # Enterprise providers
└── security.ts       # Security validation

examples/             # Usage examples
ui/                   # Next.js playground
tests/                # Test suite
```

### Building

```bash
npm run build
```

## 🔧 Configuration

### Security Policies

```typescript
import { DEFAULT_SECURITY_POLICY, DEVELOPMENT_SECURITY_POLICY } from '@plus99/secure-jwt';

// Use development policy for relaxed validation
const assessment = generateSecurityAssessment(
  payload, 
  algorithm, 
  DEVELOPMENT_SECURITY_POLICY
);
```

### JWKS Caching

```typescript
import { clearJWKSCache, getJWKSCacheStats } from '@plus99/secure-jwt';

// Clear cache
clearJWKSCache();

// Get cache statistics
const stats = getJWKSCacheStats();
console.log(`Cache size: ${stats.size}, URLs: ${stats.entries}`);
```

## 🤝 Who Benefits?

- **Developers** → Safer defaults, async performance, typed APIs
- **Security Teams** → Eliminates common JWT misconfigurations
- **Enterprise Apps** → Easy integration with Auth0, AWS Cognito, Okta, etc.
- **DevOps** → CLI tooling for scripting and debugging

## 🆚 Migration from jsonwebtoken

Replace your existing JWT operations:

```typescript
// Before (jsonwebtoken)
import jwt from 'jsonwebtoken';
const token = jwt.sign(payload, secret); // ⚠️ No expiration!
const decoded = jwt.verify(token, secret); // ⚠️ Generic errors

// After (@plus99/secure-jwt)
import { signJWT, verifyJWT } from '@plus99/secure-jwt';
const token = await signJWT(payload, { secret, alg: 'HS256' }); // ✅ Secure defaults
const decoded = await verifyJWT(token, { secret, alg: 'HS256' }); // ✅ Typed errors
```

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 🔐 Security

For security issues, please email security@plus99.com instead of using the issue tracker.

## 📞 Support

- 📖 [Documentation](https://docs.plus99.com/secure-jwt)
- 💬 [Discussions](https://github.com/plus99/secure-jwt/discussions)
- 🐛 [Issues](https://github.com/plus99/secure-jwt/issues)

---

**@plus99/secure-jwt** - Because security should be the default, not an afterthought.