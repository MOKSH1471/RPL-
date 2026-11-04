const secret = process.env.JWT_SECRET || process.env.ADMIN_API_SECRET;

if (process.env.NODE_ENV === 'production' && !secret) {
  throw new Error('CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET or ADMIN_API_SECRET must be defined in production environment variables.');
}

export const JWT_SECRET = secret || 'rpl_jwt_secret_key_season9_2026';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
