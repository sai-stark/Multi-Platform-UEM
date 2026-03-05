import { PolicyService } from '@/api/services/IOSpolicies';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Platform } from '@/types/common';
import { ApplicationPolicy, IosApplicationPolicy, NotificationPolicy as NotificationPolicyType } from '@/types/policy';
import { getErrorMessage } from '@/utils/errorUtils';
import { AlertTriangle, Bell, Car, CheckCircle2, Circle, Edit, Eye, Layout, Loader2, Lock, MessageSquare, Plus, Speaker, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: NotificationPolicyType[];
    applicationPolicy?: ApplicationPolicy[];
    onSave?: () => void | Promise<void>;
}

const ALERT_TYPE_OPTIONS = [
    { value: '0', label: 'None', description: 'No alerts' },
    { value: '1', label: 'Temporary Banner', description: 'Appears briefly at top' },
    { value: '2', label: 'Persistent Banner', description: 'Stays until dismissed' },
];

const GROUPING_TYPE_OPTIONS = [
    { value: '0', label: 'Automatic', description: 'App-specified groups' },
    { value: '1', label: 'By App', description: 'All in one group' },
    { value: '2', label: 'Off', description: "Don't group" },
];

const PREVIEW_TYPE_OPTIONS = [
    { value: '0', label: 'Always', description: 'Locked & unlocked' },
    { value: '1', label: 'When Unlocked', description: 'Only when unlocked' },
    { value: '2', label: 'Never', description: 'No previews' },
];

