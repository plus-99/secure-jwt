#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { signJWT, verifyJWT, decodeJWT, isTokenExpired, InvalidTokenError } from './secure-jwt';

const program = new Command();

program
  .name('secure-jwt')
  .description('@plus99/secure-jwt CLI - Secure JWT operations for DevOps')
  .version('1.0.0');

// Sign command
program
  .command('sign')
  .description('Sign a JWT token')
  .argument('<payload>', 'Payload file path (JSON) or JSON string')
  .option('-s, --secret <secret>', 'Secret key for signing')
  .option('-a, --alg <algorithm>', 'Algorithm (HS256, HS384, HS512, RS256, etc.)', 'HS256')
  .option('-e, --expires <expires>', 'Expiration time (e.g., 1h, 30m, 7d)', '1h')
  .option('-i, --issuer <issuer>', 'Token issuer')
  .option('-u, --audience <audience>', 'Token audience')
  .option('--subject <subject>', 'Token subject')
  .option('--not-before <nbf>', 'Not before time')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action(async (payloadArg, options) => {
    try {
      // Parse payload
      let payload;
      if (fs.existsSync(payloadArg)) {
        const payloadContent = fs.readFileSync(payloadArg, 'utf8');
        payload = JSON.parse(payloadContent);
      } else {
        payload = JSON.parse(payloadArg);
      }

      // Get secret from options, environment, or prompt
      const secret = options.secret || process.env.JWT_SECRET;
      if (!secret) {
        console.error('❌ Error: Secret required. Use --secret option or JWT_SECRET environment variable.');
        process.exit(1);
      }

      // Sign the token
      const token = await signJWT(payload, {
        secret,
        alg: options.alg,
        expiresIn: options.expires,
        issuer: options.issuer,
        audience: options.audience,
        subject: options.subject,
        notBefore: options.notBefore
      });

      // Output result
      if (options.output) {
        fs.writeFileSync(options.output, token);
        console.log(`✅ Token written to ${options.output}`);
      } else {
        console.log(token);
      }

      // Show token info
      const decoded = decodeJWT(token);
      console.error(`\n📊 Token Info:`);
      console.error(`   Algorithm: ${decoded.header.alg}`);
      console.error(`   Issuer: ${decoded.payload.iss || 'None'}`);
      console.error(`   Audience: ${decoded.payload.aud || 'None'}`);
      console.error(`   Subject: ${decoded.payload.sub || 'None'}`);
      console.error(`   Expires: ${decoded.payload.exp ? new Date(decoded.payload.exp * 1000).toISOString() : 'Never'}`);
      console.error(`   Issued: ${decoded.payload.iat ? new Date(decoded.payload.iat * 1000).toISOString() : 'Unknown'}`);

    } catch (error) {
      console.error(`❌ Error signing token: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Verify command
program
  .command('verify')
  .description('Verify a JWT token')
  .argument('<token>', 'JWT token string or file path')
  .option('-s, --secret <secret>', 'Secret key for verification')
  .option('-a, --alg <algorithm>', 'Expected algorithm')
  .option('-i, --issuer <issuer>', 'Expected issuer')
  .option('-u, --audience <audience>', 'Expected audience')
  .option('--jwks-uri <uri>', 'JWKS URI for public key verification')
  .option('--tolerance <seconds>', 'Clock tolerance in seconds', '0')
  .option('--decode-only', 'Only decode without verification (unsafe for production)')
  .action(async (tokenArg, options) => {
    try {
      // Get token
      let token;
      if (fs.existsSync(tokenArg)) {
        token = fs.readFileSync(tokenArg, 'utf8').trim();
      } else {
        token = tokenArg;
      }

      if (options.decodeOnly) {
        // Decode only (for debugging)
        const decoded = decodeJWT(token);
        const expired = isTokenExpired(token);
        
        console.log('🔍 Token Decoded (NOT VERIFIED):');
        console.log('📋 Header:', JSON.stringify(decoded.header, null, 2));
        console.log('📄 Payload:', JSON.stringify(decoded.payload, null, 2));
        console.log(`⏰ Expired: ${expired}`);
        
        if (expired) {
          console.log('⚠️  WARNING: Token is expired');
        }
        return;
      }

      // Get secret from options or environment
      const secret = options.secret || process.env.JWT_SECRET;
      
      if (!secret && !options.jwksUri) {
        console.error('❌ Error: Secret or JWKS URI required. Use --secret option, --jwks-uri, or JWT_SECRET environment variable.');
        process.exit(1);
      }

      // Verify the token
      const payload = await verifyJWT(token, {
        secret,
        alg: options.alg,
        issuer: options.issuer,
        audience: options.audience,
        jwksUri: options.jwksUri,
        clockTolerance: parseInt(options.tolerance)
      });

      console.log('✅ Token verification successful!');
      console.log('📄 Verified Payload:', JSON.stringify(payload, null, 2));
      
      // Additional info
      console.log('\n📊 Verification Details:');
      console.log(`   Algorithm: ${options.alg || 'Auto-detected'}`);
      console.log(`   Issuer Check: ${options.issuer ? '✅ Validated' : '⚠️  Not checked'}`);
      console.log(`   Audience Check: ${options.audience ? '✅ Validated' : '⚠️  Not checked'}`);
      console.log(`   Expiration: ✅ Valid until ${new Date(payload.exp! * 1000).toISOString()}`);

    } catch (error) {
      console.error(`❌ Token verification failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Try to decode for debugging info
      try {
        const decoded = decodeJWT(tokenArg.length < 100 ? tokenArg : fs.readFileSync(tokenArg, 'utf8').trim());
        console.error('\n🔍 Token Debug Info:');
        console.error(`   Algorithm: ${decoded.header.alg}`);
        console.error(`   Expired: ${isTokenExpired(tokenArg.length < 100 ? tokenArg : fs.readFileSync(tokenArg, 'utf8').trim())}`);
        if (decoded.payload.exp) {
          console.error(`   Expiration: ${new Date(decoded.payload.exp * 1000).toISOString()}`);
        }
      } catch {
        // Ignore decode errors
      }
      
      process.exit(1);
    }
  });

// Decode command (alias for verify --decode-only)
program
  .command('decode')
  .description('Decode JWT token without verification (for debugging)')
  .argument('<token>', 'JWT token string or file path')
  .action(async (tokenArg) => {
    try {
      let token;
      if (fs.existsSync(tokenArg)) {
        token = fs.readFileSync(tokenArg, 'utf8').trim();
      } else {
        token = tokenArg;
      }

      const decoded = decodeJWT(token);
      const expired = isTokenExpired(token);
      
      console.log('🔍 JWT Token Decoded:');
      console.log('📋 Header:', JSON.stringify(decoded.header, null, 2));
      console.log('📄 Payload:', JSON.stringify(decoded.payload, null, 2));
      console.log(`⏰ Expired: ${expired}`);
      
      if (expired) {
        console.log('⚠️  WARNING: Token is expired');
      }
      
      // Security analysis
      console.log('\n🔒 Security Analysis:');
      console.log(`   Algorithm: ${decoded.header.alg} ${decoded.header.alg === 'none' ? '❌ INSECURE' : '✅ Secure'}`);
      console.log(`   Has Expiration: ${decoded.payload.exp ? '✅ Yes' : '❌ No (insecure)'}`);
      console.log(`   Has Issued At: ${decoded.payload.iat ? '✅ Yes' : '⚠️  No'}`);
      console.log(`   Has Issuer: ${decoded.payload.iss ? '✅ Yes' : '⚠️  No'}`);
      console.log(`   Has Audience: ${decoded.payload.aud ? '✅ Yes' : '⚠️  No'}`);

    } catch (error) {
      console.error(`❌ Error decoding token: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Generate command for creating test payloads
program
  .command('generate')
  .description('Generate sample JWT payload')
  .option('-t, --type <type>', 'Payload type (user, api, service)', 'user')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action((options) => {
    let payload;
    
    switch (options.type) {
      case 'user':
        payload = {
          sub: 'user123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'user',
          permissions: ['read', 'write']
        };
        break;
      case 'api':
        payload = {
          sub: 'api-client',
          client_id: 'app-12345',
          scope: 'read:users write:users',
          api_version: 'v1'
        };
        break;
      case 'service':
        payload = {
          sub: 'service-account',
          service: 'payment-processor',
          version: '1.0.0',
          environment: 'production'
        };
        break;
      default:
        console.error('❌ Unknown payload type. Use: user, api, or service');
        process.exit(1);
    }

    const payloadJson = JSON.stringify(payload, null, 2);
    
    if (options.output) {
      fs.writeFileSync(options.output, payloadJson);
      console.log(`✅ Sample ${options.type} payload written to ${options.output}`);
    } else {
      console.log(payloadJson);
    }
  });

// Help with examples
program
  .command('examples')
  .description('Show CLI usage examples')
  .action(() => {
    console.log(`
🔐 @plus99/secure-jwt CLI Examples

📝 SIGNING TOKENS:
  # Sign with secret from environment
  export JWT_SECRET="your-secret-key"
  secure-jwt sign '{"sub":"user123","role":"admin"}' --expires 2h

  # Sign with file payload
  echo '{"sub":"user123","role":"admin"}' > payload.json
  secure-jwt sign payload.json --secret mysecret --alg HS256

  # Sign for enterprise (with issuer/audience)
  secure-jwt sign '{"sub":"user123"}' \\
    --secret mysecret \\
    --issuer "https://auth.company.com" \\
    --audience "https://api.company.com" \\
    --expires 8h

✅ VERIFYING TOKENS:
  # Verify with secret
  secure-jwt verify $TOKEN --secret mysecret

  # Verify with JWKS (Auth0, AWS Cognito, etc.)
  secure-jwt verify $TOKEN --jwks-uri "https://auth0.auth0.com/.well-known/jwks.json"

  # Verify with strict validation
  secure-jwt verify $TOKEN \\
    --secret mysecret \\
    --issuer "https://auth.company.com" \\
    --audience "https://api.company.com"

🔍 DEBUGGING:
  # Decode without verification
  secure-jwt decode $TOKEN

  # Generate sample payloads
  secure-jwt generate --type user > user-payload.json
  secure-jwt generate --type api > api-payload.json

💼 DEVOPS WORKFLOWS:
  # CI/CD token generation
  secure-jwt sign '{"deployment":"prod","version":"1.2.3"}' \\
    --secret $CI_SECRET \\
    --expires 30m > deployment.jwt

  # Service-to-service authentication
  secure-jwt sign '{"service":"payment","env":"prod"}' \\
    --secret $SERVICE_SECRET \\
    --issuer "https://auth.internal" \\
    --audience "https://api.internal"

🏢 ENTERPRISE INTEGRATION:
  # Auth0 verification
  secure-jwt verify $TOKEN --jwks-uri "https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json"

  # AWS Cognito verification  
  secure-jwt verify $TOKEN --jwks-uri "https://cognito-idp.REGION.amazonaws.com/USER_POOL_ID/.well-known/jwks.json"

  # Custom OIDC provider
  secure-jwt verify $TOKEN --jwks-uri "https://YOUR_OIDC_PROVIDER/.well-known/jwks.json"
`);
  });

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

program.parse();