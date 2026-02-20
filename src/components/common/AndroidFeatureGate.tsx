import { useEnterprise } from '@/contexts/EnterpriseContext';
import { AlertTriangle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AndroidFeatureGateProps {
    children: React.ReactNode;
    featureName?: string;
}

/**
 * Component that wraps Android-specific features and shows a warning
 * when the enterprise is not enrolled but was skipped.
 * 
 * Usage:
 * <AndroidFeatureGate featureName="Android Devices">
 *   <YourAndroidFeatureComponent />
 * </AndroidFeatureGate>
 */
export function AndroidFeatureGate({ children, featureName = 'Android features' }: AndroidFeatureGateProps) {
    const { isEnrolled, isSkipped, isLoading, isDebugMode } = useEnterprise();

    if (isLoading) {
        return <>{children}</>;
    }

    // In debug mode, never block Android features
    if (isDebugMode) {
        return <>{children}</>;
    }

    // If enrolled, show normally
    if (isEnrolled) {
        return <>{children}</>;
    }

    // If skipped, show with warning banner
    if (isSkipped) {
        return (
            <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-medium text-amber-700 dark:text-amber-400">
                                Android Enterprise Not Configured
                            </h4>
                            <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                                {featureName} require Android Enterprise setup to function properly.
                                Some features may be unavailable or limited.
                            </p>
                            <Link
                                to="/android/enterprise/setup"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline mt-2"
                            >
                                <Shield className="w-4 h-4" />
                                Configure Android Enterprise
                            </Link>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        );
    }

    // Not enrolled and not skipped - redirect to setup
    return (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Android Enterprise Required</h3>
            <p className="text-muted-foreground mb-4">
                {featureName} require Android Enterprise to be configured for your organization.
            </p>
            <Link
                to="/android/enterprise/setup"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
                <Shield className="w-4 h-4" />
                Set Up Android Enterprise
            </Link>
        </div>
    );
}

/**
 * Simple hook to check if Android features should show a warning
 */
export function useAndroidFeatureWarning() {
    const { isEnrolled, isSkipped } = useEnterprise();
    
    return {
        showWarning: !isEnrolled && isSkipped,
        needsSetup: !isEnrolled && !isSkipped,
        isEnabled: isEnrolled,
    };
}