export function NotificationPolicy({ platform, profileId, initialData, applicationPolicy = [], onSave }: NotificationPolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [policies, setPolicies] = useState<NotificationPolicyType[]>(initialData || []);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<NotificationPolicyType | null>(null);
    const [formData, setFormData] = useState<Partial<NotificationPolicyType>>({});
    const [viewingPolicy, setViewingPolicy] = useState<NotificationPolicyType | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

    // Get iOS apps from applicationPolicy for the dropdown
    const iosApps = applicationPolicy
        .filter((app): app is IosApplicationPolicy => 'devicePolicyType' in app && app.devicePolicyType === 'IosApplicationPolicy')
        .filter(app => app.applicationId); // Only apps with applicationIds

    const getAppNameById = (appId?: string): string => {
        if (!appId) return 'Unknown App';
        const app = iosApps.find(a => a.applicationId === appId);
        return app?.name || appId;
    };

    const handleViewPolicy = (policy: NotificationPolicyType) => {
        setViewingPolicy(policy);
        setIsViewDialogOpen(true);
    };

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const data = await PolicyService.getNotificationPolicies(platform, profileId);
            setPolicies(data.content || []);
        } catch (error) {
            console.error('Failed to fetch notification policies:', error);
            toast({
                title: 'Error',
                description: getErrorMessage(error, 'Failed to load notification policies'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setPolicies(initialData);
        } else {
            fetchPolicies();
        }
    }, [platform, profileId, initialData]);

    const handleOpenDialog = (policy?: NotificationPolicyType) => {
        if (policy) {
            setEditingPolicy(policy);
            setFormData({ ...policy });
        } else {
            setEditingPolicy(null);
            setFormData({
                name: 'ios',
                policyType: 'IosNotificationSettings',
                applicationId: '',
                notificationsEnabled: true,
                showInNotificationCenter: true,
                showInLockScreen: true,
                alertType: 1,
                badgesEnabled: true,
                soundsEnabled: true,
                showInCarPlay: true,
                criticalAlertEnabled: false,
                groupingType: 0,
                previewType: 0,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.applicationId) {
            toast({
                title: 'Validation Error',
                description: 'Please select an application for this notification policy.',
                variant: 'destructive',
            });
            return;
        }
        const payload: NotificationPolicyType = {
            ...formData as NotificationPolicyType,
            policyType: 'IosNotificationSettings',
        };
        try {
            if (editingPolicy?.id) {
                await PolicyService.updateNotificationPolicy(platform, profileId, editingPolicy.id, payload);
                toast({ title: 'Success', description: 'Policy updated successfully' });
            } else {
                await PolicyService.createNotificationPolicy(platform, profileId, payload);
                toast({ title: 'Success', description: 'Policy created successfully' });
            }
            setIsDialogOpen(false);
            fetchPolicies();
            if (onSave) onSave();
        } catch (error) {
            console.error('Failed to save policy:', error);
            toast({
                title: 'Error',
                description: getErrorMessage(error, 'Failed to save policy'),
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (policyId: string) => {
        try {
            await PolicyService.deleteNotificationPolicy(platform, profileId, policyId);
            toast({ title: 'Success', description: 'Policy deleted successfully' });
            fetchPolicies();
            if (onSave) onSave();
        } catch (error) {
            console.error('Failed to delete policy:', error);
            toast({
                title: 'Error',
                description: getErrorMessage(error, 'Failed to delete policy'),
                variant: 'destructive',
            });
        }
    };

    const openDeleteDialog = (id: string) => {
        setTargetDeleteId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (targetDeleteId) await handleDelete(targetDeleteId);
        setTargetDeleteId(null);
    };

    const FeatureItem = ({ icon: Icon, label, value, enabled }: { icon: React.ElementType, label: string, value?: string, enabled?: boolean }) => (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
            <div className={`p-2 rounded-full ${enabled ? 'bg-primary/10 text-primary' : (enabled === false ? 'bg-muted text-muted-foreground' : 'bg-primary/5 text-primary/70')}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none mb-1">{label}</p>
                <div className="flex items-center gap-1.5">
                    {enabled !== undefined && (
                        enabled ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-muted-foreground" />
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                        {value || (enabled ? 'Enabled' : 'Disabled')}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Bell className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Notification Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure per-app notification preferences</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} disabled={iosApps.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Policy
                </Button>
            </div>

            {iosApps.length === 0 && (
                <div className="p-4 border border-dashed rounded-lg bg-amber-50/50 text-amber-800 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                        <p className="font-medium">No applications assigned to this profile</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Add application policies to this profile first, then configure notification settings for them.
                        </p>
                    </div>
                </div>
            )}

            {loading && policies.length === 0 ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {policies.map((policy) => (
                        <Card key={policy.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500/60" onClick={() => handleViewPolicy(policy)}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`p-2.5 rounded-lg ${policy.notificationsEnabled !== false ? 'bg-blue-500/10' : 'bg-muted'}`}>
                                            <Bell className={`w-5 h-5 ${policy.notificationsEnabled !== false ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium truncate">{getAppNameById(policy.applicationId)}</h4>
                                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                {policy.applicationId || policy.bundleIdentifier || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Quick status badges */}
                                        <div className="hidden md:flex items-center gap-1.5">
                                            {policy.notificationsEnabled !== false ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">ON</span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">OFF</span>
                                            )}
                                            {policy.criticalAlertEnabled && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-medium flex items-center gap-0.5">
                                                    <AlertTriangle className="w-2.5 h-2.5" /> Critical
                                                </span>
                                            )}
                                            {policy.soundsEnabled !== false && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">🔊</span>
                                            )}
                                            {policy.badgesEnabled !== false && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">🔴</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenDialog(policy); }}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); openDeleteDialog(policy.id!); }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {/* Detail row — visible settings summary */}
                                <div className="flex flex-wrap gap-2 mt-3 ml-14">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                        Alert: {ALERT_TYPE_OPTIONS.find(a => a.value === String(policy.alertType ?? 1))?.label || 'Banner'}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                        Preview: {PREVIEW_TYPE_OPTIONS.find(p => p.value === String(policy.previewType ?? 0))?.label || 'Always'}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                        Group: {GROUPING_TYPE_OPTIONS.find(g => g.value === String(policy.groupingType ?? 0))?.label || 'Automatic'}
                                    </span>
                                    {policy.showInLockScreen !== false && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">🔒 Lock Screen</span>
                                    )}
                                    {policy.showInCarPlay && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">🚗 CarPlay</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {policies.length === 0 && iosApps.length > 0 && (
                        <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">No notification policies configured</p>
                            <p className="text-xs mt-1">Click "Add Policy" to configure notifications for an app.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notification Policy?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this notification policy from the profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? 'Edit Notification Policy' : 'Add Notification Policy'}</DialogTitle>
                        <DialogDescription>Configure notification settings for an application assigned to this profile.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 py-4">
                        {/* Application Selection */}
                        <div className="space-y-2">
                            <Label>Application <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.applicationId || ''}
                                onValueChange={(val) => setFormData({ ...formData, applicationId: val })}
                                disabled={!!editingPolicy}
                            >
                                <SelectTrigger className={!formData.applicationId ? 'border-red-300' : ''}>
                                    <SelectValue placeholder="Select an application..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {iosApps.map((app) => (
                                        <SelectItem key={app.applicationId} value={app.applicationId!}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{app.name}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{app.applicationId}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {iosApps.length === 0 && (
                                        <div className="p-3 text-sm text-muted-foreground text-center">
                                            No apps assigned to this profile yet.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            {!formData.applicationId && (
                                <p className="text-[11px] text-destructive">Select an app from the profile's application policies</p>
                            )}
                        </div>

                        {/* Toggle Grid */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Notification Delivery</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="notificationsEnabled" className="cursor-pointer text-sm">Enable Notifications</Label>
                                        <p className="text-[11px] text-muted-foreground">Allow this app to send notifications</p>
                                    </div>
                                    <Switch
                                        id="notificationsEnabled"
                                        checked={formData.notificationsEnabled}
                                        onCheckedChange={(c) => setFormData({ ...formData, notificationsEnabled: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="criticalAlertEnabled" className="cursor-pointer text-sm flex items-center gap-1.5">
                                            Critical Alerts <AlertTriangle className="w-3 h-3 text-orange-500" />
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">Override Do Not Disturb (iOS 12+)</p>
                                    </div>
                                    <Switch
                                        id="criticalAlertEnabled"
                                        checked={formData.criticalAlertEnabled}
                                        onCheckedChange={(c) => setFormData({ ...formData, criticalAlertEnabled: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="showInNotificationCenter" className="cursor-pointer text-sm">Notification Center</Label>
                                        <p className="text-[11px] text-muted-foreground">Show in notification history</p>
                                    </div>
                                    <Switch
                                        id="showInNotificationCenter"
                                        checked={formData.showInNotificationCenter}
                                        onCheckedChange={(c) => setFormData({ ...formData, showInNotificationCenter: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="showInLockScreen" className="cursor-pointer text-sm">Lock Screen</Label>
                                        <p className="text-[11px] text-muted-foreground">Show on lock screen</p>
                                    </div>
                                    <Switch
                                        id="showInLockScreen"
                                        checked={formData.showInLockScreen}
                                        onCheckedChange={(c) => setFormData({ ...formData, showInLockScreen: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="badgesEnabled" className="cursor-pointer text-sm">Badges</Label>
                                        <p className="text-[11px] text-muted-foreground">Show badge count on app icon</p>
                                    </div>
                                    <Switch
                                        id="badgesEnabled"
                                        checked={formData.badgesEnabled}
                                        onCheckedChange={(c) => setFormData({ ...formData, badgesEnabled: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="soundsEnabled" className="cursor-pointer text-sm">Sounds</Label>
                                        <p className="text-[11px] text-muted-foreground">Play sound with notifications</p>
                                    </div>
                                    <Switch
                                        id="soundsEnabled"
                                        checked={formData.soundsEnabled}
                                        onCheckedChange={(c) => setFormData({ ...formData, soundsEnabled: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label htmlFor="showInCarPlay" className="cursor-pointer text-sm">CarPlay</Label>
                                        <p className="text-[11px] text-muted-foreground">Show in CarPlay (iOS 12+)</p>
                                    </div>
                                    <Switch
                                        id="showInCarPlay"
                                        checked={formData.showInCarPlay}
                                        onCheckedChange={(c) => setFormData({ ...formData, showInCarPlay: c })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Enum Selects */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Alert Type</Label>
                                <Select
                                    value={String(formData.alertType ?? 1)}
                                    onValueChange={(v) => setFormData({ ...formData, alertType: parseInt(v) })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ALERT_TYPE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div>
                                                    <span className="font-medium">{opt.label}</span>
                                                    <span className="text-xs text-muted-foreground ml-1">— {opt.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Grouping (iOS 12+)</Label>
                                <Select
                                    value={String(formData.groupingType ?? 0)}
                                    onValueChange={(v) => setFormData({ ...formData, groupingType: parseInt(v) })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {GROUPING_TYPE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div>
                                                    <span className="font-medium">{opt.label}</span>
                                                    <span className="text-xs text-muted-foreground ml-1">— {opt.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Preview (iOS 14+)</Label>
                                <Select
                                    value={String(formData.previewType ?? 0)}
                                    onValueChange={(v) => setFormData({ ...formData, previewType: parseInt(v) })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PREVIEW_TYPE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div>
                                                    <span className="font-medium">{opt.label}</span>
                                                    <span className="text-xs text-muted-foreground ml-1">— {opt.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button type="submit" disabled={!formData.applicationId}>{t('common.save')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Bell className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{getAppNameById(viewingPolicy?.applicationId)}</DialogTitle>
                                <DialogDescription className="mt-1 font-mono text-xs bg-muted px-2 py-1 rounded inline-block">
                                    {viewingPolicy?.applicationId || viewingPolicy?.bundleIdentifier || '—'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Main Status */}
                        <div className={`p-4 rounded-lg border ${viewingPolicy?.notificationsEnabled !== false ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${viewingPolicy?.notificationsEnabled !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Overall Status</p>
                                        <p className={`text-xs ${viewingPolicy?.notificationsEnabled !== false ? 'text-green-600' : 'text-red-600'}`}>
                                            Notifications are {viewingPolicy?.notificationsEnabled !== false ? 'allowed' : 'blocked'} for this app
                                        </p>
                                    </div>
                                </div>
                                {viewingPolicy?.notificationsEnabled !== false && viewingPolicy?.criticalAlertEnabled && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                        <AlertTriangle className="w-3 h-3" />
                                        Critical Alerts
                                    </div>
                                )}
                            </div>
                        </div>

                        {viewingPolicy?.notificationsEnabled !== false && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <FeatureItem
                                        icon={Layout}
                                        label="Notification Center"
                                        enabled={viewingPolicy?.showInNotificationCenter}
                                        value={viewingPolicy?.showInNotificationCenter ? 'Visible in History' : 'Hidden from History'}
                                    />
                                    <FeatureItem
                                        icon={Lock}
                                        label="Lock Screen"
                                        enabled={viewingPolicy?.showInLockScreen}
                                        value={viewingPolicy?.showInLockScreen ? 'Show on Lock Screen' : 'Hide from Lock Screen'}
                                    />
                                    <FeatureItem
                                        icon={Circle}
                                        label="App Badges"
                                        enabled={viewingPolicy?.badgesEnabled}
                                        value={viewingPolicy?.badgesEnabled ? 'Allow Badges' : 'No Badges'}
                                    />
                                    <FeatureItem
                                        icon={Speaker}
                                        label="Sounds"
                                        enabled={viewingPolicy?.soundsEnabled}
                                        value={viewingPolicy?.soundsEnabled ? 'Play Sounds' : 'Silent'}
                                    />
                                    <FeatureItem
                                        icon={Car}
                                        label="CarPlay"
                                        enabled={viewingPolicy?.showInCarPlay}
                                        value={viewingPolicy?.showInCarPlay ? 'Show in CarPlay' : 'Hide in CarPlay'}
                                    />
                                    <FeatureItem
                                        icon={MessageSquare}
                                        label="Alert Style"
                                        value={ALERT_TYPE_OPTIONS.find(a => a.value === String(viewingPolicy?.alertType ?? 1))?.label || 'Banner'}
                                        enabled={viewingPolicy?.alertType !== 0}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border bg-muted/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs font-medium">Preview</span>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {PREVIEW_TYPE_OPTIONS.find(p => p.value === String(viewingPolicy?.previewType ?? 0))?.label || 'Always'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {PREVIEW_TYPE_OPTIONS.find(p => p.value === String(viewingPolicy?.previewType ?? 0))?.description}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-muted/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Layout className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs font-medium">Grouping</span>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {GROUPING_TYPE_OPTIONS.find(g => g.value === String(viewingPolicy?.groupingType ?? 0))?.label || 'Automatic'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {GROUPING_TYPE_OPTIONS.find(g => g.value === String(viewingPolicy?.groupingType ?? 0))?.description}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Audit Info */}
                        {(viewingPolicy?.creationTime || viewingPolicy?.modificationTime) && (
                            <div className="border-t pt-4 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                {viewingPolicy.creationTime && <div><span className="font-medium">Created:</span> {new Date(viewingPolicy.creationTime).toLocaleDateString()}</div>}
                                {viewingPolicy.modificationTime && <div><span className="font-medium">Modified:</span> {new Date(viewingPolicy.modificationTime).toLocaleDateString()}</div>}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>{t('common.close')}</Button>
                        <Button onClick={() => { setIsViewDialogOpen(false); handleOpenDialog(viewingPolicy!); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
