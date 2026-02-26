import { PolicyService } from '@/api/services/IOSpolicies';
import {
    Application,
    ApplicationPermission,
    ApplicationService,
    ApplicationVersion,
} from '@/api/services/applications';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { AndroidApplicationPolicy as AndroidApplicationPolicyType } from '@/types/policy';
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Edit,
    Grid,
    Loader2,
    Plus,
    Save,
    Settings2,
    Shield,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// ====================================================================
// Props
// ====================================================================
interface AndroidApplicationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: AndroidApplicationPolicyType[];
    onSave?: () => void;
    onCancel?: () => void;
}

// Extended type with UI-only fields
type ExtendedPolicy = AndroidApplicationPolicyType & {
    isNew?: boolean;
    displayName?: string;
    displayVersion?: string;
};

// ====================================================================
// Enum constants
// ====================================================================
type InstallType = 'INSTALL_REMOVABLE' | 'INSTALL_NONREMOVABLE' | 'UNINSTALL' | 'AVAILABLE';
type AutoUpdateMode = 'HIGH_PRIORITY' | 'POSTPONE';
type PermissionGrant = 'PROMPT' | 'GRANT' | 'DENY';
type PermissionGrantValue = 'PROMPT' | 'GRANT' | 'DENY';
type CommunicateWithPersonalApp = 'DENY' | 'ALLOW_WITH_USER_CONSENT';

const INSTALL_TYPES: InstallType[] = ['INSTALL_REMOVABLE', 'INSTALL_NONREMOVABLE', 'UNINSTALL', 'AVAILABLE'];
const AUTO_UPDATE_MODES: AutoUpdateMode[] = ['HIGH_PRIORITY', 'POSTPONE'];
const PERMISSION_GRANTS: PermissionGrant[] = ['PROMPT', 'GRANT', 'DENY'];
const CROSS_PROFILE_OPTIONS: CommunicateWithPersonalApp[] = ['DENY', 'ALLOW_WITH_USER_CONSENT'];

const formatEnumLabel = (value: string): string =>
    value.replace(/INSTALL_TYPE_|AUTO_UPDATE_MODE_|AUTO_UPDATE_|PERMISSION_POLICY_|CROSS_PROFILE_DATA_SHARING_|_/g, ' ').trim();

const getInstallTypeBadge = (type: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        INSTALL_REMOVABLE: { label: 'Removable', variant: 'secondary' },
        INSTALL_NONREMOVABLE: { label: 'Non-Removable', variant: 'default' },
        UNINSTALL: { label: 'Uninstall', variant: 'destructive' },
        AVAILABLE: { label: 'Available', variant: 'outline' },
    };
    return map[type] || { label: type, variant: 'outline' as const };
};

