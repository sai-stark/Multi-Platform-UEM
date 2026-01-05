/**
 * Environment Configuration Module
 *
 * Supports both build-time (Vite env vars) and runtime (window.__RUNTIME_CONFIG__)
 * configuration. Runtime config takes priority in production mode.
 */

// Extend Window interface for runtime config
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_BASE_URL?: string;
      DEPLOYMENT_PREFIX_PATH?: string;
      AUTHENTICATED_PREFIX_PATH?: string;
    };
  }
}

/**
 * Check if a runtime config value is valid (not a placeholder)
 */
function isValidRuntimeValue(value: string | undefined): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('__') &&
    !value.endsWith('__')
  );
}

/**
 * Get runtime config value if valid, otherwise return undefined
 */
function getRuntimeValue(key: keyof NonNullable<Window['__RUNTIME_CONFIG__']>): string | undefined {
  const runtimeConfig = window.__RUNTIME_CONFIG__;
  if (!runtimeConfig) return undefined;

  const value = runtimeConfig[key];
  return isValidRuntimeValue(value) ? value : undefined;
}

/**
 * Determine if we're in production mode
 */
const isProduction = import.meta.env.MODE === 'production';

/**
 * Get the deployment prefix path
 * - Production: Prioritizes runtime config, falls back to build-time env
 * - Development: Uses build-time env directly
 */
function getDeploymentPrefixPath(): string {
  if (isProduction) {
    const runtimeValue = getRuntimeValue('DEPLOYMENT_PREFIX_PATH');
    if (runtimeValue) return runtimeValue;
  }

  // Build-time value (from .env files)
  const buildTimeValue = import.meta.env.VITE_DEPLOYMENT_PREFIX_PATH;
  return buildTimeValue || '/wp/';
}

/**
 * Get the authenticated prefix path
 * - Production: Prioritizes runtime config, falls back to build-time env
 * - Development: Uses build-time env directly
 */
function getAuthenticatedPrefixPath(): string {
  if (isProduction) {
    const runtimeValue = getRuntimeValue('AUTHENTICATED_PREFIX_PATH');
    if (runtimeValue) return runtimeValue;
  }

  // Build-time value (from .env files)
  const buildTimeValue = import.meta.env.VITE_AUTHENTICATED_PREFIX_PATH;
  return buildTimeValue || 'ui';
}

/**
 * Get the API base URL
 * - Production: Prioritizes runtime config, falls back to build-time env
 * - Development: Uses build-time env directly
 */
function getApiBaseUrl(): string {
  if (isProduction) {
    const runtimeValue = getRuntimeValue('API_BASE_URL');
    if (runtimeValue) return runtimeValue;
  }

  const buildTimeValue = import.meta.env.VITE_API_BASE_URL;
  return buildTimeValue || '/api';
}

// Export individual values
export const deploymentPrefixPath = getDeploymentPrefixPath();
export const authenticatedPrefixPath = getAuthenticatedPrefixPath();
export const apiBaseUrl = getApiBaseUrl();

/**
 * Get the full URL for a public asset
 * Prepends the deployment prefix path to asset URLs
 * @param assetPath - Path to the asset (e.g., '/Assets/android.png')
 * @returns Full asset URL with base path
 */
export function getAssetUrl(assetPath: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const basePath = deploymentPrefixPath.endsWith('/')
    ? deploymentPrefixPath
    : `${deploymentPrefixPath}/`;
  return `${basePath}${cleanPath}`;
}

// Export combined config object
export const config = {
  deploymentPrefixPath,
  authenticatedPrefixPath,
  apiBaseUrl,
  isProduction,
  mode: import.meta.env.MODE,
} as const;

// Validate required values in production
if (isProduction) {
  const missingVars: string[] = [];

  if (!deploymentPrefixPath) {
    missingVars.push('DEPLOYMENT_PREFIX_PATH');
  }
  if (!authenticatedPrefixPath) {
    missingVars.push('AUTHENTICATED_PREFIX_PATH');
  }

  if (missingVars.length > 0) {
    console.warn(
      `[Config] Missing required configuration in production: ${missingVars.join(', ')}. ` +
        'Ensure runtime config is properly injected or build-time env vars are set.'
    );
  }
}

// Log config in development for debugging
if (!isProduction) {
  console.log('[Config] Environment configuration:', config);
}

export default config;
