import { PolicyService } from "@/api/services/policies";
import { WebApplicationService } from "@/api/services/webApps";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AndroidWebApplicationPolicy, IosWebApplicationPolicy, WebApplication } from "@/types/models";
import { Globe, Layout, Loader2, Pencil, Plus, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WebApplicationPolicyProps {
    profileId: string;
    platform: "android" | "ios" | "windows" | "macos" | "linux";
    readonly?: boolean;
}

export function WebApplicationPolicyEditor({
    profileId,
    platform,
    readonly = false,
}: WebApplicationPolicyProps) {
    const [policies, setPolicies] = useState<(AndroidWebApplicationPolicy | IosWebApplicationPolicy)[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<(AndroidWebApplicationPolicy | IosWebApplicationPolicy) | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Android specific state
    const [webApps, setWebApps] = useState<WebApplication[]>([]);
    const [webAppsLoading, setWebAppsLoading] = useState(false);

    // Form States
    // iOS
    const [iosForm, setIosForm] = useState<Partial<IosWebApplicationPolicy>>({
        name: "",
        label: "",
        url: "",
        fullScreen: false,
        isRemovable: true,
        precomposed: false,
        ignoreManifestScope: false,
    });

    // Android
    const [androidForm, setAndroidForm] = useState<Partial<AndroidWebApplicationPolicy>>({
        webAppId: "",
        keyCode: 0,
        screenOrder: 0,
        screenBottom: false,
    });
    const [positionType, setPositionType] = useState<"order" | "bottom">("order");

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const response = await PolicyService.getWebApplicationPolicies(platform as any, profileId);
            setPolicies(response.content || []);
        } catch (error) {
            console.error("Failed to fetch policies", error);
            toast.error("Failed to load web application policies");
        } finally {
            setLoading(false);
        }
    };

    const fetchWebApps = async () => {
        if (platform !== 'android') return;
        setWebAppsLoading(true);
        try {
            const response = await WebApplicationService.getWebApplications({ page: 0, size: 100 });
            setWebApps(response.content || []);
        } catch (error) {
            console.error("Failed to fetch web apps", error);
            toast.error("Failed to load web applications catalog");
        } finally {
            setWebAppsLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
        if (platform === 'android') {
            fetchWebApps();
        }
    }, [profileId, platform]);

    const handleOpenDialog = (policy?: AndroidWebApplicationPolicy | IosWebApplicationPolicy) => {
        setEditingPolicy(policy || null);
        if (platform === 'ios') {
            if (policy) {
                setIosForm(policy as IosWebApplicationPolicy);
            } else {
                setIosForm({
                    name: "",
                    label: "",
                    url: "",
                    fullScreen: false,
                    isRemovable: true,
                    precomposed: false, // Default from spec isn't explicitly true/false but false is safer standard
                    ignoreManifestScope: false,
                });
            }
        } else if (platform === 'android') {
            if (policy) {
                const p = policy as AndroidWebApplicationPolicy;
                setAndroidForm({
                    webAppId: p.webAppId,
                    keyCode: p.keyCode,
                    screenOrder: p.screenOrder,
                    screenBottom: p.screenBottom
                });
                setPositionType(p.screenBottom ? "bottom" : "order");
            } else {
                setAndroidForm({
                    webAppId: "",
                    keyCode: 0,
                    screenOrder: 0,
                    screenBottom: false,
                });
                setPositionType("order");
            }
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            let payload: any;
            if (platform === 'ios') {
                payload = {
                    ...iosForm,
                    policyType: 'IosWebApplicationPolicy',
                };
            } else {
                payload = {
                    webAppId: androidForm.webAppId,
                    keyCode: androidForm.keyCode,
                    policyType: 'AndroidWebApplicationPolicy',
                    // Handle OneOf manually
                    ...(positionType === 'order' ? { screenOrder: androidForm.screenOrder } : { screenBottom: true }),
                    // Spec says oneOf screenOrder OR screenBottom. 
                };
            }

            if (editingPolicy && editingPolicy.id) {
                await PolicyService.updateWebApplicationPolicy(platform as any, profileId, editingPolicy.id, payload);
                toast.success("Policy updated successfully");
            } else {
                // For Android, name is derived from webApp, but we need to send what the API expects
                // API spec for create might vary, assuming standard structure.
                // Actually for Android create, we need webAppName? Schema says required.
                // But usually reference ID is enough. Let's check if we can find name from webApps list.
                if (platform === 'android') {
                    const selectedApp = webApps.find(w => w.id === androidForm.webAppId);
                    if (selectedApp) {
                        payload.webAppName = selectedApp.name;
                    }
                }

                await PolicyService.createWebApplicationPolicy(platform as any, profileId, payload);
                toast.success("Policy created successfully");
            }
            setIsDialogOpen(false);
            fetchPolicies();
        } catch (error) {
            console.error("Failed to save policy", error);
            toast.error("Failed to save policy");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await PolicyService.deleteWebApplicationPolicy(platform as any, profileId, deleteId);
            toast.success("Policy deleted successfully");
            fetchPolicies();
        } catch (error) {
            console.error("Failed to delete policy", error);
            toast.error("Failed to delete policy");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Web Applications</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage web clips and shortcuts for {platform === 'ios' ? 'iOS' : 'Android'} devices.
                    </p>
                </div>
                {!readonly && (
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Web App
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : policies.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="p-3 rounded-full bg-background border shadow-sm">
                            <Globe className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">No Web Applications Configured</p>
                            <p className="text-sm text-muted-foreground">
                                Add a web clip or shortcut to deploy to devices.
                            </p>
                        </div>
                        {!readonly && (
                            <Button variant="outline" onClick={() => handleOpenDialog()}>
                                Add Policy
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {policies.map((policy) => (
                        <Card key={policy.id} className="relative group overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                {platform === 'ios' ? (policy as IosWebApplicationPolicy).label : (policy as AndroidWebApplicationPolicy).webAppName || 'Web App'}
                                            </CardTitle>
                                            {platform === 'ios' && (
                                                <CardDescription className="line-clamp-1" title={(policy as IosWebApplicationPolicy).url}>
                                                    {(policy as IosWebApplicationPolicy).url}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                    {!readonly && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleOpenDialog(policy)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => setDeleteId(policy.id!)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                                    {platform === 'ios' ? (
                                        <>
                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                                <Layout className="w-3.5 h-3.5" />
                                                <span>{(policy as IosWebApplicationPolicy).fullScreen ? 'Full Screen' : 'Browser'}</span>
                                            </div>
                                            {(policy as IosWebApplicationPolicy).precomposed && (
                                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                                    <Smartphone className="w-3.5 h-3.5" />
                                                    <span>Precomposed</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {(policy as AndroidWebApplicationPolicy).screenBottom ? (
                                                <div className="col-span-2 bg-muted/50 px-2 py-1 rounded text-center">
                                                    Docked at Bottom
                                                </div>
                                            ) : (
                                                <div className="col-span-2 bg-muted/50 px-2 py-1 rounded text-center">
                                                    Order: {(policy as AndroidWebApplicationPolicy).screenOrder}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? "Edit Web App" : "Add Web App"}</DialogTitle>
                        <DialogDescription>
                            Configure the web application shortcut settings for {platform === 'ios' ? 'iOS' : 'Android'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {platform === 'ios' ? (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="label">Label</Label>
                                    <Input
                                        id="label"
                                        value={iosForm.label}
                                        onChange={(e) => setIosForm({ ...iosForm, label: e.target.value })}
                                        placeholder="My App"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Internal Name</Label>
                                    <Input
                                        id="name"
                                        value={iosForm.name}
                                        onChange={(e) => setIosForm({ ...iosForm, name: e.target.value })}
                                        placeholder="com.example.webapp"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        value={iosForm.url}
                                        onChange={(e) => setIosForm({ ...iosForm, url: e.target.value })}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Full Screen</Label>
                                        <p className="text-xs text-muted-foreground">Open as a standalone web app</p>
                                    </div>
                                    <Switch
                                        checked={iosForm.fullScreen}
                                        onCheckedChange={(c) => setIosForm({ ...iosForm, fullScreen: c })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Removable</Label>
                                        <p className="text-xs text-muted-foreground">Allow user to remove the icon</p>
                                    </div>
                                    <Switch
                                        checked={iosForm.isRemovable}
                                        onCheckedChange={(c) => setIosForm({ ...iosForm, isRemovable: c })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Precomposed Icon</Label>
                                        <p className="text-xs text-muted-foreground">Prevent OS from adding shine effect</p>
                                    </div>
                                    <Switch
                                        checked={iosForm.precomposed}
                                        onCheckedChange={(c) => setIosForm({ ...iosForm, precomposed: c })}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label>Web Application</Label>
                                    <Select
                                        value={androidForm.webAppId}
                                        onValueChange={(val) => setAndroidForm({ ...androidForm, webAppId: val })}
                                        disabled={!!editingPolicy} // Likely can't change the app ID on edit, assuming standard practice
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a web app..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {webApps.map((app) => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    {app.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Key Code</Label>
                                    <Input
                                        type="number"
                                        value={androidForm.keyCode || ''}
                                        onChange={(e) => setAndroidForm({ ...androidForm, keyCode: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label>Position</Label>
                                    <div className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="pos-bottom"
                                                checked={positionType === 'bottom'}
                                                onCheckedChange={(c) => {
                                                    setPositionType(c ? 'bottom' : 'order');
                                                    if (c) {
                                                        setAndroidForm(prev => ({ ...prev, screenBottom: true, screenOrder: undefined }));
                                                    } else {
                                                        setAndroidForm(prev => ({ ...prev, screenBottom: false, screenOrder: 0 }));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="pos-bottom">Dock at Bottom</Label>
                                        </div>
                                    </div>

                                    {positionType === 'order' && (
                                        <div className="grid gap-2 pl-2 border-l-2">
                                            <Label>Screen Order</Label>
                                            <Input
                                                type="number"
                                                value={androidForm.screenOrder || 0}
                                                onChange={(e) => setAndroidForm({ ...androidForm, screenOrder: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will remove the web application policy from the profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
