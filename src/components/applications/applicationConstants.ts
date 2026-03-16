import { CheckCircle, XCircle, Clock, Smartphone, Apple, Monitor } from 'lucide-react';
import { AppActionType } from '@/api/services/applications';
import { getAssetUrl } from '@/config/env';
import { EnterpriseService } from '@/api/services/enterprise';

// Action configuration for app status badges
export const actionConfig: Record<AppActionType, { label: string; icon: typeof CheckCircle; className: string }> = {
    MANDATORY: { label: 'Mandatory', icon: CheckCircle, className: 'status-badge--compliant' },
    OPTIONAL: { label: 'Optional', icon: Clock, className: 'status-badge--pending' },
    BLOCKED: { label: 'Blocked', icon: XCircle, className: 'status-badge--non-compliant' },
};

// Platform configuration for tabs
export const platformConfig: Record<string, {
    label: string;
    icon: React.ElementType;
    color: string;
    disabled?: boolean;
    image?: string;
}> = {
    android: {
        label: 'Android',
        icon: Smartphone,
        color: 'text-success',
        image: getAssetUrl('/Assets/android.png'),
    },
    ios: {
        label: 'iOS',
        icon: Apple,
        color: 'text-muted-foreground',
        image: getAssetUrl('/Assets/apple.png'),
    },
    windows: {
        label: 'Windows',
        icon: Monitor,
        color: 'text-info',
        disabled: true,
        image: getAssetUrl('/Assets/microsoft.png'),
    },
    macos: {
        label: 'macOS',
        icon: Apple,
        color: 'text-muted-foreground',
        image: getAssetUrl('/Assets/mac_os.png'),
    },
    linux: {
        label: 'Linux',
        icon: Monitor,
        color: 'text-info',
        disabled: true,
        image: getAssetUrl('/Assets/linux.png'),
    },
};

// Google API types for iframe integration
declare global {
    interface Window {
        gapi: {
            load: (api: string, callback: () => void) => void;
            iframes: {
                CROSS_ORIGIN_IFRAMES_FILTER: any;
                getContext: () => {
                    openChild: (options: {
                        url: string;
                        where: HTMLElement;
                        attributes: { style: string; scrolling: string };
                    }) => {
                        on: (event: string, callback: (data?: any) => void) => void;
                        register: (
                            event: string,
                            callback: (data?: any) => void,
                            filter?: any
                        ) => void;
                    };
                };
            };
        };
    }
}

// Function to get iframe token from localStorage or API
export const getIframeToken = async (
    forceRefresh: boolean = false
): Promise<string | null> => {
    try {
        const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds
        const now = Date.now();

        // Check if we should refresh based on time (every 60 minutes)
        const lastRefreshTime = localStorage.getItem("iFrameWebTokenRefreshTime");
        const shouldRefreshByTime = lastRefreshTime
            ? now - parseInt(lastRefreshTime) > TOKEN_REFRESH_INTERVAL
            : true;

        // Force refresh for token origin fix
        if (!localStorage.getItem("iFrameOriginFixApplied")) {
            localStorage.removeItem("iFrameWebToken");
            localStorage.setItem("iFrameOriginFixApplied", "true");
        }

        // First, try to get token from localStorage (unless forcing refresh or time-based refresh needed)
        if (!forceRefresh && !shouldRefreshByTime && localStorage.getItem("iFrameOriginFixApplied")) {
            const storedToken = localStorage.getItem("iFrameWebToken");
            if (storedToken) {
                if (import.meta.env.DEV) console.log("Using stored iframe token");
                return storedToken;
            }
        }

        // If no token in localStorage, forcing refresh, or time-based refresh needed
        const refreshReason = forceRefresh
            ? "forced refresh"
            : shouldRefreshByTime
                ? "time-based refresh (60 minutes)"
                : "no stored token";

        if (import.meta.env.DEV) console.log(
            `Fetching new iframe token from API (${refreshReason})`
        );

        // Fetch new token from API (no request body per spec)
        const response = await EnterpriseService.generateEnterpriseWebToken('android');
        if (import.meta.env.DEV) console.log("API response:", response);
        if (response?.webToken) {
            // Store the new token and refresh time in localStorage
            localStorage.setItem("iFrameWebToken", response.webToken);
            localStorage.setItem("iFrameWebTokenRefreshTime", now.toString());
            if (import.meta.env.DEV) console.log("New token stored and returned:", response.webToken);
            return response.webToken;
        }

        console.error("No webToken received from API");
        return null;
    } catch (error) {
        console.error("Error getting iframe token:", error);
        return null;
    }
};
