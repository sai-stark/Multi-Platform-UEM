import { PolicyService } from '@/api/services/IOSpolicies';
import {
    Application,
    ApplicationService,
} from '@/api/services/applications';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
import { ApplicationPolicy as ApplicationPolicyType, IosApplicationPolicy } from '@/types/policy';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    AlertTriangle,
    BarChart3,
    Globe,
    Grid,
    Loader2,
    Package,
    Plus,
    Save,
    Search,
    Settings2,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ====================================================================
// Props
// ====================================================================
interface ApplicationPolicyProps {
    profileId: string;
    platform: Platform;
    initialData?: ApplicationPolicyType[];
    onSave: () => void;
    onCancel: () => void;
}

// Extended type with UI-only fields
type ExtendedPolicy = IosApplicationPolicy & {
    isNew?: boolean;
    displayName?: string;
};

// ====================================================================
// Component
// ====================================================================
export const ApplicationPolicyEditor = ({
    profileId,
    platform,
    initialData,
    onSave,
    onCancel,
}: ApplicationPolicyProps) => {
    const { toast } = useToast();
    const navigate = useNavigate();

    // State
    const [policies, setPolicies] = useState<ExtendedPolicy[]>([]);
    const [availableApps, setAvailableApps] = useState<Application[]>([]);
    const [changedPolicies, setChangedPolicies] = useState<ExtendedPolicy[]>([]);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [listSearchQuery, setListSearchQuery] = useState('');

    // Modal states
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [appToDelete, setAppToDelete] = useState<ExtendedPolicy | null>(null);

    // Add Application Modal states
    const [selectedAppId, setSelectedAppId] = useState('');
    const [selectedPurchaseMethod, setSelectedPurchaseMethod] = useState(1);
    const [selectedEnableAnalytics, setSelectedEnableAnalytics] = useState(false);

    // ====================================================================
    // Data loading
    // ====================================================================
    useEffect(() => {
        fetchApplications();
        if (initialData && initialData.length > 0) {
            const iosPolicies = initialData.filter(
                (p): p is IosApplicationPolicy =>
                    p.devicePolicyType === 'IosApplicationPolicy' || !('applicationVersionId' in p)
            ) as ExtendedPolicy[];
            setPolicies(iosPolicies);
        } else {
            loadExistingPolicies();
        }
    }, [platform, profileId]);

    // Auto-select first policy when policies load
    useEffect(() => {
        if (policies.length > 0 && !selectedPolicyId) {
            const key = policies[0].id || policies[0].applicationId;
            setSelectedPolicyId(key);
        }
    }, [policies]);

    const fetchApplications = async () => {
        try {
            const response = await ApplicationService.getApplications('ios');
            setAvailableApps(response.content || []);
        } catch (error) {
            console.error('Failed to fetch iOS applications:', error);
        }
    };

    const loadExistingPolicies = async () => {
        setIsFetching(true);
        try {
            const response = await PolicyService.getApplicationPolicies(platform, profileId);
            const items = Array.isArray(response)
                ? response
                : (response as any).content || [];
            setPolicies(items);
        } catch (error) {
            console.error('Failed to load existing policies:', error);
        } finally {
            setIsFetching(false);
        }
    };

    // ====================================================================
    // Helpers
    // ====================================================================
    const getAvailableAppsForAdd = () => {
        const usedAppIds = new Set(
            policies.map((p) => p.applicationId).filter(Boolean)
        );
        return availableApps.filter((app) => !usedAppIds.has(app.id));
    };

    const getAppDisplayInfo = (applicationId: string) => {
        const app = availableApps.find((a) => a.id === applicationId);
        if (app) {
            return {
                name: app.name,
                bundleId: (app as any).bundleId || (app as any).packageName || '',
                iconUrl: (app as any).artworkUrl60 || (app as any).iconUrl || '',
            };
        }
        return { name: 'Unknown', bundleId: '', iconUrl: '' };
    };

    const getAppInfo = (policy: ExtendedPolicy) => {
        const info = getAppDisplayInfo(policy.applicationId);
        return {
            name: policy.name || policy.displayName || info.name,
            bundleId: info.bundleId,
            iconUrl: info.iconUrl,
        };
    };

    const getPurchaseMethodLabel = (method?: number) => {
        switch (method) {
            case 0: return 'Free / VPP Redemption';
            case 1: return 'VPP Assignment';
            default: return 'VPP Assignment';
        }
    };

    const getPolicyKey = (policy: ExtendedPolicy) => policy.id || policy.applicationId;

    const selectedPolicy = policies.find((p) => getPolicyKey(p) === selectedPolicyId) || null;

    // ====================================================================
    // Handlers
    // ====================================================================
    const resetAddModalState = () => {
        setSelectedAppId('');
        setSelectedPurchaseMethod(1);
        setSelectedEnableAnalytics(false);
    };

    const handleFieldChange = (
        id: string,
        field: keyof IosApplicationPolicy,
        value: boolean | string | number | undefined | Record<string, object>
    ) => {
        setPolicies((prev) =>
            prev.map((row) => {
                const key = row.id || row.applicationId;
                return key === id ? { ...row, [field]: value } : row;
            })
        );
        setChangedPolicies((prev) => {
            const rowToUpdate = policies.find((r) => (r.id || r.applicationId) === id);
            if (!rowToUpdate) return prev;
            const updatedRow = { ...rowToUpdate, [field]: value };
            if (prev.find((r) => (r.id || r.applicationId) === id)) {
                return prev.map((r) => ((r.id || r.applicationId) === id ? updatedRow : r));
            }
            return [...prev, updatedRow];
        });
    };

    const handleAddApplication = () => {
        if (!selectedAppId) {
            toast({ title: 'Error', description: 'Please select an application', variant: 'destructive' });
            return;
        }

        const selectedApp = availableApps.find((app) => app.id === selectedAppId);
        if (!selectedApp) {
            toast({ title: 'Error', description: 'Selected application not found', variant: 'destructive' });
            return;
        }

        const now = new Date().toISOString();
        const newPolicy: ExtendedPolicy = {
            applicationId: selectedApp.id,
            name: selectedApp.name,
            action: 'INSTALL',
            purchaseMethod: selectedPurchaseMethod,
            enableAppAnalytics: selectedEnableAnalytics,
            devicePolicyType: 'IosApplicationPolicy',
            isNew: true,
            displayName: selectedApp.name,
            createdBy: '',
            lastModifiedBy: '',
            creationTime: now,
            modificationTime: now,
        };

        setChangedPolicies((prev) => [...prev, newPolicy]);
        setPolicies((prev) => [...prev, newPolicy]);
        setSelectedPolicyId(getPolicyKey(newPolicy));
        resetAddModalState();
    };

    const handleDeleteApplication = (policy: ExtendedPolicy) => {
        setAppToDelete(policy);
        setOpenDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;
        try {
            if (!appToDelete.isNew && appToDelete.id) {
                await PolicyService.deleteApplicationPolicy(platform, profileId, appToDelete.id);
            }
            const key = appToDelete.id || appToDelete.applicationId;
            setPolicies((prev) => prev.filter((p) => (p.id || p.applicationId) !== key));
            setChangedPolicies((prev) => prev.filter((p) => (p.id || p.applicationId) !== key));
            if (selectedPolicyId === key) {
                setSelectedPolicyId(null);
            }
            toast({ title: 'Success', description: 'Application policy deleted.' });
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete application policy'), variant: 'destructive' });
        }
        setOpenDeleteModal(false);
        setAppToDelete(null);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const promises: Promise<unknown>[] = [];

            const newPolicies = changedPolicies.filter((p) => p.isNew);
            for (const policy of newPolicies) {
                const { isNew, displayName, ...policyData } = policy;
                promises.push(
                    PolicyService.createApplicationPolicy(platform, profileId, policyData)
                );
            }

            const updatedPolicies = changedPolicies.filter((p) => !p.isNew);
            for (const policy of updatedPolicies) {
                const { isNew, displayName, ...policyData } = policy;
                if (policy.id) {
                    promises.push(
                        PolicyService.updateApplicationPolicy(platform, profileId, policy.id, policyData)
                    );
                }
            }

            await Promise.all(promises);
            setChangedPolicies([]);
            toast({ title: 'Success', description: 'Application policies saved successfully!' });
            await loadExistingPolicies();
        } catch (error) {
            console.error('Error saving application policies:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save application policies'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const availableForAdd = getAvailableAppsForAdd();
    const hasChanges = changedPolicies.length > 0;

    // Filter the list
    const filteredPolicies = listSearchQuery.trim()
        ? policies.filter((p) => {
            const info = getAppInfo(p);
            const q = listSearchQuery.toLowerCase();
            return (
                info.name.toLowerCase().includes(q) ||
                info.bundleId.toLowerCase().includes(q)
            );
        })
        : policies;

    // ====================================================================
    // Render
    // ====================================================================
    return (
        <div className="flex flex-col h-[78vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b shrink-0 pr-8">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <Grid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Application Policies</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage app installation and configuration for iOS</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={() => setOpenAddModal(true)}
                    disabled={availableForAdd.length === 0 && policies.length === 0}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Add Application
                </Button>
            </div>

            {/* No apps warning */}
            {availableForAdd.length === 0 && policies.length === 0 && !isFetching && (
                <div className="flex-1 flex items-center justify-center">
                    <Alert className="max-w-md">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            No iOS applications available. Please register iOS applications first.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Loading state */}
            {isFetching && (
                <div className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading existing policies...
                </div>
            )}

            {/* Master-Detail Layout */}
            {policies.length > 0 && !isFetching && (
                <div className="flex flex-1 min-h-0 mt-4 gap-0 border rounded-lg overflow-hidden">
                    {/* Left Panel — App List */}
                    <div className="w-[280px] shrink-0 border-r bg-gradient-to-b from-muted/30 to-muted/10 flex flex-col">
                        {/* Search */}
                        <div className="p-3 border-b bg-muted/20">
                            <div className="relative group/search">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within/search:text-blue-500" />
                                <Input
                                    placeholder="Search apps..."
                                    value={listSearchQuery}
                                    onChange={(e) => setListSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs bg-background/80 border-border/50 focus:border-blue-500/50 focus:bg-background transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* App List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredPolicies.map((policy) => {
                                const info = getAppInfo(policy);
                                const key = getPolicyKey(policy);
                                const isSelected = selectedPolicyId === key;
                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            'group flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-all duration-200',
                                            isSelected
                                                ? 'bg-blue-500/10 dark:bg-blue-500/15 border-l-[3px] border-l-blue-500 shadow-[inset_0_0_20px_-12px_rgba(59,130,246,0.3)]'
                                                : 'hover:bg-muted/60 border-l-[3px] border-l-transparent hover:border-l-border'
                                        )}
                                        onClick={() => setSelectedPolicyId(key)}
                                    >
                                        {info.iconUrl && (
                                            <img
                                                src={info.iconUrl}
                                                alt=""
                                                className="w-9 h-9 rounded-lg shrink-0 shadow-sm"
                                                loading="lazy"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={cn("font-medium text-sm truncate transition-colors", isSelected && "text-blue-600 dark:text-blue-400")}>{info.name}</p>
                                                {policy.isNew && (
                                                    <Badge className="text-[10px] px-1.5 py-0 shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">New</Badge>
                                                )}
                                            </div>
                                            {info.bundleId && (
                                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{info.bundleId}</p>
                                            )}
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">
                                                {getPurchaseMethodLabel(policy.purchaseMethod)}
                                            </Badge>
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all duration-200"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteApplication(policy);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                );
                            })}

                            {filteredPolicies.length === 0 && listSearchQuery.trim() && (
                                <div className="text-center py-10 text-muted-foreground">
                                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                        <Search className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-xs font-medium">No apps match "{listSearchQuery}"</p>
                                    <p className="text-[11px] mt-1 opacity-60">Try a different search term</p>
                                </div>
                            )}
                        </div>

                        {/* App count */}
                        <div className="px-3 py-2.5 border-t text-[11px] text-muted-foreground bg-muted/30 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            {policies.length} application{policies.length !== 1 ? 's' : ''} configured
                        </div>
                    </div>

                    {/* Right Panel — Detail Form */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {selectedPolicy ? (
                            <IosDetailPanel
                                policy={selectedPolicy}
                                appInfo={getAppInfo(selectedPolicy)}
                                onFieldChange={handleFieldChange}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Package className="w-7 h-7 opacity-40" />
                                    </div>
                                    <p className="text-sm font-semibold">Select an application</p>
                                    <p className="text-xs mt-1.5 max-w-[200px] mx-auto leading-relaxed">Choose an app from the list to view and edit its policy settings</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state - apps exist but none added */}
            {policies.length === 0 && availableForAdd.length > 0 && !isFetching && (
                <div className="flex-1 flex items-center justify-center">
                    <Card className="border-dashed max-w-sm border-2 border-blue-500/20">
                        <CardContent className="py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-5">
                                <Grid className="w-7 h-7 text-blue-500/60" />
                            </div>
                            <h4 className="font-semibold text-base mb-2">No application policies configured</h4>
                            <p className="text-sm text-muted-foreground mb-6 max-w-[260px] mx-auto leading-relaxed">
                                Add iOS applications to configure install and management settings.
                            </p>
                            <Button
                                onClick={() => setOpenAddModal(true)}
                                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
                            >
                                <Plus className="w-4 h-4" />
                                Add Application
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
                <Button variant="outline" onClick={onCancel} disabled={loading} className="transition-all duration-200">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={loading || !hasChanges}
                    className={cn(
                        'gap-2 min-w-[140px] transition-all duration-200',
                        hasChanges && 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg'
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>

            {/* Add Application Modal */}
            <Dialog open={openAddModal} onOpenChange={(open) => {
                setOpenAddModal(open);
                if (!open) resetAddModalState();
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add iOS Application Policy
                        </DialogTitle>
                        <DialogDescription>
                            Select a registered iOS application and configure its policy settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {availableForAdd.length === 0 ? (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    All available iOS applications have already been added, or no apps are registered.{' '}
                                    <span
                                        className="text-sky-500 hover:text-sky-400 hover:underline cursor-pointer transition-colors"
                                        onClick={() => {
                                            setOpenAddModal(false);
                                            navigate('/applications?platform=ios');
                                        }}
                                    >
                                        Add Application.
                                    </span>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                {/* Application */}
                                <div className="space-y-2">
                                    <Label>Application</Label>
                                    <Select
                                        value={selectedAppId}
                                        onValueChange={setSelectedAppId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an iOS application" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableForAdd.map((app) => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    <div className="flex items-center gap-2">
                                                        {(app as any).artworkUrl60 && (
                                                            <img
                                                                src={(app as any).artworkUrl60}
                                                                alt=""
                                                                className="w-5 h-5 rounded"
                                                            />
                                                        )}
                                                        <span>{app.name}</span>
                                                        {(app as any).bundleId && (
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                                ({(app as any).bundleId})
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Purchase Method */}
                                <div className="space-y-2">
                                    <Label>Purchase Method</Label>
                                    <Select
                                        value={selectedPurchaseMethod.toString()}
                                        onValueChange={(v) => setSelectedPurchaseMethod(parseInt(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Free / VPP with Redemption Code</SelectItem>
                                            <SelectItem value="1">VPP App Assignment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Enable Analytics */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="add-analytics"
                                        checked={selectedEnableAnalytics}
                                        onCheckedChange={(checked) =>
                                            setSelectedEnableAnalytics(checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="add-analytics" className="cursor-pointer">
                                        Enable App Analytics
                                    </Label>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddApplication} disabled={!selectedAppId}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Application Policy
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this application policy? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Removing this policy will affect all devices using this profile.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ====================================================================
// Detail Panel Sub-component
// ====================================================================
interface IosDetailPanelProps {
    policy: ExtendedPolicy;
    appInfo: { name: string; bundleId: string; iconUrl: string };
    onFieldChange: (id: string, field: keyof IosApplicationPolicy, value: boolean | string | number | undefined | Record<string, object>) => void;
}

function IosDetailPanel({ policy, appInfo, onFieldChange }: IosDetailPanelProps) {
    const policyKey = policy.id || policy.applicationId;

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* App Info Header */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-card to-muted/30 p-5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="flex items-start gap-4">
                    {appInfo.iconUrl && (
                        <img
                            src={appInfo.iconUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl shadow-md shrink-0"
                            loading="lazy"
                        />
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold truncate">{appInfo.name}</h3>
                        {appInfo.bundleId && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5 font-mono">{appInfo.bundleId}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs font-medium">{policy.action}</Badge>
                            {policy.isNew && <Badge className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">New</Badge>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider">Configuration</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                        <Label className="text-xs font-medium text-muted-foreground">Purchase Method</Label>
                        <Select
                            value={(policy.purchaseMethod ?? 1).toString()}
                            onValueChange={(v) => onFieldChange(policyKey, 'purchaseMethod', parseInt(v))}
                        >
                            <SelectTrigger className="h-9 bg-background/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Free / VPP Redemption</SelectItem>
                                <SelectItem value="1">VPP Assignment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() => onFieldChange(policyKey, 'enableAppAnalytics', !(policy.enableAppAnalytics ?? false))}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                                <BarChart3 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">App Analytics</span>
                                <p className="text-xs text-muted-foreground">Enable analytics collection</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.enableAppAnalytics ?? false}
                            onCheckedChange={(v) => onFieldChange(policyKey, 'enableAppAnalytics', v)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Attributes Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Settings2 className="w-4 h-4 text-violet-500" />
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider">Attributes</h4>
                </div>

                {/* Associated Domains */}
                <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                    <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-xs font-medium text-muted-foreground">Associated Domains</Label>
                    </div>
                    <Input
                        placeholder="Comma-separated domains (e.g. example.com, app.example.com)"
                        value={policy.attribute?.associatedDomains?.join(', ') || ''}
                        onChange={(e) => {
                            const domains = e.target.value
                                .split(',')
                                .map((d) => d.trim())
                                .filter(Boolean);
                            onFieldChange(policyKey, 'attribute', {
                                ...policy.attribute,
                                associatedDomains: domains,
                            } as any);
                        }}
                        className="h-9 bg-background/80"
                    />
                </div>

                {/* Attribute Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() =>
                            onFieldChange(policyKey, 'attribute', {
                                ...policy.attribute,
                                associatedDomainsEnableDirectDownloads: !(policy.attribute?.associatedDomainsEnableDirectDownloads ?? false),
                            } as any)
                        }
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                                <Globe className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Direct Downloads</span>
                                <p className="text-xs text-muted-foreground">Enable for associated domains</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.attribute?.associatedDomainsEnableDirectDownloads ?? false}
                            onCheckedChange={(v) =>
                                onFieldChange(policyKey, 'attribute', {
                                    ...policy.attribute,
                                    associatedDomainsEnableDirectDownloads: v,
                                } as any)
                            }
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() =>
                            onFieldChange(policyKey, 'attribute', {
                                ...policy.attribute,
                                tapToPayScreenLock: !(policy.attribute?.tapToPayScreenLock ?? false),
                            } as any)
                        }
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                                <Settings2 className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Tap to Pay Screen Lock</span>
                                <p className="text-xs text-muted-foreground">Require screen lock for Tap to Pay</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.attribute?.tapToPayScreenLock ?? false}
                            onCheckedChange={(v) =>
                                onFieldChange(policyKey, 'attribute', {
                                    ...policy.attribute,
                                    tapToPayScreenLock: v,
                                } as any)
                            }
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
