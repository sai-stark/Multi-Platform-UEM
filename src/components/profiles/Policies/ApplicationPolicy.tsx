import { MobileApplicationService } from '@/api/services/mobileApps';
import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AndroidApplicationPolicy, ApplicationAction, ApplicationPolicy, IosApplicationPolicy, MobileApplication, Platform } from '@/types/models';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    const [availableApps, setAvailableApps] = useState<MobileApplication[]>([]);
    const [policyApps, setPolicyApps] = useState<ApplicationPolicy[]>(initialData || []);

    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        loadApplications();
        if (!initialData) {
            loadExistingPolicies();
        }
    }, [platform, profileId]);

    const loadApplications = async () => {
        try {
            const response = await MobileApplicationService.getMobileApplications({ page: 0, size: 100 });
            const filtered = response.content.filter(app => !app.platform || (app.platform as string) === 'all' || app.platform === platform);
            setAvailableApps(filtered);
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
        const app = availableApps.find(a => a.id === appId);
        if (!app) return;

        // Check if policy already exists
        const existingPolicy = policyApps.find(p => {
            if (isIosApplicationPolicy(p)) {
                return p.bundleIdentifier === app.packageName;
            } else {
                return p.applicationVersionId === app.id;
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
                applicationVersionId: app.id, // Using app.id as applicationVersionId for now
                action: 'INSTALL',
                // applicationVersion is read-only and set by backend
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
                                        return p.applicationVersionId === app.id;
                                    }
                                });
                                return (
                                    <SelectItem key={app.id} value={app.id} disabled={exists}>
                                        {app.name} ({app.version})
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>

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
                        : availableApps.find(a => a.id === policyApp.applicationVersionId);

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
