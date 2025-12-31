import { MobileApplicationService } from '@/api/services/mobileApps';
import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ApplicationPolicy, MobileApplication, Platform } from '@/types/models';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ApplicationPolicyProps {
    profileId: string;
    platform: Platform;
    initialData?: ApplicationPolicy[];
    onSave: () => void;
    onCancel: () => void;
}

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
            setPolicyApps(response.content);
        } catch (error) {
            console.error("Failed to load policies", error);
            // Don't show error if 404/empty, just assume empty?
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddApp = (appId: string) => {
        if (policyApps.some(p => p.applicationId === appId)) return;
        const app = availableApps.find(a => a.id === appId);
        if (!app) return;

        setPolicyApps([...policyApps, {
            applicationId: app.id,
            packageName: app.packageName,
            installType: 'REQUIRED',
            autoUpdateMode: 'WIFI_ONLY',
            disabled: false,
            permission: 'GRANT'
        }]);
    };

    const handleRemoveApp = async (appId: string) => { // appId here refers to policy.applicationId
        // If generic removal from list:
        setPolicyApps(policyApps.filter(p => p.applicationId !== appId));
    };

    const updateAppConfig = (appId: string, field: keyof ApplicationPolicy, value: any) => {
        setPolicyApps(policyApps.map(p => {
            if (p.applicationId === appId) {
                return { ...p, [field]: value };
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
                            {availableApps.map(app => (
                                <SelectItem key={app.id} value={app.id} disabled={policyApps.some(p => p.applicationId === app.id)}>
                                    {app.name} ({app.version})
                                </SelectItem>
                            ))}
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
                {policyApps.map((policyApp, index) => {
                    const appDetails = availableApps.find(a => a.id === policyApp.applicationId);
                    // If app details not found (e.g. policy for app not in current page of apps), we fall back
                    return (
                        <Card key={policyApp.applicationId} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveApp(policyApp.applicationId)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{appDetails?.name || policyApp.packageName || policyApp.applicationId}</CardTitle>
                                <CardDescription>{policyApp.packageName}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Install Type</Label>
                                    <Select
                                        value={policyApp.installType}
                                        onValueChange={(val) => updateAppConfig(policyApp.applicationId, 'installType', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="REQUIRED">Required</SelectItem>
                                            <SelectItem value="AVAILABLE">Available</SelectItem>
                                            <SelectItem value="BLOCKED">Blocked</SelectItem>
                                            <SelectItem value="FORCE_INSTALLED">Force Installed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Auto Update Mode</Label>
                                    <Select
                                        value={policyApp.autoUpdateMode}
                                        onValueChange={(val) => updateAppConfig(policyApp.applicationId, 'autoUpdateMode', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WIFI_ONLY">WiFi Only</SelectItem>
                                            <SelectItem value="ALWAYS">Always</SelectItem>
                                            <SelectItem value="NEVER">Never</SelectItem>
                                            <SelectItem value="CHOICE_TO_THE_USER">User Choice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id={`disabled-${policyApp.applicationId}`}
                                        checked={policyApp.disabled}
                                        onCheckedChange={(checked) => updateAppConfig(policyApp.applicationId, 'disabled', !!checked)}
                                    />
                                    <Label htmlFor={`disabled-${policyApp.applicationId}`}>Disabled / Unavailable</Label>
                                </div>
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
