import crypto from 'crypto';

let secret = process.env.JWT_SECRET || process.env.ADMIN_API_SECRET;

if (!secret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET or ADMIN_API_SECRET must be defined in production environment variables.');
  } else {
    // Generate an ephemeral random 256-bit secret per server boot in non-prod environments
    secret = crypto.randomBytes(32).toString('hex');
  }
}

export const JWT_SECRET = secret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
