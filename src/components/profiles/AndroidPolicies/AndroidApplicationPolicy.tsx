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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
    ChevronRight,
    Download,
    Grid,
    KeyRound,
    Loader2,
    Lock,
    Package,
    Plus,
    RefreshCw,
    Save,
    Search,
    Settings2,
    Shield,
    ShieldCheck,
    Trash2,
    Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    // State
    const [policies, setPolicies] = useState<ExtendedPolicy[]>(
        (initialData as ExtendedPolicy[]) || []
    );
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

    // Auto-select first policy when policies load
    useEffect(() => {
        if (policies.length > 0 && !selectedPolicyId) {
            setSelectedPolicyId(policies[0].id);
        }
    }, [policies]);

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

    const getAppInfo = (policy: ExtendedPolicy) => ({
        name: policy.applicationName || policy.displayName || getAppDisplayInfo(policy.applicationVersionId).name,
        version: policy.applicationVersion || policy.displayVersion || getAppDisplayInfo(policy.applicationVersionId).version,
        packageName: policy.packageName || getAppDisplayInfo(policy.applicationVersionId).packageName,
    });

    const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) || null;

    // ====================================================================
    // Handlers
    // ====================================================================
    const resetAddModalState = () => {
        setSelectedAppName('');
        setSelectedVersion('');
        setSelectedVersionId('');
        setSelectedInstallType('INSTALL_REMOVABLE');
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
        setSelectedPolicyId(newPolicy.id);
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
            if (selectedPolicyId === appToDelete.id) {
                setSelectedPolicyId(null);
            }
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

    // Filter the list
    const filteredPolicies = listSearchQuery.trim()
        ? policies.filter((p) => {
              const info = getAppInfo(p);
              const q = listSearchQuery.toLowerCase();
              return (
                  info.name.toLowerCase().includes(q) ||
                  info.packageName.toLowerCase().includes(q) ||
                  info.version.toLowerCase().includes(q)
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
                        <p className="text-sm text-muted-foreground mt-0.5">Manage app installation, updates, and permissions for Android</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={() => setOpenAddModal(true)}
                    disabled={availableAppNames.length === 0 && policies.length === 0}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Add Application
                </Button>
            </div>

            {/* No apps warning */}
            {availableAppNames.length === 0 && policies.length === 0 && !isFetching && (
                <div className="flex-1 flex items-center justify-center">
                    <Alert className="max-w-md">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            No applications available. Please add applications first.
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
                                const isSelected = selectedPolicyId === policy.id;
                                const badge = getInstallTypeBadge(policy.installType || 'AVAILABLE');
                                const initial = (info.name || '?')[0].toUpperCase();
                                const avatarColors = [
                                    'from-blue-500 to-blue-600',
                                    'from-violet-500 to-purple-600',
                                    'from-emerald-500 to-teal-600',
                                    'from-orange-500 to-amber-600',
                                    'from-pink-500 to-rose-600',
                                    'from-cyan-500 to-sky-600',
                                ];
                                const colorIdx = info.name.length % avatarColors.length;

                                return (
                                    <div
                                        key={policy.id}
                                        className={cn(
                                            'group flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-all duration-200',
                                            isSelected
                                                ? 'bg-blue-500/10 dark:bg-blue-500/15 border-l-[3px] border-l-blue-500 shadow-[inset_0_0_20px_-12px_rgba(59,130,246,0.3)]'
                                                : 'hover:bg-muted/60 border-l-[3px] border-l-transparent hover:border-l-border'
                                        )}
                                        onClick={() => setSelectedPolicyId(policy.id)}
                                    >
                                        {/* App Avatar */}
                                        <div className={cn(
                                            'w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105',
                                            `bg-gradient-to-br ${avatarColors[colorIdx]}`
                                        )}>
                                            {initial}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={cn("font-medium text-sm truncate transition-colors", isSelected && "text-blue-600 dark:text-blue-400")}>{info.name}</p>
                                                {policy.isNew && (
                                                    <Badge className="text-[10px] px-1.5 py-0 shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">New</Badge>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">v{info.version}</p>
                                            <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 mt-1">
                                                {badge.label}
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
                            <DetailPanel
                                policy={selectedPolicy}
                                appInfo={getAppInfo(selectedPolicy)}
                                onFieldChange={handleFieldChange}
                                onOpenPermissions={() => openPermissionDialog(selectedPolicy)}
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
            {policies.length === 0 && availableAppNames.length > 0 && !isFetching && (
                <div className="flex-1 flex items-center justify-center">
                    <Card className="border-dashed max-w-sm border-2 border-blue-500/20">
                        <CardContent className="py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-5">
                                <Grid className="w-7 h-7 text-blue-500/60" />
                            </div>
                            <h4 className="font-semibold text-base mb-2">No application policies configured</h4>
                            <p className="text-sm text-muted-foreground mb-6 max-w-[260px] mx-auto leading-relaxed">
                                Add applications to configure install type, updates, and permissions.
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
                                    All available Android applications have already been added, or no apps are registered.{' '}
                                    <span
                                        className="text-sky-500 hover:text-sky-400 hover:underline cursor-pointer transition-colors"
                                        onClick={() => {
                                            setOpenAddModal(false);
                                            navigate('/applications?platform=android');
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
                <DialogContent className="max-w-[80vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5" />
                            Set Application Permissions
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Select how each permission should be handled for this app
                            (Prompt / Grant / Deny). Only changed entries will be sent on save.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[65vh] overflow-auto">
                        {permissionLoading ? (
                            <div className="flex items-center justify-center gap-2 text-base text-muted-foreground py-6">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading permissions...
                            </div>
                        ) : permissionList.length === 0 ? (
                            <div className="text-base text-muted-foreground py-4">
                                No permissions available for this application.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
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
                                            className="flex items-center gap-4 border rounded-lg px-4 py-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-base font-medium" title={p.permissionId}>
                                                    {displayName}
                                                </div>
                                                {p.description && (
                                                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {p.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-[160px] shrink-0">
                                                <Select
                                                    value={permissionSelections[p.permissionId] || ''}
                                                    onValueChange={(v) =>
                                                        setPermissionSelections((prev) => ({
                                                            ...prev,
                                                            [p.permissionId]: v as PermissionGrantValue,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 text-sm">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PERMISSION_GRANTS.map((perm) => (
                                                            <SelectItem key={perm} value={perm} className="text-sm">
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

// ====================================================================
// Detail Panel Sub-component
// ====================================================================
interface DetailPanelProps {
    policy: ExtendedPolicy;
    appInfo: { name: string; version: string; packageName: string };
    onFieldChange: (id: string, field: keyof AndroidApplicationPolicyType, value: boolean | string | number | undefined) => void;
    onOpenPermissions: () => void;
}

function DetailPanel({ policy, appInfo, onFieldChange, onOpenPermissions }: DetailPanelProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* App Info Header */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-card to-muted/30 p-5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20 shrink-0">
                        {(appInfo.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold truncate">{appInfo.name}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-0.5 font-mono">{appInfo.packageName}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs font-medium">v{appInfo.version}</Badge>
                            {policy.isNew && <Badge className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">New</Badge>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Installation Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Download className="w-4 h-4 text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider">Installation</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                        <Label className="text-xs font-medium text-muted-foreground">Install Type</Label>
                        <Select
                            value={policy.installType || 'AVAILABLE'}
                            onValueChange={(v) => onFieldChange(policy.id, 'installType', v)}
                        >
                            <SelectTrigger className="h-9 bg-background/80">
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

                    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                        <Label className="text-xs font-medium text-muted-foreground">Auto Update</Label>
                        <Select
                            value={policy.autoUpdateMode || 'POSTPONE'}
                            onValueChange={(v) => onFieldChange(policy.id, 'autoUpdateMode', v)}
                        >
                            <SelectTrigger className="h-9 bg-background/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AUTO_UPDATE_MODES.map((mode) => (
                                    <SelectItem key={mode} value={mode}>
                                        {formatEnumLabel(mode)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                        <Label className="text-xs font-medium text-muted-foreground">Min Version Code</Label>
                        <Input
                            type="number"
                            min={0}
                            placeholder="Any"
                            value={policy.minimumVersionCode ?? ''}
                            onChange={(e) =>
                                onFieldChange(
                                    policy.id,
                                    'minimumVersionCode',
                                    e.target.value ? Number(e.target.value) : undefined
                                )
                            }
                            className="h-9 bg-background/80"
                        />
                    </div>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Permissions Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-violet-500" />
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider">Permissions</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                        <Label className="text-xs font-medium text-muted-foreground">Default Permission</Label>
                        <Select
                            value={policy.defaultPermission || 'PROMPT'}
                            onValueChange={(v) => onFieldChange(policy.id, 'defaultPermission', v)}
                        >
                            <SelectTrigger className="h-9 bg-background/80">
                                <SelectValue />
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

                    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors duration-200">
                        <Label className="text-xs font-medium text-muted-foreground">Cross-Profile</Label>
                        <Select
                            value={policy.communicateWithPersonalApp || 'DENY'}
                            onValueChange={(v) => onFieldChange(policy.id, 'communicateWithPersonalApp', v)}
                        >
                            <SelectTrigger className="h-9 bg-background/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CROSS_PROFILE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {formatEnumLabel(opt)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end mt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onOpenPermissions}
                        className="gap-2 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all duration-200"
                    >
                        <Settings2 className="h-4 w-4" />
                        Set Individual Permissions
                    </Button>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Security & Capabilities Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider">Security & Capabilities</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() => onFieldChange(policy.id, 'disabled', !(policy.disabled ?? false))}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/15 transition-colors">
                                <Lock className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Disabled</span>
                                <p className="text-xs text-muted-foreground">Prevent the app from running</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.disabled ?? false}
                            onCheckedChange={(v) => onFieldChange(policy.id, 'disabled', v)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() => onFieldChange(policy.id, 'isCredentialProvider', !(policy.isCredentialProvider ?? false))}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                                <KeyRound className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Credential Provider</span>
                                <p className="text-xs text-muted-foreground">Allow as credential provider</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.isCredentialProvider ?? false}
                            onCheckedChange={(v) => onFieldChange(policy.id, 'isCredentialProvider', v)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() => onFieldChange(policy.id, 'canInstallCertificate', !(policy.canInstallCertificate ?? false))}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Install Certificates</span>
                                <p className="text-xs text-muted-foreground">Allow installing certificates</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.canInstallCertificate ?? false}
                            onCheckedChange={(v) => onFieldChange(policy.id, 'canInstallCertificate', v)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div
                        className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        onClick={() => onFieldChange(policy.id, 'canAccessSecurityLogs', !(policy.canAccessSecurityLogs ?? false))}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                                <Zap className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Access Security Logs</span>
                                <p className="text-xs text-muted-foreground">Company-owned devices only</p>
                            </div>
                        </div>
                        <Switch
                            checked={policy.canAccessSecurityLogs ?? false}
                            onCheckedChange={(v) => onFieldChange(policy.id, 'canAccessSecurityLogs', v)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
