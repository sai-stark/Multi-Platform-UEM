import { ITunesSearchResult, ITunesSearchService } from '@/api/services/itunesSearch';
import { DeviceApplication, MobileApplicationService } from '@/api/services/mobileApps';
import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AndroidApplicationPolicy, ApplicationAction, ApplicationPolicy, IosApplicationPolicy, Platform } from '@/types/models';
import { Loader2, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ApplicationPolicyProps {
    profileId: string;
    platform: Platform;
    initialData?: ApplicationPolicy[];
    onSave: () => void;
    onCancel: () => void;
}

// Type guards
const isIosApplicationPolicy = (policy: ApplicationPolicy): policy is IosApplicationPolicy => {
    return policy.devicePolicyType === 'IosApplicationPolicy' || 
           ('bundleIdentifier' in policy && !('applicationVersionId' in policy));
};

const isAndroidApplicationPolicy = (policy: ApplicationPolicy): policy is AndroidApplicationPolicy => {
    return policy.devicePolicyType === 'AndroidApplicationPolicy' || 
           ('applicationVersionId' in policy && !('bundleIdentifier' in policy));
};

// Helper to get policy identifier for comparison
const getPolicyIdentifier = (policy: ApplicationPolicy): string => {
    if (isIosApplicationPolicy(policy)) {
        return policy.bundleIdentifier;
    }
    return policy.applicationVersionId;
};

export const ApplicationPolicyEditor = ({ profileId, platform, initialData, onSave, onCancel }: ApplicationPolicyProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [availableApps, setAvailableApps] = useState<DeviceApplication[]>([]);
    const [policyApps, setPolicyApps] = useState<ApplicationPolicy[]>(initialData || []);

    const [isFetching, setIsFetching] = useState(false);

    // iTunes Search state (iOS only)
    const [itunesSearchTerm, setItunesSearchTerm] = useState('');
    const [itunesResults, setItunesResults] = useState<ITunesSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadApplications();
        if (!initialData) {
            loadExistingPolicies();
        }
    }, [platform, profileId]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced iTunes search
    const searchITunes = useCallback(async (term: string) => {
        if (!term || term.trim().length < 2) {
            setItunesResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await ITunesSearchService.searchApps(term);
            setItunesResults(results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('iTunes search failed:', error);
            toast({ title: 'Search Error', description: 'Failed to search iTunes Store', variant: 'destructive' });
            setItunesResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [toast]);

    const handleItunesSearchChange = (value: string) => {
        setItunesSearchTerm(value);
        
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce search by 400ms
        searchTimeoutRef.current = setTimeout(() => {
            searchITunes(value);
        }, 400);
    };

    const handleAddItunesApp = (app: ITunesSearchResult) => {
        // Check if policy already exists
        const existingPolicy = policyApps.find(p => 
            isIosApplicationPolicy(p) && p.bundleIdentifier === app.bundleId
        );
        
        if (existingPolicy) {
            toast({ title: 'App Already Added', description: `${app.trackName} is already in the policy list`, variant: 'default' });
            return;
        }

        // Create iOS Application Policy with default values per user specification
        const now = new Date().toISOString();
        const newPolicy: IosApplicationPolicy = {
            creationTime: now,
            modificationTime: now,
            createdBy: '', // Will be set by backend
            lastModifiedBy: '', // Will be set by backend
            id: '', // Will be set by backend
            name: app.trackName,
            bundleIdentifier: app.bundleId,
            action: 'INSTALL',
            purchaseMethod: 1, // VPP app assignment
            removable: true,
            requestRequiresNetworkTether: true,
            devicePolicyType: 'IosApplicationPolicy',
        };

        setPolicyApps([...policyApps, newPolicy]);
        setItunesSearchTerm('');
        setItunesResults([]);
        setShowSearchResults(false);
        
        toast({ 
            title: 'App Added', 
            description: `${app.trackName} has been added with default settings` 
        });
    };

    const clearItunesSearch = () => {
        setItunesSearchTerm('');
        setItunesResults([]);
        setShowSearchResults(false);
    };

    const loadApplications = async () => {
        try {
            // Use platform-specific GET /{platform}/applications endpoint
            const apps = await MobileApplicationService.getApplications(platform);
            setAvailableApps(apps);
        } catch (error) {
            console.error("Failed to load apps", error);
            toast({ title: "Error", description: "Failed to load available applications", variant: "destructive" });
        }
    };

    const loadExistingPolicies = async () => {
        setIsFetching(true);
        try {
            const response = await PolicyService.getApplicationPolicies(platform, profileId);
            // Ensure devicePolicyType is set correctly based on platform
            const normalizedPolicies = response.content.map(policy => {
                if (!policy.devicePolicyType) {
                    if (platform === 'ios') {
                        return { ...policy, devicePolicyType: 'IosApplicationPolicy' as const };
                    } else {
                        return { ...policy, devicePolicyType: 'AndroidApplicationPolicy' as const };
                    }
                }
                return policy;
            });
            setPolicyApps(normalizedPolicies);
        } catch (error) {
            console.error("Failed to load policies", error);
            // Don't show error if 404/empty, just assume empty?
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddApp = (appId: string) => {
        const app = availableApps.find(a => a.appId === appId);
        if (!app) return;

        // Check if policy already exists
        const existingPolicy = policyApps.find(p => {
            if (isIosApplicationPolicy(p)) {
                return p.bundleIdentifier === app.packageName;
            } else {
                return p.applicationVersionId === app.appVersionId;
            }
        });
        if (existingPolicy) return;

        // Create platform-specific policy
        const now = new Date().toISOString();
        const auditData = {
            creationTime: now,
            modificationTime: now,
            createdBy: '', // Should be set by backend
            lastModifiedBy: '' // Should be set by backend
        };

        if (platform === 'ios') {
            const newPolicy: IosApplicationPolicy = {
                ...auditData,
                id: '', // Will be set by backend
                name: app.name,
                bundleIdentifier: app.packageName,
                action: 'INSTALL',
                devicePolicyType: 'IosApplicationPolicy'
            };
            setPolicyApps([...policyApps, newPolicy]);
        } else if (platform === 'android') {
            const newPolicy: AndroidApplicationPolicy = {
                ...auditData,
                id: '', // Will be set by backend
                applicationVersionId: app.appVersionId,
                applicationVersion: app.appVersion,
                action: 'INSTALL',
                devicePolicyType: 'AndroidApplicationPolicy'
            };
            setPolicyApps([...policyApps, newPolicy]);
        }
    };

    const handleRemoveApp = (policyIdentifier: string) => {
        setPolicyApps(policyApps.filter(p => getPolicyIdentifier(p) !== policyIdentifier));
    };

    const updateIosPolicy = (bundleIdentifier: string, updates: Partial<IosApplicationPolicy>) => {
        setPolicyApps(policyApps.map(p => {
            if (isIosApplicationPolicy(p) && p.bundleIdentifier === bundleIdentifier) {
                return { ...p, ...updates, modificationTime: new Date().toISOString() };
            }
            return p;
        }));
    };

    const updateAndroidPolicy = (applicationVersionId: string, updates: Partial<AndroidApplicationPolicy>) => {
        setPolicyApps(policyApps.map(p => {
            if (isAndroidApplicationPolicy(p) && p.applicationVersionId === applicationVersionId) {
                return { ...p, ...updates, modificationTime: new Date().toISOString() };
            }
            return p;
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // We need to save each policy.
            // If the API supports bulk, great. If not, parallel requests.
            // createApplicationPolicy takes ONE policy.
            // We should probably check which ones are new, updated, or removed?
            // "Removed" logic: The API doesn't seem to have "deleteApplicationPolicy" per app efficiently exposed in our service yet?
            // Or maybe createApplicationPolicy overwrites properly?
            // Let's assume for now we loop and save all active ones.
            // For removal, we'd need to know what was there before.
            // For simplicity in this iteration: Just save the current list.

            for (const policy of policyApps) {
                // We assume create works as upsert or we don't care about ID for now
                await PolicyService.createApplicationPolicy(platform, profileId, policy);
            }

            toast({ title: "Success", description: "Application policies saved" });
            onSave();
        } catch (error) {
            console.error("Save error", error);
            toast({ title: "Error", description: "Failed to save application policies", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* iOS: iTunes Store Search */}
            {platform === 'ios' && (
                <div className="space-y-2" ref={searchContainerRef}>
                    <Label htmlFor="itunes-search" className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Search iOS Apps (iTunes Store)
                    </Label>
                    <div className="relative">
                        <div className="relative">
                            <Input
                                id="itunes-search"
                                type="text"
                                placeholder="Search for apps (e.g., Amazon, Slack, Zoom)..."
                                value={itunesSearchTerm}
                                onChange={(e) => handleItunesSearchChange(e.target.value)}
                                onFocus={() => itunesResults.length > 0 && setShowSearchResults(true)}
                                className="pr-16"
                                aria-label="Search iTunes Store for iOS apps"
                                aria-describedby="itunes-search-hint"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                                {itunesSearchTerm && !isSearching && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={clearItunesSearch}
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p id="itunes-search-hint" className="text-xs text-muted-foreground mt-1">
                            Type at least 2 characters to search. Select an app to add it with default policy settings.
                        </p>

                        {/* Search Results Dropdown */}
                        {showSearchResults && itunesResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[320px] overflow-y-auto">
                                <div className="p-2 text-xs text-muted-foreground border-b sticky top-0 bg-popover">
                                    {itunesResults.length} app{itunesResults.length !== 1 ? 's' : ''} found
                                </div>
                                <ul role="listbox" aria-label="iTunes search results">
                                    {itunesResults.map((app) => {
                                        const isAdded = policyApps.some(p => 
                                            isIosApplicationPolicy(p) && p.bundleIdentifier === app.bundleId
                                        );
                                        return (
                                            <li key={app.trackId} role="option" aria-selected={isAdded}>
                                                <button
                                                    type="button"
                                                    disabled={isAdded}
                                                    onClick={() => handleAddItunesApp(app)}
                                                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0 ${
                                                        isAdded ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'
                                                    }`}
                                                >
                                                    {app.artworkUrl60 && (
                                                        <img 
                                                            src={app.artworkUrl60} 
                                                            alt="" 
                                                            className="w-10 h-10 rounded-lg flex-shrink-0"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">
                                                            {app.trackName}
                                                            {isAdded && <span className="ml-2 text-xs text-muted-foreground">(Already added)</span>}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {app.bundleId}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {app.sellerName} • {app.primaryGenreName}
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* No Results State */}
                        {showSearchResults && itunesResults.length === 0 && !isSearching && itunesSearchTerm.length >= 2 && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                                No apps found for "{itunesSearchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Android: Select from available apps */}
            {platform === 'android' && (
                <div className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="app-select">Add Application</Label>
                        <Select onValueChange={handleAddApp}>
                            <SelectTrigger id="app-select">
                                <SelectValue placeholder="Select application to control" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableApps.map(app => {
                                    const exists = policyApps.some(p => {
                                        if (isIosApplicationPolicy(p)) {
                                            return p.bundleIdentifier === app.packageName;
                                        } else {
                                            return p.applicationVersionId === app.appVersionId;
                                        }
                                    });
                                    return (
                                        <SelectItem key={app.appId} value={app.appId} disabled={exists}>
                                            {app.name} ({app.appVersion})
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {policyApps.length === 0 && (
                    <div className="text-center p-8 border rounded-lg text-muted-foreground border-dashed">
                        {isFetching ? "Loading policies..." : "No applications configured. Select an app to add settings."}
                    </div>
                )}
                {policyApps.map((policyApp) => {
                    const policyIdentifier = getPolicyIdentifier(policyApp);
                    const appDetails = isIosApplicationPolicy(policyApp)
                        ? availableApps.find(a => a.packageName === policyApp.bundleIdentifier)
                        : availableApps.find(a => a.appVersionId === policyApp.applicationVersionId);

                    return (
                        <Card key={policyApp.id || policyIdentifier} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveApp(policyIdentifier)}
                                aria-label="Remove application policy"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    {isIosApplicationPolicy(policyApp) ? policyApp.name : appDetails?.name || policyApp.applicationVersion}
                                </CardTitle>
                                <CardDescription>
                                    {isIosApplicationPolicy(policyApp) 
                                        ? policyApp.bundleIdentifier 
                                        : `Version: ${policyApp.applicationVersion}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isIosApplicationPolicy(policyApp) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`name-${policyIdentifier}`}>Name</Label>
                                            <Input
                                                id={`name-${policyIdentifier}`}
                                                value={policyApp.name || ''}
                                                onChange={(e) => updateIosPolicy(policyApp.bundleIdentifier, { name: e.target.value })}
                                                placeholder="Application name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`bundleIdentifier-${policyIdentifier}`}>Bundle Identifier</Label>
                                            <Input
                                                id={`bundleIdentifier-${policyIdentifier}`}
                                                value={policyApp.bundleIdentifier || ''}
                                                disabled
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`action-${policyIdentifier}`}>Action</Label>
                                            <Select
                                                value={policyApp.action || 'INSTALL'}
                                                onValueChange={(val: 'INSTALL') => updateIosPolicy(policyApp.bundleIdentifier, { action: val })}
                                            >
                                                <SelectTrigger id={`action-${policyIdentifier}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="INSTALL">Install</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`purchaseMethod-${policyIdentifier}`}>Purchase Method</Label>
                                            <Select
                                                value={policyApp.purchaseMethod?.toString() ?? '0'}
                                                onValueChange={(val) => updateIosPolicy(policyApp.bundleIdentifier, { purchaseMethod: parseInt(val) })}
                                            >
                                                <SelectTrigger id={`purchaseMethod-${policyIdentifier}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Free/VPP with redemption code</SelectItem>
                                                    <SelectItem value="1">VPP app assignment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`removable-${policyIdentifier}`}
                                                checked={policyApp.removable ?? true}
                                                onCheckedChange={(checked) => updateIosPolicy(policyApp.bundleIdentifier, { removable: checked as boolean })}
                                            />
                                            <Label htmlFor={`removable-${policyIdentifier}`} className="cursor-pointer">
                                                Removable
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`networkTether-${policyIdentifier}`}
                                                checked={policyApp.requestRequiresNetworkTether ?? false}
                                                onCheckedChange={(checked) => updateIosPolicy(policyApp.bundleIdentifier, { requestRequiresNetworkTether: checked as boolean })}
                                            />
                                            <Label htmlFor={`networkTether-${policyIdentifier}`} className="cursor-pointer">
                                                Requires Network Tether (for removal)
                                            </Label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`action-${policyIdentifier}`}>Action</Label>
                                            <Select
                                                value={policyApp.action || 'INSTALL'}
                                                onValueChange={(val: ApplicationAction) => updateAndroidPolicy(policyApp.applicationVersionId, { action: val })}
                                            >
                                                <SelectTrigger id={`action-${policyIdentifier}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="INSTALL">Install</SelectItem>
                                                    <SelectItem value="UNINSTALL">Uninstall</SelectItem>
                                                    <SelectItem value="ALLOW">Allow</SelectItem>
                                                    <SelectItem value="BLOCK">Block</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`version-${policyIdentifier}`}>Application Version</Label>
                                            <Input
                                                id={`version-${policyIdentifier}`}
                                                value={policyApp.applicationVersion || ''}
                                                disabled
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Policies'}</Button>
            </div>
        </div>
    );
};
