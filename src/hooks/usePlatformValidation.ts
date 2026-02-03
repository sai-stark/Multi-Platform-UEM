import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PlatformValidationResult {
    isValidating: boolean;
    shouldRender: boolean;
}

/**
 * Hook to validate that the platform in the URL matches the actual data's platform.
 * If there's a mismatch, automatically redirects to the correct URL.
 * 
 * @param urlPlatform - Platform from URL params (e.g., 'ios', 'android')
 * @param actualPlatform - Platform from the fetched data
 * @param isLoading - Whether data is still being fetched
 * @param buildCorrectPath - Function to build the correct path with the actual platform
 * 
 * @example
 * const { shouldRender } = usePlatformValidation(
 *     platform,           // from URL
 *     profile?.platform,  // from fetched data
 *     isLoading,
 *     (correctPlatform) => `/profiles/${correctPlatform}/${id}`
 * );
 * 
 * if (!shouldRender) return null;
 */
export function usePlatformValidation(
    urlPlatform: string | undefined,
    actualPlatform: string | undefined,
    isLoading: boolean,
    buildCorrectPath: (correctPlatform: string) => string
): PlatformValidationResult {
    const navigate = useNavigate();
    const location = useLocation();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Don't do anything while loading or if we've already redirected
        if (isLoading || hasRedirected.current) return;

        // If we have both platforms and they don't match, redirect
        if (urlPlatform && actualPlatform && urlPlatform.toLowerCase() !== actualPlatform.toLowerCase()) {
            hasRedirected.current = true;
            const correctPath = buildCorrectPath(actualPlatform.toLowerCase());
            console.log(`Platform mismatch: URL has "${urlPlatform}", data has "${actualPlatform}". Redirecting to ${correctPath}`);
            navigate(correctPath, { replace: true });
        }
    }, [urlPlatform, actualPlatform, isLoading, buildCorrectPath, navigate]);

    return {
        isValidating: isLoading,
        // Don't render if we're about to redirect
        shouldRender: isLoading || !actualPlatform || urlPlatform?.toLowerCase() === actualPlatform?.toLowerCase(),
    };
}

/**
 * Normalizes platform strings for comparison
 */
export function normalizePlatform(platform: string | undefined): string {
    if (!platform) return '';
    return platform.toLowerCase().trim();
}

/**
 * List of valid platforms
 */
export const VALID_PLATFORMS = ['ios', 'android', 'windows', 'macos', 'linux'] as const;
export type Platform = typeof VALID_PLATFORMS[number];

/**
 * Check if a string is a valid platform
 */
export function isValidPlatform(platform: string | undefined): platform is Platform {
    if (!platform) return false;
    return VALID_PLATFORMS.includes(platform.toLowerCase() as Platform);
}
