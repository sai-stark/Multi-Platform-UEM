import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { NotificationPolicy as NotificationPolicyType, Platform } from '@/types/models';
import { AlertTriangle, Bell, Car, CheckCircle2, Circle, Edit, Eye, Layout, Loader2, Lock, MessageSquare, Plus, Speaker, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: NotificationPolicyType[];
}

export function NotificationPolicy({ platform, profileId, initialData }: NotificationPolicyProps) {
    const { toast } = useToast();
    const [policies, setPolicies] = useState<NotificationPolicyType[]>(initialData || []);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<NotificationPolicyType | null>(null);
    const [formData, setFormData] = useState<Partial<NotificationPolicyType>>({});
    const [viewingPolicy, setViewingPolicy] = useState<NotificationPolicyType | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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
                description: 'Failed to load notification policies',
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
                bundleIdentifier: '',
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
        try {
            if (editingPolicy?.id) {
                await PolicyService.updateNotificationPolicy(platform, profileId, editingPolicy.id, formData as NotificationPolicyType);
                toast({ title: 'Success', description: 'Policy updated successfully' });
            } else {
                await PolicyService.createNotificationPolicy(platform, profileId, formData as NotificationPolicyType);
                toast({ title: 'Success', description: 'Policy created successfully' });
            }
            setIsDialogOpen(false);
            fetchPolicies();
        } catch (error) {
            console.error('Failed to save policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to save policy',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (policyId: string) => {
        if (!confirm('Are you sure you want to delete this policy?')) return;
        try {
            await PolicyService.deleteNotificationPolicy(platform, profileId, policyId);
            toast({ title: 'Success', description: 'Policy deleted successfully' });
            fetchPolicies();
        } catch (error) {
            console.error('Failed to delete policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete policy',
                variant: 'destructive',
            });
        }
    };

    const FeatureItem = ({ icon: Icon, label, value, enabled }: { icon: any, label: string, value?: string, enabled?: boolean }) => (
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
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage notification preferences for specific apps</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Policy
                </Button>
            </div>

            {loading && policies.length === 0 ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {policies.map((policy) => (
                        <Card key={policy.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewPolicy(policy)}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Bell className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{policy.name || policy.bundleIdentifier}</h4>
                                        <p className="text-sm text-muted-foreground">{policy.bundleIdentifier}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(policy); }}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(policy.id!); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {policies.length === 0 && (
                        <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                            No notification policies configured.
                        </div>
                    )}
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? 'Edit Notification Policy' : 'Add Notification Policy'}</DialogTitle>
                        <DialogDescription>Configure notification settings for an application bundle.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        {/* ... form content ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Policy Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Mail Settings"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bundleId">Bundle Identifier</Label>
                                <Input
                                    id="bundleId"
                                    value={formData.bundleIdentifier || ''}
                                    onChange={(e) => setFormData({ ...formData, bundleIdentifier: e.target.value })}
                                    placeholder="com.example.app"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="notificationsEnabled" className="cursor-pointer flex-1">Enable Notifications</Label>
                                <Switch
                                    id="notificationsEnabled"
                                    checked={formData.notificationsEnabled}
                                    onCheckedChange={(c) => setFormData({ ...formData, notificationsEnabled: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="criticalAlertEnabled" className="cursor-pointer flex-1 flex items-center gap-2">
                                    Critical Alerts <AlertTriangle className="w-3 h-3 text-orange-500" />
                                </Label>
                                <Switch
                                    id="criticalAlertEnabled"
                                    checked={formData.criticalAlertEnabled}
                                    onCheckedChange={(c) => setFormData({ ...formData, criticalAlertEnabled: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="showInNotificationCenter" className="cursor-pointer flex-1">Notification Center</Label>
                                <Switch
                                    id="showInNotificationCenter"
                                    checked={formData.showInNotificationCenter}
                                    onCheckedChange={(c) => setFormData({ ...formData, showInNotificationCenter: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="showInLockScreen" className="cursor-pointer flex-1">Lock Screen</Label>
                                <Switch
                                    id="showInLockScreen"
                                    checked={formData.showInLockScreen}
                                    onCheckedChange={(c) => setFormData({ ...formData, showInLockScreen: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="badgesEnabled" className="cursor-pointer flex-1">Badges</Label>
                                <Switch
                                    id="badgesEnabled"
                                    checked={formData.badgesEnabled}
                                    onCheckedChange={(c) => setFormData({ ...formData, badgesEnabled: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="soundsEnabled" className="cursor-pointer flex-1">Sounds</Label>
                                <Switch
                                    id="soundsEnabled"
                                    checked={formData.soundsEnabled}
                                    onCheckedChange={(c) => setFormData({ ...formData, soundsEnabled: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <Label htmlFor="showInCarPlay" className="cursor-pointer flex-1">CarPlay</Label>
                                <Switch
                                    id="showInCarPlay"
                                    checked={formData.showInCarPlay}
                                    onCheckedChange={(c) => setFormData({ ...formData, showInCarPlay: c })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="alertType">Alert Type (0-None, 1-Banner, 2-Modal)</Label>
                                <Input
                                    id="alertType"
                                    type="number"
                                    min={0}
                                    max={2}
                                    value={formData.alertType}
                                    onChange={(e) => setFormData({ ...formData, alertType: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="previewType">Preview Type (0-Always, 1-Unlocked, 2-Never)</Label>
                                <Input
                                    id="previewType"
                                    type="number"
                                    min={0}
                                    max={2}
                                    value={formData.previewType}
                                    onChange={(e) => setFormData({ ...formData, previewType: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Policy</Button>
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
                                <DialogTitle className="text-xl">{viewingPolicy?.name || 'Notification Policy'}</DialogTitle>
                                <DialogDescription className="mt-1 font-mono text-xs bg-muted px-2 py-1 rounded inline-block">
                                    {viewingPolicy?.bundleIdentifier}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Main Status */}
                        <div className={`p-4 rounded-lg border ${viewingPolicy?.notificationsEnabled ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${viewingPolicy?.notificationsEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Overall Status</p>
                                        <p className={`text-xs ${viewingPolicy?.notificationsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                            Notifications are {viewingPolicy?.notificationsEnabled ? 'allowed' : 'blocked'} for this app
                                        </p>
                                    </div>
                                </div>
                                {viewingPolicy?.notificationsEnabled && viewingPolicy?.criticalAlertEnabled && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                        <AlertTriangle className="w-3 h-3" />
                                        Critical Alerts
                                    </div>
                                )}
                            </div>
                        </div>

                        {viewingPolicy?.notificationsEnabled && (
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
                                        value={
                                            viewingPolicy?.alertType === 0 ? 'None' :
                                                viewingPolicy?.alertType === 1 ? 'Banner' :
                                                    viewingPolicy?.alertType === 2 ? 'Modal (Alert)' : 'Default'
                                        }
                                        enabled={viewingPolicy?.alertType !== 0}
                                    />
                                </div>

                                <div className="p-3 rounded-lg border bg-muted/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Preview Options</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Previews are shown
                                        <span className="font-medium text-foreground mx-1">
                                            {viewingPolicy?.previewType === 0 && 'Always'}
                                            {viewingPolicy?.previewType === 1 && 'When Unlocked'}
                                            {viewingPolicy?.previewType === 2 && 'Never'}
                                            {![0, 1, 2].includes(viewingPolicy?.previewType || -1) && 'Default'}
                                        </span>
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Audit Info if available */}
                        {(viewingPolicy?.creationTime || viewingPolicy?.modificationTime) && (
                            <div className="border-t pt-4 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                {viewingPolicy.createdBy && <div><span className="font-medium">Created by:</span> {viewingPolicy.createdBy}</div>}
                                {viewingPolicy.creationTime && <div><span className="font-medium">Created on:</span> {new Date(viewingPolicy.creationTime).toLocaleDateString()}</div>}
                                {viewingPolicy.lastModifiedBy && <div><span className="font-medium">Modified by:</span> {viewingPolicy.lastModifiedBy}</div>}
                                {viewingPolicy.modificationTime && <div><span className="font-medium">Modified on:</span> {new Date(viewingPolicy.modificationTime).toLocaleDateString()}</div>}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
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
