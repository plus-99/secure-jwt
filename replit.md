# @plus99/secure-jwt Demo Project

## Overview
This project demonstrates a secure JWT library implementation that addresses the security issues found in the popular `jsonwebtoken` library. The demo showcases modern security practices, TypeScript support, and improved developer experience.

## Project Purpose
- Demonstrate secure JWT handling with modern best practices
- Show the differences between traditional JWT libraries and a security-focused approach
- Provide an interactive web interface to test JWT operations
- Implement TypeScript-native JWT operations with proper error handling

## Key Features Implemented
- ✅ **Secure by Default**: No support for the vulnerable "none" algorithm
- ✅ **Mandatory Expiration**: All tokens require expiration times (1-hour default)
- ✅ **TypeScript Native**: Full TypeScript support with proper typing
- ✅ **Typed Errors**: Custom error classes for better error handling
- ✅ **Async Operations**: Promise-based API for non-blocking operations
- ✅ **JWKS Support**: Built-in support for JSON Web Key Sets with caching
- ✅ **Interactive Demo**: Web interface for testing all features

## Project Architecture

### Core Library (`src/secure-jwt.ts`)
- Main implementation of the secure JWT library
- Custom error classes: `TokenExpiredError`, `InvalidSignatureError`, `InvalidTokenError`
- Functions: `signJWT`, `verifyJWT`, `decodeJWT`, `isTokenExpired`
- JWKS caching and remote key set support

### Examples (`src/examples.ts`)
- Comprehensive examples demonstrating all features
- Feature comparison table
- Security demonstration

### Web Server (`src/server.ts`)
- Express.js server with interactive web interface
- API endpoints for testing JWT operations
- Real-time examples and feature demonstrations

## API Endpoints
- `GET /` - Interactive web demo interface
- `POST /api/login` - Generate JWT tokens
- `GET /api/protected` - Protected route requiring valid JWT
- `POST /api/verify` - Verify and analyze JWT tokens
- `GET /api/examples` - Run comprehensive examples
- `GET /health` - Service health check

## Current State
The project is fully functional with:
- Running web server on port 5000
- Interactive demo interface
- All JWT operations working correctly
- Comprehensive examples and documentation
- Security features properly implemented

## Technology Stack
- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **JWT Library**: jose (for cryptographic operations)
- **Development**: ts-node for TypeScript execution

## Security Improvements Over Standard JWT Libraries
1. **Algorithm Security**: Blocks insecure "none" algorithm completely
2. **Default Expiration**: Enforces token expiration (prevents indefinite tokens)
3. **Strict Validation**: Mandatory algorithm specification during verification
4. **Error Transparency**: Typed error classes for precise error handling
5. **Performance**: Async operations prevent event loop blocking
6. **Key Management**: Built-in JWKS support with intelligent caching

## Recent Changes
- 2025-09-07: Initial project setup and complete implementation
- Created secure JWT library with TypeScript support
- Implemented interactive web demo with comprehensive examples
- Added proper error handling and security features
- Configured development workflow with live reload

## User Preferences
- TypeScript-first development approach
- Security-focused implementation
- Interactive demonstrations preferred
- Clear documentation and examples