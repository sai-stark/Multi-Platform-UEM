import { PolicyService } from '@/api/services/policies';
import { WebApplicationService } from '@/api/services/webApps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Platform, WebApplication, WebApplicationPolicy } from '@/types/models';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WebApplicationPolicyProps {
    profileId: string;
    platform: Platform;
    initialData?: WebApplicationPolicy[];
    onSave: () => void;
    onCancel: () => void;
}

export const WebApplicationPolicyEditor = ({ profileId, platform, initialData, onSave, onCancel }: WebApplicationPolicyProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [availableWebApps, setAvailableWebApps] = useState<WebApplication[]>([]);
    const [policyWebApps, setPolicyWebApps] = useState<WebApplicationPolicy[]>(initialData || []);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        loadWebApps();
        if (!initialData) {
            loadExistingPolicies();
        }
    }, [profileId, platform]);

    const loadWebApps = async () => {
        try {
            const response = await WebApplicationService.getWebApplications({ page: 0, size: 100 });
            setAvailableWebApps(response.content);
        } catch (error) {
            console.error("Failed to load web apps", error);
            toast({ title: "Error", description: "Failed to load web applications", variant: "destructive" });
        }
    };

    const loadExistingPolicies = async () => {
        setIsFetching(true);
        try {
            const response = await PolicyService.getWebApplicationPolicies(platform, profileId);
            setPolicyWebApps(response.content);
        } catch (error) {
            // Ignore
        } finally {
            setIsFetching(false);
        }
    }

    const handleAddApp = (webAppId: string) => {
        if (policyWebApps.some(p => p.webApplicationId === webAppId)) return;
        const app = availableWebApps.find(a => a.id === webAppId);
        if (!app) return;

        setPolicyWebApps([...policyWebApps, {
            webApplicationId: app.id,
            url: app.url,
            label: app.name,
            isAllowed: true,
            allowCookies: true
        }]);
    };

    const handleRemoveApp = (webAppId: string) => {
        setPolicyWebApps(policyWebApps.filter(p => p.webApplicationId !== webAppId));
    };

    const updateAppConfig = (webAppId: string, field: keyof WebApplicationPolicy, value: any) => {
        setPolicyWebApps(policyWebApps.map(p => {
            if (p.webApplicationId === webAppId) {
                return { ...p, [field]: value };
            }
            return p;
        }));
    };


    const handleSave = async () => {
        setLoading(true);
        try {
            for (const policy of policyWebApps) {
                await PolicyService.createWebApplicationPolicy(platform, profileId, policy);
            }

            toast({ title: "Success", description: "Web Application policies saved" });
            onSave();
        } catch (error) {
            console.error("Save error", error);
            toast({ title: "Error", description: "Failed to save web application policies", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div className="space-y-2 flex-1">
                    <Label htmlFor="webapp-select">Add Web Application</Label>
                    <Select onValueChange={handleAddApp}>
                        <SelectTrigger id="webapp-select">
                            <SelectValue placeholder="Select web application" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableWebApps.map(app => (
                                <SelectItem key={app.id} value={app.id} disabled={policyWebApps.some(p => p.webApplicationId === app.id)}>
                                    {app.name} ({app.url})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {policyWebApps.length === 0 && (
                    <div className="text-center p-8 border rounded-lg text-muted-foreground border-dashed">
                        {isFetching ? "Loading policies..." : "No web applications configured."}
                    </div>
                )}
                {policyWebApps.map((policyApp, index) => {
                    const appDetails = availableWebApps.find(a => a.id === policyApp.webApplicationId);
                    return (
                        <Card key={policyApp.webApplicationId} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveApp(policyApp.webApplicationId)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{appDetails?.name || policyApp.label || policyApp.webApplicationId}</CardTitle>
                                <CardDescription>{appDetails?.url || policyApp.url}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id={`allowed-${policyApp.webApplicationId}`}
                                        checked={policyApp.isAllowed}
                                        onCheckedChange={(checked) => updateAppConfig(policyApp.webApplicationId, 'isAllowed', !!checked)}
                                    />
                                    <Label htmlFor={`allowed-${policyApp.webApplicationId}`}>Allow this Web Application shortcut</Label>
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