// ====================================================================
// Component
// ====================================================================
export function AndroidApplicationPolicy({
    platform,
    profileId,
    initialData,
    onSave,
    onCancel,
}: AndroidApplicationPolicyProps) {
    const { toast } = useToast();

    // State
    const [policies, setPolicies] = useState<ExtendedPolicy[]>(
        (initialData as ExtendedPolicy[]) || []
    );
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
    const [selectedAppName, setSelectedAppName] = useState('');
    const [selectedVersion, setSelectedVersion] = useState('');
    const [selectedVersionId, setSelectedVersionId] = useState('');
    const [selectedInstallType, setSelectedInstallType] = useState<InstallType>('INSTALL_REMOVABLE');

    // Permissions Dialog states
    const [openPermissionDialogFor, setOpenPermissionDialogFor] = useState<string | null>(null);
    const [permissionList, setPermissionList] = useState<ApplicationPermission[]>([]);
    const [permissionLoading, setPermissionLoading] = useState(false);
    const [permissionSelections, setPermissionSelections] = useState<
        Record<string, PermissionGrantValue | undefined>
    >({});
    const [permissionEdits, setPermissionEdits] = useState<
        Record<string, Record<string, PermissionGrantValue>>
    >({});

    // ====================================================================
    // Data loading
    // ====================================================================
    useEffect(() => {
        fetchApplications();
        loadExistingPolicies();
    }, [platform, profileId]);

    const fetchApplications = async () => {
        try {
            const response = await ApplicationService.getApplications(platform);
            setAvailableApps(response.content || []);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
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
    const getAvailableAppNames = () => {
        const usedVersionIds = new Set(
            policies.map((p) => p.applicationVersionId).filter(Boolean)
        );
        return availableApps
            .map((app) => {
                const availableVersions = (app.versions || []).filter(
                    (v) => !usedVersionIds.has(v.id)
                );
                return { ...app, availableVersions };
            })
            .filter((app) => app.availableVersions.length > 0)
            .map((app) => ({
                name: app.name,
                packageName: app.packageName,
                displayName: `${app.name} - ${app.packageName}`,
            }));
    };

    const getAvailableVersionsForApp = (appName: string): ApplicationVersion[] => {
        const app = availableApps.find((a) => a.name === appName);
        if (!app || !app.versions) return [];
        const usedVersionIds = new Set(
            policies.map((p) => p.applicationVersionId).filter(Boolean)
        );
        return app.versions.filter((v) => !usedVersionIds.has(v.id));
    };

    const getAppDisplayInfo = (applicationVersionId: string) => {
        for (const app of availableApps) {
            const version = (app.versions || []).find((v) => v.id === applicationVersionId);
            if (version) {
                return { name: app.name, version: version.version, packageName: app.packageName };
            }
        }
        return { name: 'Unknown', version: 'Unknown', packageName: '' };
    };

    // ====================================================================
    // Handlers
    // ====================================================================
    const resetAddModalState = () => {
        setSelectedAppName('');
        setSelectedVersion('');
        setSelectedVersionId('');
        setSelectedInstallType('INSTALL_REMOVABLE');
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
        field: keyof AndroidApplicationPolicyType,
        value: boolean | string | number | undefined
    ) => {
        setPolicies((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
        setChangedPolicies((prev) => {
            const rowToUpdate = policies.find((r) => r.id === id);
            if (!rowToUpdate) return prev;
            const updatedRow = { ...rowToUpdate, [field]: value };
            if (prev.find((r) => r.id === id)) {
                return prev.map((r) => (r.id === id ? updatedRow : r));
            }
            return [...prev, updatedRow];
        });
    };

    const handleAddApplication = () => {
        if (!selectedAppName || !selectedVersion || !selectedVersionId) {
            toast({ title: 'Error', description: 'Please select both app name and version', variant: 'destructive' });
            return;
        }

        const selectedApp = availableApps.find((app) =>
            (app.versions || []).some((v) => v.id === selectedVersionId)
        );
        if (!selectedApp) {
            toast({ title: 'Error', description: 'Selected application not found', variant: 'destructive' });
            return;
        }

        const newPolicy: ExtendedPolicy = {
            id: selectedApp.id,
            applicationVersionId: selectedVersionId,
            installType: selectedInstallType,
            disabled: false,
            defaultPermission: 'PROMPT',
            isNew: true,
            displayName: selectedAppName,
            displayVersion: selectedVersion,
            devicePolicyType: 'AndroidApplicationPolicy',
            createdBy: '',
            lastModifiedBy: '',
            creationTime: '',
            modificationTime: '',
        };

        setChangedPolicies((prev) => [...prev, newPolicy]);
        setPolicies((prev) => [...prev, newPolicy]);
        setOpenAddModal(false);
        resetAddModalState();
    };

    // Resolve applicationId from a policy (via its applicationVersionId)
    const getApplicationIdForPolicy = (policy: ExtendedPolicy) => {
        for (const app of availableApps) {
            if ((app.versions || []).some((v) => v.id === policy.applicationVersionId)) {
                return app.id;
            }
        }
        return undefined;
    };

    // Open permissions dialog for a policy row
    const openPermissionDialog = async (policy: ExtendedPolicy) => {
        const appId = getApplicationIdForPolicy(policy) || policy.id;
        if (!appId) {
            toast({ title: 'Error', description: 'Unable to resolve application for this policy.', variant: 'destructive' });
            return;
        }
        setPermissionLoading(true);
        try {
            const perms = await ApplicationService.getPermissions(platform, appId);
            setPermissionList(perms || []);
            const existing: Record<string, PermissionGrantValue | undefined> = {};
            (policy.permissionGrants || []).forEach((pg) => {
                existing[pg.permission] = pg.permissionGrant;
            });
            setPermissionSelections(existing);
            setOpenPermissionDialogFor(policy.id);
        } catch (e) {
            toast({ title: 'Error', description: getErrorMessage(e, 'Failed to fetch application permissions.'), variant: 'destructive' });
        } finally {
            setPermissionLoading(false);
        }
    };

    // Persist permission selection changes locally (applied on Save)
    const savePermissionDialog = (policyId: string) => {
        const row = policies.find((r) => r.id === policyId);
        const currentMap: Record<string, PermissionGrantValue | undefined> = {};
        (row?.permissionGrants || []).forEach((pg) => {
            currentMap[pg.permission] = pg.permissionGrant;
        });
        const delta: Record<string, PermissionGrantValue> = {};
        for (const [permId, val] of Object.entries(permissionSelections)) {
            if (val !== undefined && currentMap[permId] !== val) {
                delta[permId] = val;
            }
        }
        setPermissionEdits((prev) => ({ ...prev, [policyId]: delta }));
        setOpenPermissionDialogFor(null);
        toast({
            title: 'Permissions prepared',
            description: Object.keys(delta).length > 0
                ? 'Changes will be applied on Save.'
                : 'No permission changes detected.',
        });
    };

    const handleDeleteApplication = (policy: ExtendedPolicy) => {
        setAppToDelete(policy);
        setOpenDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;
        try {
            if (!appToDelete.isNew) {
                await PolicyService.deleteApplicationPolicy(platform, profileId, appToDelete.id);
            }
            setPolicies((prev) => prev.filter((p) => p.id !== appToDelete.id));
            setChangedPolicies((prev) => prev.filter((p) => p.id !== appToDelete.id));
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
                const { isNew, displayName, displayVersion, ...policyData } = policy;
                // Attach permission edits for new policies
                if (permissionEdits[policy.id]) {
                    (policyData as any).permissionGrants = Object.entries(
                        permissionEdits[policy.id]
                    ).map(([permission, permissionGrant]) => ({ permission, permissionGrant }));
                }
                promises.push(
                    PolicyService.createApplicationPolicy(platform, profileId, policyData)
                );
            }

            const updatedPolicies = changedPolicies.filter((p) => !p.isNew);
            for (const policy of updatedPolicies) {
                const { isNew, displayName, displayVersion, ...policyData } = policy;
                // Include only changed permission grants
                if (permissionEdits[policy.id]) {
                    (policyData as any).permissionGrants = Object.entries(
                        permissionEdits[policy.id]
                    ).map(([permission, permissionGrant]) => ({ permission, permissionGrant }));
                } else {
                    delete (policyData as any).permissionGrants;
                }
                promises.push(
                    PolicyService.updateApplicationPolicy(platform, profileId, policy.id, policyData)
                );
            }

            await Promise.all(promises);
            setChangedPolicies([]);
            setPermissionEdits({});
            toast({ title: 'Success', description: 'Application policies saved successfully!' });
            // Reload policies from API so UI reflects the saved state
            await loadExistingPolicies();
            if (onSave) onSave();
        } catch (error) {
            console.error('Error saving application policies:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save application policies'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const availableAppNames = getAvailableAppNames();
    const hasChanges = changedPolicies.length > 0;

    // ====================================================================
    // Render
    // ====================================================================
    return (
        <div className="space-y-6 max-w-5xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Grid className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Application Policies</h3>
                        <p className="text-sm text-muted-foreground">Manage app installation, updates, and permissions for Android</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenAddModal(true)}
                    disabled={availableAppNames.length === 0 && policies.length === 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                </Button>
            </div>

            {/* No apps warning */}
            {availableAppNames.length === 0 && policies.length === 0 && !isFetching && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No applications available. Please add applications first.
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
                                <TableHead className="w-[220px]">Application</TableHead>
                                <TableHead className="w-[160px]">Install Type</TableHead>
                                <TableHead className="w-[160px]">Auto Update</TableHead>
                                <TableHead className="w-[140px]">Permission</TableHead>
                                <TableHead className="w-[100px] text-center">Status</TableHead>
                                <TableHead className="w-[80px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.map((policy) => {
                                const appInfo = {
                                    name: policy.applicationName || policy.displayName || getAppDisplayInfo(policy.applicationVersionId).name,
                                    version: policy.applicationVersion || policy.displayVersion || getAppDisplayInfo(policy.applicationVersionId).version,
                                    packageName: policy.packageName || getAppDisplayInfo(policy.applicationVersionId).packageName,
                                };
                                const isExpanded = expandedRows.has(policy.id);
                                const installBadge = getInstallTypeBadge(policy.installType || 'AVAILABLE');

                                return (
                                    <React.Fragment key={policy.id}>
                                        {/* Main Row */}
                                        <TableRow className={cn(isExpanded && 'bg-muted/30')}>
                                            <TableCell className="px-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => toggleRowExpansion(policy.id)}
                                                >
                                                    {isExpanded
                                                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    }
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{appInfo.name}</p>
                                                    <p className="text-xs text-muted-foreground">v{appInfo.version}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={policy.installType || 'AVAILABLE'}
                                                    onValueChange={(v) => handleFieldChange(policy.id, 'installType', v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {INSTALL_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type} className="text-xs">
                                                                {formatEnumLabel(type)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={policy.autoUpdateMode || 'POSTPONE'}
                                                    onValueChange={(v) => handleFieldChange(policy.id, 'autoUpdateMode', v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {AUTO_UPDATE_MODES.map((mode) => (
                                                            <SelectItem key={mode} value={mode} className="text-xs">
                                                                {formatEnumLabel(mode)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={policy.defaultPermission || 'PROMPT'}
                                                    onValueChange={(v) => handleFieldChange(policy.id, 'defaultPermission', v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-[120px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PERMISSION_GRANTS.map((perm) => (
                                                            <SelectItem key={perm} value={perm} className="text-xs">
                                                                {formatEnumLabel(perm)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                                                            {/* Cross-Profile Communication */}
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Cross-Profile</Label>
                                                                <Select
                                                                    value={policy.communicateWithPersonalApp || 'DENY'}
                                                                    onValueChange={(v) => handleFieldChange(policy.id, 'communicateWithPersonalApp', v)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {CROSS_PROFILE_OPTIONS.map((opt) => (
                                                                            <SelectItem key={opt} value={opt} className="text-xs">
                                                                                {formatEnumLabel(opt)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            {/* Minimum Version Code */}
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">Min Version Code</Label>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    placeholder="Any"
                                                                    value={policy.minimumVersionCode ?? ''}
                                                                    onChange={(e) =>
                                                                        handleFieldChange(
                                                                            policy.id,
                                                                            'minimumVersionCode',
                                                                            e.target.value ? Number(e.target.value) : undefined
                                                                        )
                                                                    }
                                                                    className="h-8 text-xs w-24"
                                                                />
                                                            </div>

                                                            {/* Security Toggles */}
                                                            <div className="space-y-2.5 col-span-2">
                                                                <Label className="text-xs text-muted-foreground block">Security & Capabilities</Label>
                                                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <Switch
                                                                            checked={policy.disabled ?? false}
                                                                            onCheckedChange={(v) => handleFieldChange(policy.id, 'disabled', v)}
                                                                            className="scale-90"
                                                                        />
                                                                        <span>Disabled</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <Switch
                                                                            checked={policy.isCredentialProvider ?? false}
                                                                            onCheckedChange={(v) => handleFieldChange(policy.id, 'isCredentialProvider', v)}
                                                                            className="scale-90"
                                                                        />
                                                                        <span>Credential Provider</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <Switch
                                                                            checked={policy.canInstallCertificate ?? false}
                                                                            onCheckedChange={(v) => handleFieldChange(policy.id, 'canInstallCertificate', v)}
                                                                            className="scale-90"
                                                                        />
                                                                        <span>Install Certificates</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <Switch
                                                                            checked={policy.canAccessSecurityLogs ?? false}
                                                                            onCheckedChange={(v) => handleFieldChange(policy.id, 'canAccessSecurityLogs', v)}
                                                                            className="scale-90"
                                                                        />
                                                                        <span>Access Security Logs</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Set Permissions button */}
                                                        <div className="mt-4 flex justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => openPermissionDialog(policy)}
                                                            >
                                                                <Settings2 className="h-4 w-4 mr-2" />
                                                                Set Permissions
                                                            </Button>
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
            {policies.length === 0 && availableAppNames.length > 0 && !isFetching && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                        <Grid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="font-medium mb-2">No application policies configured</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Add applications to configure install type, updates, and permissions.
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
                            Add Application Policy
                        </DialogTitle>
                        <DialogDescription>
                            Select an application and configure its initial policy settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {availableAppNames.length === 0 ? (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    All available applications have already been added, or no apps exist.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                {/* Application */}
                                <div className="space-y-2">
                                    <Label>Application</Label>
                                    <Select
                                        value={selectedAppName}
                                        onValueChange={(value) => {
                                            setSelectedAppName(value);
                                            setSelectedVersion('');
                                            setSelectedVersionId('');
                                            const versions = getAvailableVersionsForApp(value);
                                            if (versions.length === 1) {
                                                setSelectedVersion(versions[0].version);
                                                setSelectedVersionId(versions[0].id);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select application" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAppNames.map((app) => (
                                                <SelectItem key={app.name} value={app.name}>
                                                    <div className="flex items-center gap-2">
                                                        <Grid className="h-4 w-4 text-blue-500" />
                                                        {app.displayName}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Version */}
                                <div className="space-y-2">
                                    <Label>Version</Label>
                                    <Select
                                        value={selectedVersionId}
                                        onValueChange={(value) => {
                                            setSelectedVersionId(value);
                                            const versions = getAvailableVersionsForApp(selectedAppName);
                                            const ver = versions.find((v) => v.id === value);
                                            if (ver) setSelectedVersion(ver.version);
                                        }}
                                        disabled={!selectedAppName}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getAvailableVersionsForApp(selectedAppName).map((ver) => (
                                                <SelectItem key={ver.id} value={ver.id}>
                                                    {ver.version}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Install Type */}
                                <div className="space-y-2">
                                    <Label>Install Type</Label>
                                    <Select
                                        value={selectedInstallType}
                                        onValueChange={(value) => setSelectedInstallType(value as InstallType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INSTALL_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {formatEnumLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddApplication} disabled={!selectedAppName || !selectedVersionId}>
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

            {/* Permissions Dialog */}
            <Dialog
                open={openPermissionDialogFor !== null}
                onOpenChange={(open) => !open && setOpenPermissionDialogFor(null)}
            >
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Set Application Permissions
                        </DialogTitle>
                        <DialogDescription>
                            Select how each permission should be handled for this app
                            (Prompt / Grant / Deny). Only changed entries will be sent on save.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-auto">
                        {permissionLoading ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-6">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading permissions...
                            </div>
                        ) : permissionList.length === 0 ? (
                            <div className="text-sm text-muted-foreground py-4">
                                No permissions available for this application.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {permissionList.map((p) => {
                                    // Format raw permission ID into a readable label
                                    const displayName = p.name || p.permissionId
                                        .replace(/^android\.permission\./i, '')
                                        .replace(/^com\.\w+(\.\w+)*\.permission\./i, '')
                                        .replace(/_/g, ' ')
                                        .toLowerCase()
                                        .replace(/\b\w/g, (c) => c.toUpperCase());

                                    return (
                                        <div
                                            key={p.permissionId}
                                            className="flex items-center gap-3 border rounded-md px-3 py-2.5"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate" title={p.permissionId}>
                                                    {displayName}
                                                </div>
                                                {p.description && (
                                                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                        {p.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-[140px] shrink-0">
                                                <Select
                                                    value={permissionSelections[p.permissionId] || ''}
                                                    onValueChange={(v) =>
                                                        setPermissionSelections((prev) => ({
                                                            ...prev,
                                                            [p.permissionId]: v as PermissionGrantValue,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PERMISSION_GRANTS.map((perm) => (
                                                            <SelectItem key={perm} value={perm}>
                                                                {formatEnumLabel(perm)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenPermissionDialogFor(null)}>
                            Cancel
                        </Button>
                        {openPermissionDialogFor && (
                            <Button onClick={() => savePermissionDialog(openPermissionDialogFor)}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
