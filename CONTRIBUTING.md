# Contributing to @plus99/secure-jwt

Thank you for considering contributing to @plus99/secure-jwt! This guide will help you set up the development environment and understand our build and release processes.

## 📋 Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 8+
- **TypeScript** knowledge
- **Git** for version control

## 🚀 Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/plus99/secure-jwt.git
cd secure-jwt
npm install
```

### 2. Install UI Dependencies

```bash
cd ui
npm install
cd ..
```

### 3. Verify Setup

```bash
# Run tests
npm test

# Build the library
npm run build

# Start interactive playground
npm run dev
```

## 🏗️ Project Structure

```
secure-jwt/
├── src/                  # Core library source code
│   ├── index.ts          # Main exports
│   ├── sign.ts           # JWT signing
│   ├── verify.ts         # JWT verification
│   ├── errors.ts         # Custom error classes
│   ├── types.ts          # TypeScript definitions
│   ├── utils.ts          # Utility functions
│   ├── keys.ts           # JWKS handling
│   ├── enterprise.ts     # Enterprise provider support
│   ├── security.ts       # Security validation
│   └── cli.ts            # CLI implementation
├── examples/             # Usage examples
├── ui/                   # Next.js interactive playground
├── tests/                # Jest test suite
├── dist/                 # Compiled JavaScript (generated)
└── docs/                 # Documentation
```

## 🔧 Development Workflow

### Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode for development
npx tsc --watch
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="signJWT"
```

### Running Examples

```bash
# Sign JWT examples
npm run examples:sign

# Verify JWT examples  
npm run examples:verify

# JWKS and enterprise examples
npm run examples:jwks
```

### Interactive Development

```bash
# Start Next.js playground
npm run dev

# Visit http://localhost:5000 for interactive testing
```

### CLI Testing

```bash
# Test CLI locally
npm run cli -- sign '{"sub":"test"}' --secret "my-super-secret-key-that-is-long-enough"

# After building, test the compiled CLI
./dist/cli.js verify <token> --secret "my-secret"
```

## 🧪 Testing Guidelines

### Writing Tests

- **Unit Tests**: Place in `tests/` directory
- **Naming**: Use descriptive test names
- **Coverage**: Aim for >90% code coverage
- **Security**: Include security-focused test cases

```typescript
// Example test structure
describe('signJWT', () => {
  it('should reject none algorithm', async () => {
    await expect(
      signJWT({ sub: 'test' }, { secret: 'key', alg: 'none' })
    ).rejects.toThrow('Algorithm "none" is not allowed');
  });
});
```

### Running Security Tests

```bash
# Run security-focused tests
npm test -- --testNamePattern="security"

# Test algorithm restrictions
npm test -- --testNamePattern="algorithm"
```

## 📦 Build Process

### Production Build

```bash
# Clean previous build
rm -rf dist/

# Compile TypeScript
npm run build

# Verify build output
ls -la dist/
```

### Build Output

The build process generates:
- `dist/index.js` - Main library entry point
- `dist/index.d.ts` - TypeScript definitions
- `dist/cli.js` - CLI executable
- `dist/*.js` - All compiled modules
- `dist/*.d.ts` - All TypeScript definitions

### Build Verification

```bash
# Test the built library
node -e "const jwt = require('./dist'); console.log(jwt.signJWT);"

# Test CLI executable
node dist/cli.js --help
```

## 🚢 Release Process

### Pre-Release Checklist

1. **Code Quality**
   ```bash
   npm test                    # All tests pass
   npm run build              # Clean build
   ```

2. **Version Verification**
   ```bash
   # Update version in package.json
   # Update CHANGELOG.md with new features/fixes
   ```

3. **Security Review**
   ```bash
   npm audit                  # No high/critical vulnerabilities
   npm run examples:sign      # Examples work correctly
   npm run examples:verify    # Verification works
   ```

### Version Management

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

### Publishing to NPM

```bash
# Login to NPM (first time only)
npm login

# Dry run to verify package contents
npm publish --dry-run

# Publish to NPM
npm publish

# Publish with tag (for beta releases)
npm publish --tag beta
```

### Post-Release Steps

1. **Git Tagging**
   ```bash
   git tag v1.0.0
   git push origin main --tags
   ```

2. **GitHub Release**
   - Create release notes on GitHub
   - Attach build artifacts if needed

3. **Documentation Update**
   - Update README.md if needed
   - Update examples with new features

## 🔒 Security Considerations

### Security Review Process

1. **Algorithm Validation**
   - Ensure no `none` algorithm support
   - Validate secure algorithm defaults

2. **Key Management**
   - Verify minimum key lengths
   - Test JWKS caching security

3. **Error Handling**
   - No sensitive data in error messages
   - Proper error types and handling

### Security Testing

```bash
# Test algorithm restrictions
npm test -- tests/security.test.ts

# Test enterprise provider validation
npm test -- tests/enterprise.test.ts

# Test key validation
npm test -- tests/keys.test.ts
```

## 🐛 Debugging

### Common Issues

1. **TypeScript Compilation Errors**
   ```bash
   npx tsc --noEmit          # Check types without building
   ```

2. **Test Failures**
   ```bash
   npm test -- --verbose     # Detailed test output
   ```

3. **CLI Issues**
   ```bash
   npm run cli -- --help     # Test CLI functionality
   ```

### Development Tools

- **VS Code**: Recommended IDE with TypeScript support
- **Jest**: Test runner with coverage reports
- **TypeScript**: Type checking and compilation

## 📝 Documentation

### Code Documentation

- Use JSDoc comments for all public APIs
- Include examples in documentation
- Document security considerations

```typescript
/**
 * Signs a JWT token with secure defaults
 * @param payload - The JWT payload
 * @param options - Signing options with mandatory algorithm
 * @returns Promise resolving to the signed JWT token
 * @example
 * ```typescript
 * const token = await signJWT(
 *   { sub: 'user123' },
 *   { secret: 'my-secret', alg: 'HS256' }
 * );
 * ```
 */
export async function signJWT(payload: JWTPayload, options: SignOptions): Promise<string>
```

### README Updates

When adding new features:
1. Update API documentation
2. Add usage examples
3. Update feature comparison table
4. Add CLI examples if applicable

## 🎯 Pull Request Process

1. **Fork and Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Development**
   - Write tests first (TDD approach)
   - Implement feature
   - Update documentation

3. **Pre-Submit**
   ```bash
   npm test                  # All tests pass
   npm run build            # Clean build
   npm run examples:sign    # Examples work
   ```

4. **Submit PR**
   - Clear description of changes
   - Reference relevant issues
   - Include breaking change notes if applicable

## 🤝 Community Guidelines

- **Be Respectful**: Follow our code of conduct
- **Security First**: Always consider security implications
- **Documentation**: Update docs with code changes
- **Testing**: Maintain high test coverage
- **Compatibility**: Avoid unnecessary breaking changes

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/plus99/secure-jwt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/plus99/secure-jwt/discussions)
- **Security**: security@plus99.com
- **General**: [Community Forum](https://community.plus99.com)

---

Thank you for contributing to making JWT handling more secure for everyone! 🔐