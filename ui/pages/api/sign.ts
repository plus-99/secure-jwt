import type { NextApiRequest, NextApiResponse } from 'next';
import { signJWT } from '../../../src/sign';
import { SignOptions } from '../../../src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payload, secret, algorithm, expiresIn, issuer, audience } = req.body;

    // Parse payload JSON
    let parsedPayload;
    try {
      parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Validate required fields
    if (!secret) {
      return res.status(400).json({ error: 'Secret is required' });
    }

    // Build sign options
    const options: SignOptions = {
      secret,
      alg: algorithm || 'HS256',
    };

    if (expiresIn) options.expiresIn = expiresIn;
    if (issuer) options.issuer = issuer;
    if (audience) options.audience = audience;

    // Sign the JWT
    const token = await signJWT(parsedPayload, options);

    // Return result with token info
    res.status(200).json({
      success: true,
      token,
      payload: parsedPayload,
      options: {
        algorithm: options.alg,
        expiresIn: options.expiresIn || '1h (default)',
        issuer: options.issuer,
        audience: options.audience
      },
      security_features: {
        secure_algorithm: true,
        mandatory_expiration: true,
        no_none_algorithm: true
      }
    });

  } catch (error) {
    console.error('Sign error:', error);
    res.status(500).json({ 
      error: 'Failed to sign JWT', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}