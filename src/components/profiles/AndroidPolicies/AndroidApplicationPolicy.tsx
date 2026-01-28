import { ApplicationService, Application, ApplicationVersion } from '@/api/services/applications';
import { policyAPI } from '@/api/services/Androidpolicies';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { AndroidApplicationPolicy as AndroidApplicationPolicyType, ApplicationAction, Platform } from '@/types/models';
import {
    AlertTriangle,
    AppWindow,
    Ban,
    Check,
    Download,
    Edit,
    Loader2,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AndroidApplicationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: AndroidApplicationPolicyType[];
    onSave: () => void;
    onCancel: () => void;
}

interface ExtendedApplicationPolicy extends Partial<AndroidApplicationPolicyType> {
    isNew?: boolean;
    displayName?: string;
    displayVersion?: string;
}

export function AndroidApplicationPolicy({ platform, profileId, initialData = [], onSave, onCancel }: AndroidApplicationPolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState<ExtendedApplicationPolicy[]>(initialData || []);
    const [changedPolicies, setChangedPolicies] = useState<ExtendedApplicationPolicy[]>([]);
    const [availableApps, setAvailableApps] = useState<Application[]>([]);

    // Modal states
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [appToDelete, setAppToDelete] = useState<ExtendedApplicationPolicy | null>(null);

    // Add modal form state
    const [selectedAppId, setSelectedAppId] = useState('');
    const [selectedVersionId, setSelectedVersionId] = useState('');
    const [selectedAction, setSelectedAction] = useState<ApplicationAction>('INSTALL');

    // Fetch available applications
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await ApplicationService.getApplications(platform);
                setAvailableApps(response.content || []);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
                toast({
                    title: t('common.error'),
                    description: t('policies.application.saveFailed'),
                    variant: 'destructive',
                });
            }
        };
        fetchApplications();
    }, [platform, toast, t]);

    // Get available app names (excluding already selected versions)
    const getAvailableAppsWithVersions = () => {
        const usedVersionIds = new Set(
            policies
                .map(p => p.applicationVersionId)
                .filter((id): id is string => id !== undefined)
        );

        return availableApps
            .map(app => ({
                ...app,
                availableVersions: (app.versions || []).filter(
                    v => !usedVersionIds.has(v.id)
                ),
            }))
            .filter(app => app.availableVersions.length > 0);
    };

    // Get app display info from version ID
    const getAppDisplayInfo = (applicationVersionId?: string) => {
        if (!applicationVersionId) return { name: 'Unknown', version: 'Unknown', packageName: '' };
        for (const app of availableApps) {
            const version = (app.versions || []).find(v => v.id === applicationVersionId);
            if (version) {
                return {
                    name: app.name,
                    version: version.versionName || version.versionCode,
                    packageName: app.packageName || '',
                };
            }
        }
        return { name: 'Unknown', version: 'Unknown', packageName: '' };
    };

    const getActionIcon = (action?: ApplicationAction) => {
        switch (action) {
            case 'INSTALL': return <Download className="w-4 h-4 text-green-500" />;
            case 'UNINSTALL': return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'ALLOW': return <Check className="w-4 h-4 text-blue-500" />;
            case 'BLOCK': return <Ban className="w-4 h-4 text-orange-500" />;
            default: return <AppWindow className="w-4 h-4" />;
        }
    };

    const getActionBadgeVariant = (action?: ApplicationAction) => {
        switch (action) {
            case 'INSTALL': return 'default';
            case 'UNINSTALL': return 'destructive';
            case 'ALLOW': return 'secondary';
            case 'BLOCK': return 'outline';
            default: return 'secondary';
        }
    };

    const resetAddModalState = () => {
        setSelectedAppId('');
        setSelectedVersionId('');
        setSelectedAction('INSTALL');
    };

    const handleAddApplication = () => {
        if (!selectedAppId || !selectedVersionId) {
            toast({
                title: t('common.error'),
                description: t('policies.application.selectAppVersion'),
                variant: 'destructive',
            });
            return;
        }

        const selectedApp = availableApps.find(app => app.id === selectedAppId);
        const selectedVersion = selectedApp?.versions?.find(v => v.id === selectedVersionId);

        if (!selectedApp || !selectedVersion) {
            toast({
                title: t('common.error'),
                description: t('policies.application.appNotFound'),
                variant: 'destructive',
            });
            return;
        }

        const newPolicy: ExtendedApplicationPolicy = {
            id: `new-${Date.now()}`,
            applicationVersionId: selectedVersionId,
            action: selectedAction,
            devicePolicyType: 'AndroidApplicationPolicy',
            isNew: true,
            displayName: selectedApp.name,
            displayVersion: selectedVersion.versionName || selectedVersion.versionCode,
        };

        setChangedPolicies(prev => [...prev, newPolicy]);
        setPolicies(prev => [...prev, newPolicy]);
        setOpenAddModal(false);
        resetAddModalState();
    };

    const handleDeletePolicy = (policy: ExtendedApplicationPolicy) => {
        setAppToDelete(policy);
        setOpenDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;

        try {
            if (!appToDelete.isNew && appToDelete.id) {
                await policyAPI.deleteApplicationPolicy(platform, profileId, appToDelete.id);
            }
            setPolicies(prev => prev.filter(p => p.id !== appToDelete.id));
            setChangedPolicies(prev => prev.filter(p => p.id !== appToDelete.id));
            toast({
                title: t('common.success'),
                description: t('policies.application.deleteSuccess'),
            });
        } catch (error) {
            console.error('Failed to delete policy:', error);
            toast({
                title: t('common.error'),
                description: t('policies.application.deleteFailed'),
                variant: 'destructive',
            });
        }
        setOpenDeleteModal(false);
        setAppToDelete(null);
    };

    const handleActionChange = (policyId: string, action: ApplicationAction) => {
        setPolicies(prev =>
            prev.map(p => (p.id === policyId ? { ...p, action } : p))
        );
        setChangedPolicies(prev => {
            const existing = prev.find(p => p.id === policyId);
            const policy = policies.find(p => p.id === policyId);
            if (existing) {
                return prev.map(p => (p.id === policyId ? { ...p, action } : p));
            }
            return [...prev, { ...policy, action }];
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const promises: Promise<unknown>[] = [];

            // Create new policies
            const newPolicies = changedPolicies.filter(p => p.isNew);
            for (const policy of newPolicies) {
                const { isNew, displayName, displayVersion, id, ...policyData } = policy;
                promises.push(policyAPI.createApplicationPolicy(platform, profileId, policyData));
            }

            // Update existing policies
            const updatedPolicies = changedPolicies.filter(p => !p.isNew);
            for (const policy of updatedPolicies) {
                const { isNew, displayName, displayVersion, ...policyData } = policy;
                if (policy.id) {
                    promises.push(policyAPI.updateApplicationPolicy(platform, profileId, policy.id, policyData));
                }
            }

            await Promise.all(promises);
            setChangedPolicies([]);
            toast({
                title: t('common.success'),
                description: t('policies.application.saveSuccess'),
            });
            onSave();
        } catch (error) {
            console.error('Failed to save policies:', error);
            toast({
                title: t('common.error'),
                description: t('policies.application.saveFailed'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const availableAppsWithVersions = getAvailableAppsWithVersions();
    const hasChanges = changedPolicies.length > 0;

    return (
        <div className="space-y-6 max-w-5xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <AppWindow className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('policies.application.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('policies.application.subtitle')}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenAddModal(true)}
                    disabled={availableAppsWithVersions.length === 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('policies.application.addApp')}
                </Button>
            </div>

            {/* No apps warning */}
            {availableAppsWithVersions.length === 0 && policies.length === 0 && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {t('policies.application.noAppsWarning')}
                    </AlertDescription>
                </Alert>
            )}

            {/* Policies Table */}
            {policies.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">{t('policies.table.application')}</TableHead>
                                <TableHead className="w-[150px]">{t('policies.table.version')}</TableHead>
                                <TableHead className="w-[150px]">{t('policies.table.action')}</TableHead>
                                <TableHead className="w-[100px] text-center">{t('policies.table.status')}</TableHead>
                                <TableHead className="w-[80px] text-center">{t('policies.table.remove')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.map(policy => {
                                const appInfo = policy.displayName
                                    ? { name: policy.displayName, version: policy.displayVersion, packageName: '' }
                                    : getAppDisplayInfo(policy.applicationVersionId);

                                return (
                                    <TableRow key={policy.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <AppWindow className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{appInfo.name}</p>
                                                    {appInfo.packageName && (
                                                        <p className="text-xs text-muted-foreground">{appInfo.packageName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">v{appInfo.version}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={policy.action}
                                                onValueChange={(v: ApplicationAction) => handleActionChange(policy.id!, v)}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="INSTALL">
                                                        <div className="flex items-center gap-2">
                                                            <Download className="w-4 h-4 text-green-500" />
                                                            {t('policies.action.install')}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="UNINSTALL">
                                                        <div className="flex items-center gap-2">
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                            {t('policies.action.uninstall')}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="ALLOW">
                                                        <div className="flex items-center gap-2">
                                                            <Check className="w-4 h-4 text-blue-500" />
                                                            {t('policies.action.allow')}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="BLOCK">
                                                        <div className="flex items-center gap-2">
                                                            <Ban className="w-4 h-4 text-orange-500" />
                                                            {t('policies.action.block')}
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {policy.isNew ? (
                                                <Badge variant="secondary">{t('policies.action.new')}</Badge>
                                            ) : (
                                                <Badge variant={getActionBadgeVariant(policy.action) as any}>
                                                    {getActionIcon(policy.action)}
                                                </Badge>
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
                                                            onClick={() => handleDeletePolicy(policy)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('common.delete')}</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Empty state */}
            {policies.length === 0 && availableAppsWithVersions.length > 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                        <AppWindow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="font-medium mb-2">{t('policies.application.noAppPolicies')}</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('policies.application.addAppsDesc')}
                        </p>
                        <Button variant="outline" onClick={() => setOpenAddModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('policies.application.addApp')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={loading || !hasChanges} className="gap-2 min-w-[140px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('form.saveChanges')}
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
                            {t('policies.application.addApp')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('policies.application.configureAction')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {availableAppsWithVersions.length === 0 ? (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('policies.application.allAppsAdded')}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>{t('policies.table.application')}</Label>
                                    <Select
                                        value={selectedAppId}
                                        onValueChange={(v) => {
                                            setSelectedAppId(v);
                                            setSelectedVersionId('');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('policies.application.selectApp')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAppsWithVersions.map(app => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    <div className="flex items-center gap-2">
                                                        <AppWindow className="h-4 w-4" />
                                                        {app.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedAppId && (
                                    <div className="space-y-2">
                                        <Label>{t('policies.table.version')}</Label>
                                        <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('policies.application.selectVersion')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableAppsWithVersions
                                                    .find(a => a.id === selectedAppId)
                                                    ?.availableVersions.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>
                                                            v{v.versionName || v.versionCode}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>{t('policies.table.action')}</Label>
                                    <Select value={selectedAction} onValueChange={(v: ApplicationAction) => setSelectedAction(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INSTALL">
                                                <div className="flex items-center gap-2">
                                                    <Download className="w-4 h-4 text-green-500" />
                                                    {t('policies.action.install')}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="UNINSTALL">
                                                <div className="flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                    {t('policies.action.uninstall')}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="ALLOW">
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                    {t('policies.action.allow')}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="BLOCK">
                                                <div className="flex items-center gap-2">
                                                    <Ban className="w-4 h-4 text-orange-500" />
                                                    {t('policies.action.block')}
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddApplication} disabled={!selectedAppId || !selectedVersionId}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('policies.application.addApp')}
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
                            {t('policies.application.deleteTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('policies.application.deleteConfirm')}
                        </DialogDescription>
                    </DialogHeader>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {t('policies.application.deleteWarning')}
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
