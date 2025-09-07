# @plus99/secure-jwt Library

## Overview
A professional, security-focused JWT library that provides a drop-in but safer alternative to `jsonwebtoken` while adding modern features. This library follows enterprise-grade security practices and provides comprehensive TypeScript support.

## Project Purpose
- Provide a secure, production-ready JWT library for enterprise applications
- Eliminate common JWT security misconfigurations 
- Offer modern developer experience with TypeScript and async operations
- Support enterprise identity providers (Auth0, AWS Cognito, Okta, etc.)
- Include CLI tooling for DevOps workflows

## Key Features Implemented
- ✅ **Secure by Default**: No support for the vulnerable "none" algorithm
- ✅ **Mandatory Expiration**: All tokens require expiration times (1-hour default)
- ✅ **TypeScript Native**: Full TypeScript support with proper typing
- ✅ **Typed Errors**: Custom error classes for better error handling
- ✅ **Async Operations**: Promise-based API for non-blocking operations
- ✅ **JWKS Support**: Built-in support for JSON Web Key Sets with caching
- ✅ **Enterprise Integrations**: Support for major identity providers
- ✅ **Security Analysis**: Built-in security validation and recommendations
- ✅ **CLI Tooling**: Command-line interface for DevOps workflows
- ✅ **Interactive UI**: Next.js playground for testing and documentation

## Project Architecture

### Core Library (`src/`)
- `index.ts` - Public API exports and main entry point
- `sign.ts` - JWT signing implementation with secure defaults
- `verify.ts` - JWT verification with strict validation
- `errors.ts` - Custom error classes (TokenExpiredError, etc.)
- `types.ts` - TypeScript interfaces and type definitions
- `utils.ts` - Shared utilities and helper functions
- `keys.ts` - JWKS handling and key management
- `enterprise.ts` - Enterprise provider integrations
- `security.ts` - Security validation and policy enforcement

### Examples (`examples/`)
- `sign-example.ts` - JWT signing examples with various options
- `verify-example.ts` - JWT verification and error handling examples
- `jwks-example.ts` - JWKS and enterprise provider examples

### Interactive UI (`ui/`)
- Next.js application with React components
- `pages/index.tsx` - Main playground interface
- `components/SignForm.tsx` - JWT signing form
- `components/VerifyForm.tsx` - JWT verification form
- `pages/api/` - API routes for JWT operations

### Tests (`tests/`)
- `sign.test.ts` - Comprehensive signing tests
- `verify.test.ts` - Verification and error handling tests
- `jwks.test.ts` - JWKS functionality tests

## Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Start Next.js development server
- `npm run test` - Run Jest test suite
- `npm run cli` - Access CLI tooling
- `npm run examples:sign` - Run signing examples
- `npm run examples:verify` - Run verification examples
- `npm run examples:jwks` - Run JWKS examples

## CLI Commands
- `secure-jwt sign <payload>` - Sign JWT tokens
- `secure-jwt verify <token>` - Verify JWT tokens
- `secure-jwt decode <token>` - Decode tokens for debugging
- `secure-jwt generate` - Generate sample payloads
- `secure-jwt examples` - Show usage examples

## Current State
The library is production-ready with:
- Professional modular structure
- Running Next.js UI on port 5000
- Comprehensive test coverage
- Enterprise provider support
- CLI tooling for DevOps
- Security analysis features

## Technology Stack
- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Frontend**: Next.js with React
- **JWT Library**: jose (for cryptographic operations)
- **Testing**: Jest with ts-jest
- **Build**: TypeScript compiler

## Security Improvements Over Standard JWT Libraries
1. **Algorithm Security**: Blocks insecure "none" algorithm completely
2. **Default Expiration**: Enforces token expiration (prevents indefinite tokens)
3. **Strict Validation**: Mandatory algorithm specification during verification
4. **Error Transparency**: Typed error classes for precise error handling
5. **Performance**: Async operations prevent event loop blocking
6. **Key Management**: Built-in JWKS support with intelligent caching
7. **Enterprise Ready**: Support for Auth0, AWS Cognito, Okta, Firebase, Azure AD
8. **Security Analysis**: Built-in policy validation and recommendations

## Recent Changes
- 2025-09-07: Restructured into professional modular library
- Split monolithic code into focused modules
- Added Next.js interactive playground
- Implemented comprehensive test suite
- Added CLI tooling for DevOps workflows
- Enhanced enterprise provider support
- Added security analysis features

## User Preferences
- Professional library structure with proper separation of concerns
- TypeScript-first development approach
- Security-focused implementation with enterprise features
- Modern tooling and developer experience