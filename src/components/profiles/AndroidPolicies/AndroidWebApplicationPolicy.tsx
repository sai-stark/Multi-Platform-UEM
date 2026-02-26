import { WebApplicationService } from '@/api/services/webApps';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { getErrorMessage } from '@/utils/errorUtils';
import { AndroidWebApplicationPolicy as AndroidWebApplicationPolicyType, Platform, WebApplication } from '@/types/models';
import {
    AlertTriangle,
    Edit,
    Globe,
    Loader2,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AndroidWebApplicationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: AndroidWebApplicationPolicyType[];
    onSave: () => void;
    onCancel: () => void;
}

interface ExtendedWebApplicationPolicy extends Partial<AndroidWebApplicationPolicyType> {
    isNew?: boolean;
    displayName?: string;
}

export function AndroidWebApplicationPolicy({ platform, profileId, initialData = [], onSave, onCancel }: AndroidWebApplicationPolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState<ExtendedWebApplicationPolicy[]>(initialData || []);
    const [changedPolicies, setChangedPolicies] = useState<ExtendedWebApplicationPolicy[]>([]);
    const [availableWebApps, setAvailableWebApps] = useState<WebApplication[]>([]);

    // Modal states
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [appToDelete, setAppToDelete] = useState<ExtendedWebApplicationPolicy | null>(null);

    // Add modal form state
    const [selectedWebAppId, setSelectedWebAppId] = useState('');

    // Fetch available web applications
    useEffect(() => {
        const fetchWebApps = async () => {
            try {
                const response = await WebApplicationService.getWebApplications();
                setAvailableWebApps(response.content || []);
            } catch (error) {
                console.error('Failed to fetch web applications:', error);
                toast({
                    title: t('common.error'),
                    description: getErrorMessage(error, t('policies.webApp.saveFailed')),
                    variant: 'destructive',
                });
            }
        };
        fetchWebApps();
    }, [toast, t]);

    // Get available web apps (excluding already selected ones)
    const getAvailableWebApps = () => {
        const usedWebAppIds = new Set(
            policies
                .map(p => p.webAppId)
                .filter((id): id is string => id !== undefined)
        );

        return availableWebApps.filter(app => !usedWebAppIds.has(app.id));
    };

    // Get web app name from ID
    const getWebAppName = (webAppId?: string) => {
        if (!webAppId) return 'Unknown';
        const app = availableWebApps.find(a => a.id === webAppId);
        return app?.name || 'Unknown';
    };

    const resetAddModalState = () => {
        setSelectedWebAppId('');
    };

    const handleAddWebApp = () => {
        if (!selectedWebAppId) {
            toast({
                title: t('common.error'),
                description: t('policies.webApp.selectWebApp'),
                variant: 'destructive',
            });
            return;
        }

        const selectedApp = availableWebApps.find(app => app.id === selectedWebAppId);
        if (!selectedApp) {
            toast({
                title: t('common.error'),
                description: t('policies.webApp.appNotFound'),
                variant: 'destructive',
            });
            return;
        }

        const newPolicy: ExtendedWebApplicationPolicy = {
            id: `new-${Date.now()}`,
            webAppId: selectedWebAppId,
            keyCode: 1,
            screenOrder: 1,
            screenBottom: false,
            policyType: 'AndroidWebApplicationPolicy',
            isNew: true,
            displayName: selectedApp.name,
        };

        setChangedPolicies(prev => [...prev, newPolicy]);
        setPolicies(prev => [...prev, newPolicy]);
        setOpenAddModal(false);
        resetAddModalState();
    };

    const handleDeletePolicy = (policy: ExtendedWebApplicationPolicy) => {
        setAppToDelete(policy);
        setOpenDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;

        try {
            if (!appToDelete.isNew && appToDelete.id) {
                await policyAPI.deleteWebApplicationPolicy(platform, profileId, appToDelete.id);
            }
            setPolicies(prev => prev.filter(p => p.id !== appToDelete.id));
            setChangedPolicies(prev => prev.filter(p => p.id !== appToDelete.id));
            toast({
                title: t('common.success'),
                description: t('policies.webApp.deleteSuccess'),
            });
            onSave();
        } catch (error) {
            console.error('Failed to delete policy:', error);
            toast({
                title: t('common.error'),
                description: getErrorMessage(error, t('policies.webApp.deleteFailed')),
                variant: 'destructive',
            });
        }
        setOpenDeleteModal(false);
        setAppToDelete(null);
    };

    const handleFieldChange = (policyId: string, field: keyof ExtendedWebApplicationPolicy, value: any) => {
        setPolicies(prev =>
            prev.map(p => (p.id === policyId ? { ...p, [field]: value } : p))
        );
        setChangedPolicies(prev => {
            const existing = prev.find(p => p.id === policyId);
            const policy = policies.find(p => p.id === policyId);
            if (existing) {
                return prev.map(p => (p.id === policyId ? { ...p, [field]: value } : p));
            }
            return [...prev, { ...policy, [field]: value }];
        });
    };

    const handleScreenTypeChange = (policyId: string, useBottomPosition: boolean) => {
        if (useBottomPosition) {
            handleFieldChange(policyId, 'screenBottom', true);
            handleFieldChange(policyId, 'screenOrder', undefined);
        } else {
            handleFieldChange(policyId, 'screenBottom', false);
            handleFieldChange(policyId, 'screenOrder', 1);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const promises: Promise<unknown>[] = [];

            // Create new policies
            const newPolicies = changedPolicies.filter(p => p.isNew);
            for (const policy of newPolicies) {
                const { isNew, displayName, id, ...policyData } = policy;
                promises.push(policyAPI.createWebApplicationPolicy(platform, profileId, policyData));
            }

            // Update existing policies
            const updatedPolicies = changedPolicies.filter(p => !p.isNew);
            for (const policy of updatedPolicies) {
                const { isNew, displayName, ...policyData } = policy;
                if (policy.id) {
                    promises.push(policyAPI.updateWebApplicationPolicy(platform, profileId, policy.id, policyData));
                }
            }

            await Promise.all(promises);
            setChangedPolicies([]);
            toast({
                title: t('common.success'),
                description: t('policies.webApp.saveSuccess'),
            });
            onSave();
        } catch (error) {
            console.error('Failed to save policies:', error);
            toast({
                title: t('common.error'),
                description: getErrorMessage(error, t('policies.webApp.saveFailed')),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const availableWebAppsFiltered = getAvailableWebApps();
    const hasChanges = changedPolicies.length > 0;

    return (
        <div className="space-y-6 max-w-5xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Globe className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('policies.webApp.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('policies.webApp.subtitle')}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenAddModal(true)}
                    disabled={availableWebAppsFiltered.length === 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('policies.webApp.addWebApp')}
                </Button>
            </div>

            {/* No apps warning */}
            {availableWebAppsFiltered.length === 0 && policies.length === 0 && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {t('policies.webApp.noAppsWarning')}
                    </AlertDescription>
                </Alert>
            )}

            {/* Policies Table */}
            {policies.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">{t('policies.table.webAppName')}</TableHead>
                                <TableHead className="w-[150px]">{t('policies.table.screenType')}</TableHead>
                                <TableHead className="w-[120px]">{t('policies.table.keyCode')}</TableHead>
                                <TableHead className="w-[150px]">{t('policies.table.orderBottom')}</TableHead>
                                <TableHead className="w-[100px] text-center">{t('policies.table.status')}</TableHead>
                                <TableHead className="w-[80px] text-center">{t('policies.table.remove')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.map(policy => {
                                const appName = policy.displayName || policy.webAppName || getWebAppName(policy.webAppId);
                                const isBottomPosition = policy.screenBottom === true;

                                return (
                                    <TableRow key={policy.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-purple-500" />
                                                <span className="font-medium">{appName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs">{t('policies.action.order')}</Label>
                                                <Switch
                                                    checked={isBottomPosition}
                                                    onCheckedChange={(checked) => handleScreenTypeChange(policy.id!, checked)}
                                                />
                                                <Label className="text-xs">{t('policies.action.bottom')}</Label>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={policy.keyCode ?? 1}
                                                onChange={(e) => handleFieldChange(policy.id!, 'keyCode', Number(e.target.value))}
                                                className="w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {!isBottomPosition ? (
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={policy.screenOrder ?? 1}
                                                    onChange={(e) => handleFieldChange(policy.id!, 'screenOrder', Number(e.target.value))}
                                                    className="w-20"
                                                />
                                            ) : (
                                                <Badge variant="secondary">{t('policies.action.bottom')}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {policy.isNew ? (
                                                <Badge variant="secondary">{t('policies.action.new')}</Badge>
                                            ) : (
                                                <Badge variant="outline">{t('policies.action.saved')}</Badge>
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
            {policies.length === 0 && availableWebAppsFiltered.length > 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                        <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="font-medium mb-2">{t('policies.webApp.noAppPolicies')}</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('policies.webApp.addAppsDesc')}
                        </p>
                        <Button variant="outline" onClick={() => setOpenAddModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('policies.webApp.addWebApp')}
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

            {/* Add Web App Modal */}
            <Dialog open={openAddModal} onOpenChange={(open) => {
                setOpenAddModal(open);
                if (!open) resetAddModalState();
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            {t('policies.webApp.addWebApplication')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('policies.webApp.configureAction')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {availableWebAppsFiltered.length === 0 ? (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('policies.webApp.allAppsAdded')}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-2">
                                <Label>{t('policies.table.webAppName')}</Label>
                                <Select value={selectedWebAppId} onValueChange={setSelectedWebAppId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('policies.webApp.selectApp')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableWebAppsFiltered.map(app => (
                                            <SelectItem key={app.id} value={app.id}>
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-purple-500" />
                                                    {app.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddWebApp} disabled={!selectedWebAppId}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('policies.webApp.addWebApplication')}
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
                            {t('policies.webApp.deleteTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('policies.webApp.deleteConfirm')}
                        </DialogDescription>
                    </DialogHeader>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {t('policies.webApp.deleteWarning')}
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
