/**
 * Environment Variable Validation
 * Validates all required env vars at app startup
 */

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  razorpayKeyId: string;
  siteUrl: string;
  isDevelopment: boolean;
}

function getEnvVar(key: string, required: boolean = false): string {
  const value = import.meta.env[key];

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || '';
}

export function validateEnvironment(): AppConfig {
  const isDevelopment = import.meta.env.MODE === 'development';

  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', true);
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', true);
  const razorpayKeyId = getEnvVar('VITE_RAZORPAY_KEY_ID', true);
  const siteUrl = getEnvVar('VITE_SITE_URL', true);

  // Validate format
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!razorpayKeyId.startsWith('rzp_')) {
    throw new Error('VITE_RAZORPAY_KEY_ID must start with rzp_');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    razorpayKeyId,
    siteUrl,
    isDevelopment,
  };
}

// Validate on import
let appConfig: AppConfig | null = null;

try {
  appConfig = validateEnvironment();
} catch (error) {
  if (!import.meta.env.DEV) {
    // Fatal in production
    throw error;
  }
  // Warn in development
  console.warn('[ENV] Configuration error:', error);
}

export function getAppConfig(): AppConfig {
  if (!appConfig) {
    throw new Error('App configuration not initialized');
  }
  return appConfig;
}
