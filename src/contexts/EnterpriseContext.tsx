import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnterpriseService } from '@/api/services/enterprise';
import { AndroidEnterprise } from '@/types/models';

interface EnterpriseContextType {
    enterprise: AndroidEnterprise | null;
    isEnrolled: boolean;
    isLoading: boolean;
    isSkipped: boolean;
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
 * Hook to check if Android features should be enabled
 */
export function useAndroidFeaturesEnabled() {
    const { isEnrolled, isSkipped, isLoading } = useEnterprise();
    return {
        isEnabled: isEnrolled,
        isSkipped,
        isLoading,
        needsSetup: !isEnrolled && !isSkipped,
    };
}

/**
 * Component that wraps the app and redirects to enrollment if needed
 * Used to guard routes that require enrollment
 */
export function EnrollmentGuard({ children }: { children: ReactNode }) {
    const { isEnrolled, isSkipped, isLoading } = useEnterprise();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Don't redirect while loading
        if (isLoading) return;

        // Don't redirect if already on the enrollment pages
        const isEnrollmentPage = location.pathname.includes('/android/enterprise/');
        if (isEnrollmentPage) return;

        // If not enrolled and not skipped, redirect to setup
        if (!isEnrolled && !isSkipped) {
            navigate('/android/enterprise/setup', { replace: true });
        }
    }, [isEnrolled, isSkipped, isLoading, location.pathname, navigate]);

    // Show nothing while loading (or a loader)
    if (isLoading) {
        return null;
    }

    return <>{children}</>;
}

