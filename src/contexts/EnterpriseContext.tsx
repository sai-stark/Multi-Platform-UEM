import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EnterpriseService } from '@/api/services/enterprise';
import { AndroidEnterprise } from '@/types/models';

// Debug mode: true in development, false in production --> temporaily i changes to true later this will be removed for Actual deployment to the Client.
// const isDebugMode = import.meta.env.MODE !== 'production';
const isDebugMode = true;

interface EnterpriseContextType {
    enterprise: AndroidEnterprise | null;
    isEnrolled: boolean;
    isLoading: boolean;
    isSkipped: boolean;
    isDebugMode: boolean;
    checkEnrollmentStatus: () => Promise<void>;
    skipEnrollment: () => void;
    markEnrolled: () => void;
    resetSkip: () => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

// Storage keys - exported so they can be set by Keycloak login handler
export const SKIP_STORAGE_KEY = 'android-enterprise-skipped';
export const ENROLLED_STORAGE_KEY = 'android-enterprise-enrolled';

export function EnterpriseProvider({ children }: { children: ReactNode }) {
    const [enterprise, setEnterprise] = useState<AndroidEnterprise | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSkipped, setIsSkipped] = useState(() => {
        return localStorage.getItem(SKIP_STORAGE_KEY) === 'true';
    });
    const [isEnrolled, setIsEnrolled] = useState(() => {
        return localStorage.getItem(ENROLLED_STORAGE_KEY) === 'true';
    });

    const checkEnrollmentStatus = async () => {
        setIsLoading(true);
        try {
            const result = await EnterpriseService.getEnterprise('android');
            // Validate that we have actual enterprise data
            if (result && result.id && result.enterpriseDisplayName) {
                setEnterprise(result);
                // Mark as enrolled if we got valid data from API
                localStorage.setItem(ENROLLED_STORAGE_KEY, 'true');
                setIsEnrolled(true);
                // Clear any skip flag
                localStorage.removeItem(SKIP_STORAGE_KEY);
                setIsSkipped(false);
            } else {
                setEnterprise(null);
            }
        } catch (error) {
            // No enterprise configured - check localStorage for previous enrollment
            setEnterprise(null);
        } finally {
            setIsLoading(false);
        }
    };

    const skipEnrollment = () => {
        localStorage.setItem(SKIP_STORAGE_KEY, 'true');
        setIsSkipped(true);
    };

    const markEnrolled = () => {
        localStorage.setItem(ENROLLED_STORAGE_KEY, 'true');
        setIsEnrolled(true);
        localStorage.removeItem(SKIP_STORAGE_KEY);
        setIsSkipped(false);
    };

    const resetSkip = () => {
        localStorage.removeItem(SKIP_STORAGE_KEY);
        setIsSkipped(false);
    };

    // Check enrollment status on mount
    useEffect(() => {
        checkEnrollmentStatus();
    }, []);

    return (
        <EnterpriseContext.Provider
            value={{
                enterprise,
                isEnrolled,
                isLoading,
                isSkipped,
                isDebugMode,
                checkEnrollmentStatus,
                skipEnrollment,
                markEnrolled,
                resetSkip,
            }}
        >
            {children}
        </EnterpriseContext.Provider>
    );
}

export function useEnterprise() {
    const context = useContext(EnterpriseContext);
    if (context === undefined) {
        throw new Error('useEnterprise must be used within an EnterpriseProvider');
    }
    return context;
}

/**
 * Hook to check if Android features should be enabled.
 * In debug mode, Android features are always enabled.
 * In production, they require enterprise enrollment.
 */
export function useAndroidFeaturesEnabled() {
    const { isEnrolled, isSkipped, isLoading } = useEnterprise();
    return {
        isEnabled: isDebugMode || isEnrolled,
        isSkipped,
        isLoading,
        isDebugMode,
        needsSetup: !isDebugMode && !isEnrolled && !isSkipped,
        /** True when Android platform tab/features should be blocked */
        shouldBlock: !isDebugMode && !isEnrolled,
    };
}

/**
 * Passthrough wrapper — no longer redirects to enterprise setup on load.
 * Enterprise setup is now prompted when Android platform is selected.
 */
export function EnrollmentGuard({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

