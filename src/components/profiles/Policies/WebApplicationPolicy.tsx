import { PolicyService } from '@/api/services/policies';
import { WebApplicationService } from '@/api/services/webApps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AndroidWebApplicationPolicy, IosWebApplicationPolicy, Platform, WebApplication, WebApplicationPolicy } from '@/types/models';
import { Globe, Loader2, Smartphone, Trash2 } from 'lucide-react';
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

    // State
    const [policies, setPolicies] = useState<WebApplicationPolicy[]>(initialData || []);
    const [initialPolicies, setInitialPolicies] = useState<WebApplicationPolicy[]>(initialData || []);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        loadWebApps();
        if (!initialData) {
            loadExistingPolicies();
        } else {
            setInitialPolicies(initialData);
        }
    }, [profileId, platform]);

    const loadWebApps = async () => {
        try {
            const response = await WebApplicationService.getWebApplications({ page: 0, size: 100 });
            setAvailableWebApps(response.content);
        } catch (error) {
            console.error("Failed to load web apps, using mock data", error);
            setAvailableWebApps([
                { id: 'web1', name: 'Azure Portal', url: 'https://portal.azure.com', iconUrl: '' },
                { id: 'web2', name: 'Gmail', url: 'https://mail.google.com', iconUrl: '' },
                { id: 'web3', name: 'GitHub', url: 'https://github.com', iconUrl: '' },
                { id: 'web4', name: 'Slack', url: 'https://slack.com', iconUrl: '' },
                { id: 'web5', name: 'Jira', url: 'https://jira.atlassian.com', iconUrl: '' },
            ] as WebApplication[]);
        }
    };

    const loadExistingPolicies = async () => {
        setIsFetching(true);
        try {
            const response = await PolicyService.getWebApplicationPolicies(platform, profileId);
            setPolicies(response.content);
            setInitialPolicies(response.content);
        } catch (error) {
            console.error("Failed to load policies", error);
        } finally {
            setIsFetching(false);
        }
    }

    const handleAddApp = (webAppId: string) => {
        const app = availableWebApps.find(a => a.id === webAppId);
        if (!app) return;

        // Check for duplicates
        if (platform === 'android') {
            if (policies.some((p) => (p as AndroidWebApplicationPolicy).webAppId === webAppId)) return;
        }

        let newPolicy: WebApplicationPolicy;

        if (platform === 'ios') {
            newPolicy = {
                name: app.name,
                label: app.name,
                url: app.url,
                fullScreen: true,
                isRemovable: true,
                precomposed: true,
                ignoreManifestScope: false,
                policyType: 'IosWebApplicationPolicy'
            } as IosWebApplicationPolicy;
        } else {
            newPolicy = {
                webAppId: app.id,
                webAppName: app.name,
                keyCode: 1,
                policyType: 'AndroidWebApplicationPolicy'
            } as AndroidWebApplicationPolicy;
        }

        setPolicies([...policies, newPolicy]);
    };

    const handleRemoveApp = (index: number) => {
        const newPolicies = [...policies];
        newPolicies.splice(index, 1);
        setPolicies(newPolicies);
    };

    const updatePolicyField = (index: number, field: keyof IosWebApplicationPolicy | keyof AndroidWebApplicationPolicy, value: any) => {
        const newPolicies = [...policies];
        newPolicies[index] = { ...newPolicies[index], [field]: value };
        setPolicies(newPolicies);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Handle Deletions
            const toDelete = initialPolicies.filter(init =>
                init.id && !policies.some(curr => curr.id === init.id)
            );

            for (const policy of toDelete) {
                if (policy.id) {
                    await PolicyService.deleteWebApplicationPolicy(platform, profileId, policy.id);
                }
            }

            // 2. Handle Creations and Updates
            for (const policy of policies) {
                if (policy.id) {
                    await PolicyService.updateWebApplicationPolicy(platform, profileId, policy.id, policy);
                } else {
                    await PolicyService.createWebApplicationPolicy(platform, profileId, policy);
                }
            }

            toast({ title: "Success", description: "Web Application policies saved successfully" });
            onSave();
        } catch (error) {
            console.error("Save error", error);
            toast({ title: "Error", description: "Failed to save web application policies", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const renderIosPolicy = (policy: IosWebApplicationPolicy, index: number) => (
        <Card key={index} className="relative border-l-4 border-l-blue-500">
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRemoveApp(index)}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <Input
                        className="font-semibold text-lg max-w-[200px] h-8 p-1"
                        value={policy.label}
                        onChange={(e) => updatePolicyField(index, 'label', e.target.value)}
                        placeholder="Label"
                    />
                </div>
                <Input
                    className="text-sm text-muted-foreground h-7 p-1 max-w-md mt-1"
                    value={policy.url}
                    onChange={(e) => updatePolicyField(index, 'url', e.target.value)}
                    placeholder="https://..."
                />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`fullscreen-${index}`}
                        checked={policy.fullScreen}
                        onCheckedChange={(checked) => updatePolicyField(index, 'fullScreen', !!checked)}
                    />
                    <Label htmlFor={`fullscreen-${index}`}>Full Screen</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`removable-${index}`}
                        checked={policy.isRemovable}
                        onCheckedChange={(checked) => updatePolicyField(index, 'isRemovable', !!checked)}
                    />
                    <Label htmlFor={`removable-${index}`}>Removable</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`precomposed-${index}`}
                        checked={policy.precomposed}
                        onCheckedChange={(checked) => updatePolicyField(index, 'precomposed', !!checked)}
                    />
                    <Label htmlFor={`precomposed-${index}`}>Precomposed Icon</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`scope-${index}`}
                        checked={policy.ignoreManifestScope}
                        onCheckedChange={(checked) => updatePolicyField(index, 'ignoreManifestScope', !!checked)}
                    />
                    <Label htmlFor={`scope-${index}`}>Ignore Scope</Label>
                </div>
            </CardContent>
        </Card>
    );

    const renderAndroidPolicy = (policy: AndroidWebApplicationPolicy, index: number) => (
        <Card key={index} className="relative border-l-4 border-l-green-500">
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRemoveApp(index)}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-green-500" />
                    {getAppName(policy.webAppId) || policy.webAppName || 'Unknown Web App'}
                </CardTitle>
                <CardDescription className="text-xs font-mono">{policy.webAppId}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="items-center gap-4 max-w-xs">
                    <Label htmlFor={`keycode-${index}`}>Key Code (&ge; 1)</Label>
                    <Input
                        id={`keycode-${index}`}
                        type="number"
                        min={1}
                        value={policy.keyCode}
                        onChange={(e) => updatePolicyField(index, 'keyCode', parseInt(e.target.value))}
                        className="mt-1"
                    />
                </div>
            </CardContent>
        </Card>
    );

    const getAppName = (id: string) => availableWebApps.find(a => a.id === id)?.name;

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div className="space-y-2 flex-1">
                    <Label htmlFor="webapp-select">Add Web Application</Label>
                    <Select onValueChange={handleAddApp}>
                        <SelectTrigger id="webapp-select">
                            <SelectValue placeholder="Select web application from inventory" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableWebApps.map(app => (
                                <SelectItem key={app.id} value={app.id}>
                                    {app.name} ({app.url})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {policies.length === 0 && (
                    <div className="text-center p-8 border rounded-lg text-muted-foreground border-dashed">
                        {isFetching ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading policies...
                            </div>
                        ) : "No web applications configured. Add one from the list above."}
                    </div>
                )}
                {policies.map((policy, index) => (
                    platform === 'ios'
                        ? renderIosPolicy(policy as IosWebApplicationPolicy, index)
                        : renderAndroidPolicy(policy as AndroidWebApplicationPolicy, index)
                ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Policies'}
                </Button>
            </div>
        </div>
    );
};
