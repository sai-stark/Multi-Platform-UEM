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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
import { IosApplicationPolicy } from '@/types/policy';
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Grid,
    Loader2,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationPolicy as ApplicationPolicyType } from '@/types/policy';

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
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isFetching, setIsFetching] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const getPurchaseMethodLabel = (method?: number) => {
        switch (method) {
            case 0: return 'Free / VPP Redemption';
            case 1: return 'VPP Assignment';
            default: return 'VPP Assignment';
        }
    };

    // ====================================================================
    // Handlers
    // ====================================================================
    const resetAddModalState = () => {
        setSelectedAppId('');
        setSelectedPurchaseMethod(1);
        setSelectedEnableAnalytics(false);
    };

    const toggleRowExpansion = (id: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
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
        setOpenAddModal(false);
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
            toast({ title: 'Success', description: 'Application policy deleted.' });
            if (onSave) onSave();
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
            if (onSave) onSave();
        } catch (error) {
            console.error('Error saving application policies:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save application policies'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const availableForAdd = getAvailableAppsForAdd();
    const hasChanges = changedPolicies.length > 0;

    // ====================================================================
    // Render
    // ====================================================================
    return (
        <div className="space-y-6 max-w-5xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Grid className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Application Policies</h3>
                        <p className="text-sm text-muted-foreground">Manage app installation and configuration for iOS</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenAddModal(true)}
                    disabled={availableForAdd.length === 0 && policies.length === 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                </Button>
            </div>

            {/* No apps warning */}
            {availableForAdd.length === 0 && policies.length === 0 && !isFetching && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No iOS applications available. Please register iOS applications first.
                    </AlertDescription>
                </Alert>
            )}

            {/* Loading state */}
            {isFetching && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-10">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading existing policies...
                </div>
            )}

            {/* Policies Table */}
            {policies.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]" />
                                <TableHead className="w-[260px]">Application</TableHead>
                                <TableHead className="w-[120px]">Action</TableHead>
                                <TableHead className="w-[180px]">Purchase Method</TableHead>
                                <TableHead className="w-[100px] text-center">Analytics</TableHead>
                                <TableHead className="w-[100px] text-center">Status</TableHead>
                                <TableHead className="w-[80px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.map((policy) => {
                                const policyKey = policy.id || policy.applicationId;
                                const appInfo = getAppDisplayInfo(policy.applicationId);
                                const displayName = policy.name || appInfo.name;
                                const isExpanded = expandedRows.has(policyKey);

                                return (
                                    <React.Fragment key={policyKey}>
                                        {/* Main Row */}
                                        <TableRow className={cn(isExpanded && 'bg-muted/30')}>
                                            <TableCell className="px-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => toggleRowExpansion(policyKey)}
                                                >
                                                    {isExpanded
                                                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    }
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {appInfo.iconUrl && (
                                                        <img
                                                            src={appInfo.iconUrl}
                                                            alt=""
                                                            className="w-8 h-8 rounded-lg flex-shrink-0"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-sm">{displayName}</p>
                                                        {appInfo.bundleId && (
                                                            <p className="text-xs text-muted-foreground">{appInfo.bundleId}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{policy.action}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={(policy.purchaseMethod ?? 1).toString()}
                                                    onValueChange={(v) => handleFieldChange(policyKey, 'purchaseMethod', parseInt(v))}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-[160px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0" className="text-xs">Free / VPP Redemption</SelectItem>
                                                        <SelectItem value="1" className="text-xs">VPP Assignment</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={policy.enableAppAnalytics ?? false}
                                                    onCheckedChange={(v) => handleFieldChange(policyKey, 'enableAppAnalytics', v)}
                                                    className="scale-90"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {policy.isNew ? (
                                                    <Badge variant="secondary">New</Badge>
                                                ) : (
                                                    <Badge variant="outline">Saved</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                onClick={() => handleDeleteApplication(policy)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Detail Row */}
                                        {isExpanded && (
                                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                <TableCell colSpan={7} className="border-t border-dashed p-0">
                                                    <div className="px-6 py-4 pl-12">
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                                            {/* Application ID */}
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Application ID</Label>
                                                                <Input
                                                                    value={policy.applicationId || ''}
                                                                    disabled
                                                                    className="h-8 text-xs bg-muted"
                                                                />
                                                            </div>

                                                            {/* Name */}
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Name</Label>
                                                                <Input
                                                                    value={policy.name || ''}
                                                                    disabled
                                                                    className="h-8 text-xs bg-muted"
                                                                />
                                                            </div>

                                                            {/* Action */}
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Action</Label>
                                                                <Input
                                                                    value={policy.action || 'INSTALL'}
                                                                    disabled
                                                                    className="h-8 text-xs bg-muted"
                                                                />
                                                            </div>

                                                            {/* Attribute: Associated Domains */}
                                                            <div className="space-y-1.5 col-span-2">
                                                                <Label className="text-xs text-muted-foreground">Associated Domains</Label>
                                                                <Input
                                                                    placeholder="Comma-separated domains (e.g. example.com, app.example.com)"
                                                                    value={policy.attribute?.associatedDomains?.join(', ') || ''}
                                                                    onChange={(e) => {
                                                                        const domains = e.target.value
                                                                            .split(',')
                                                                            .map((d) => d.trim())
                                                                            .filter(Boolean);
                                                                        handleFieldChange(policyKey, 'attribute', {
                                                                            ...policy.attribute,
                                                                            associatedDomains: domains,
                                                                        } as any);
                                                                    }}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>

                                                            {/* Attribute Toggles */}
                                                            <div className="space-y-2.5 col-span-3">
                                                                <Label className="text-xs text-muted-foreground block">Attributes</Label>
                                                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <Switch
                                                                            checked={policy.attribute?.associatedDomainsEnableDirectDownloads ?? false}
                                                                            onCheckedChange={(v) =>
                                                                                handleFieldChange(policyKey, 'attribute', {
                                                                                    ...policy.attribute,
                                                                                    associatedDomainsEnableDirectDownloads: v,
                                                                                } as any)
                                                                            }
                                                                            className="scale-90"
                                                                        />
                                                                        <span>Direct Downloads</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <Switch
                                                                            checked={policy.attribute?.tapToPayScreenLock ?? false}
                                                                            onCheckedChange={(v) =>
                                                                                handleFieldChange(policyKey, 'attribute', {
                                                                                    ...policy.attribute,
                                                                                    tapToPayScreenLock: v,
                                                                                } as any)
                                                                            }
                                                                            className="scale-90"
                                                                        />
                                                                        <span>Tap to Pay Screen Lock</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Empty state - apps exist but none added */}
            {policies.length === 0 && availableForAdd.length > 0 && !isFetching && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                        <Grid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="font-medium mb-2">No application policies configured</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Add iOS applications to configure install and management settings.
                        </p>
                        <Button variant="outline" onClick={() => setOpenAddModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Application
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading || !hasChanges} className="gap-2 min-w-[140px]">
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
