/**
 * Environment Variable Validator
 * Validates critical infrastructure secrets at server startup
 */

const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'ADMIN_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
];

export function validateEnvironment() {
  const isTest = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('test'));
  
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const message = `[ENV WARNING] Missing critical environment variables: ${missing.join(', ')}`;
    if (isTest) {
      console.warn(`${message} (Allowed in test mode with mocks)`);
    } else {
      console.warn(`⚠️  ${message}`);
      console.warn('   Ensure these are defined in your Render/production environment dashboard.');
    }
    return false;
  }

  console.log('✅ [ENV CHECK] All critical environment variables verified.');
  return true;
}

export default validateEnvironment;
