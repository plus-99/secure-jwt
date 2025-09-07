import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT, decodeJWT, isTokenExpired } from '../../../src/verify';
import { VerifyOptions } from '../../../src/types';
import { TokenExpiredError, InvalidSignatureError, InvalidTokenError } from '../../../src/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, secret, algorithm, issuer, audience, jwksUri } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // First decode the token for analysis
    let decoded;
    try {
      decoded = decodeJWT(token);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid token format', 
        details: error instanceof Error ? error.message : String(error)
      });
    }

    const expired = isTokenExpired(token);

    // Build verify options
    const options: VerifyOptions = {};
    
    if (jwksUri) {
      options.jwksUri = jwksUri;
    } else if (secret) {
      options.secret = secret;
    } else {
      return res.status(400).json({ error: 'Either secret or JWKS URI is required' });
    }

    if (algorithm) options.alg = algorithm;
    if (issuer) options.issuer = issuer;
    if (audience) options.audience = audience;

    try {
      // Verify the token
      const payload = await verifyJWT(token, options);

      res.status(200).json({
        success: true,
        valid: true,
        expired: false,
        payload,
        header: decoded.header,
        verification: {
          method: jwksUri ? 'JWKS' : 'Secret',
          algorithm: decoded.header.alg,
          issuer_checked: !!issuer,
          audience_checked: !!audience
        },
        security_analysis: {
          algorithm: decoded.header.alg,
          secure_algorithm: decoded.header.alg !== 'none',
          has_expiration: !!payload.exp,
          signature_valid: true
        }
      });

    } catch (verifyError) {
      // Token verification failed, but provide detailed error info
      let errorType = 'VerificationError';
      let errorMessage = 'Token verification failed';

      if (verifyError instanceof TokenExpiredError) {
        errorType = 'TokenExpiredError';
        errorMessage = 'Token has expired';
      } else if (verifyError instanceof InvalidSignatureError) {
        errorType = 'InvalidSignatureError';
        errorMessage = 'Invalid token signature';
      } else if (verifyError instanceof InvalidTokenError) {
        errorType = 'InvalidTokenError';
        errorMessage = verifyError.message;
      }

      res.status(200).json({
        success: false,
        valid: false,
        expired,
        error: errorMessage,
        error_type: errorType,
        header: decoded.header,
        payload: decoded.payload,
        verification: {
          method: jwksUri ? 'JWKS' : 'Secret',
          algorithm: decoded.header.alg,
          issuer_checked: !!issuer,
          audience_checked: !!audience
        },
        security_analysis: {
          algorithm: decoded.header.alg,
          secure_algorithm: decoded.header.alg !== 'none',
          has_expiration: !!decoded.payload.exp,
          signature_valid: false
        }
      });
    }

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ 
      error: 'Internal verification error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}