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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { LockScreenMessagePolicy as LockScreenMessagePolicyType, Platform } from '@/types/models';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Loader2, MessageSquare, Plus, Tag, Text, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBaseDialogContext } from '@/components/common/BaseDialogContext';

interface LockScreenMessagePolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: LockScreenMessagePolicyType | null;
    onSave?: () => void | Promise<void>;
}

export function LockScreenMessagePolicy({ platform, profileId, initialData, onSave }: LockScreenMessagePolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [policy, setPolicy] = useState<LockScreenMessagePolicyType | null>(null);
    const { registerSave, setLoading: setContextLoading, setSaveDisabled } = useBaseDialogContext();
    const [loading, setLoadingState] = useState(false);

    const setLoading = (val: boolean) => { setLoadingState(val); setContextLoading(val); };
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<LockScreenMessagePolicyType>>({});

    const fetchPolicy = async () => {
        setLoading(true);
        try {
            const data = await PolicyService.getLockScreenMessage(platform, profileId);
            setPolicy(data || null); // API likely returns null or 204 if not found? Or maybe 404? 
            // The prompt said 404 Not Found. So we might need to catch that.
        } catch (error: any) {
            if (error.response?.status === 404) {
                setPolicy(null);
            } else {
                console.error('Failed to fetch lock screen message policy:', error);
                // Don't toast on strict 404 as it just means not configured
                if (error.response?.status !== 404) {
                    toast({
                        title: 'Error',
                        description: getErrorMessage(error, 'Failed to load lock screen message policy'),
                        variant: 'destructive',
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setPolicy(initialData);
        } else {
            fetchPolicy();
        }
    }, [platform, profileId, initialData]);

    useEffect(() => { registerSave(handleSave); }, []);

    const handleOpenDialog = (existingPolicy?: LockScreenMessagePolicyType) => {
        if (existingPolicy) {
            setFormData({ ...existingPolicy });
        } else {
            setFormData({
                name: 'Lock Screen Message',
                assetTagInformation: '',
                lockScreenFootnote: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (policy?.id) {
                const payload = cleanPayload({ ...formData, id: policy.id }) as LockScreenMessagePolicyType;
                await PolicyService.updateLockScreenMessage(platform, profileId, payload);
                toast({ title: 'Success', description: 'Lock Screen Message updated successfully' });
            } else {
                const payload = cleanPayload(formData) as LockScreenMessagePolicyType;
                await PolicyService.createLockScreenMessage(platform, profileId, payload);
                toast({ title: 'Success', description: 'Lock Screen Message created successfully' });
            }
            setIsDialogOpen(false);
            fetchPolicy();
            if (onSave) onSave();
        } catch (error) {
            console.error('Failed to save policy:', error);
            toast({
                title: 'Error',
                description: getErrorMessage(error, 'Failed to save lock screen message'),
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async () => {
        try {
            await PolicyService.deleteLockScreenMessage(platform, profileId);
            toast({ title: 'Success', description: 'Lock Screen Message removed successfully' });
            setPolicy(null);
            if (onSave) onSave();
        } catch (error) {
            console.error('Failed to delete policy:', error);
            toast({
                title: 'Error',
                description: getErrorMessage(error, 'Failed to delete lock screen message'),
                variant: 'destructive',
            });
        }
    };

    const handleViewPolicy = () => {
        setIsViewDialogOpen(true);
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-full">
                        <MessageSquare className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Lock Screen Message</h3>
                        <p className="text-sm text-muted-foreground">Configure asset tag and footnote message on lock screen</p>
                    </div>
                </div>
                {!policy && !loading && (
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Configure
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : policy ? (
                <div className="grid gap-4">
                    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewPolicy}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{policy.name || 'Lock Screen Message'}</h4>
                                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                        {policy.lockScreenFootnote || policy.assetTagInformation || 'Configured'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(policy); }}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove Lock Screen Message?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently remove the lock screen message configuration from this profile.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={handleDelete}
                                            >
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                    No lock screen message configured.
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{policy ? 'Edit Lock Screen Message' : 'Configure Lock Screen Message'}</DialogTitle>
                        <DialogDescription>Set the text displayed on the device lock screen.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Policy Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Corporate Device Message"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assetTag">Asset Tag Information</Label>
                            <div className="relative">
                                <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="assetTag"
                                    className="pl-8"
                                    value={formData.assetTagInformation || ''}
                                    onChange={(e) => setFormData({ ...formData, assetTagInformation: e.target.value })}
                                    placeholder="e.g. Property of ACME Corp"
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Displayed prominently on the lock screen.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footnote">Lock Screen Footnote</Label>
                            <div className="relative">
                                <Text className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="footnote"
                                    className="pl-8"
                                    value={formData.lockScreenFootnote || ''}
                                    onChange={(e) => setFormData({ ...formData, lockScreenFootnote: e.target.value })}
                                    placeholder="e.g. Return to IT Department"
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Displayed at the bottom of the lock screen.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button type="submit">Save Configuration</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{policy?.name || 'Lock Screen Message'}</DialogTitle>
                                <DialogDescription className="mt-1 font-mono text-xs bg-muted px-2 py-1 rounded inline-block">
                                    IosLockScreenMessage
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="p-4 rounded-lg border bg-card/50 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-full mt-0.5">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Asset Tag</p>
                                    <p className="text-sm text-foreground bg-muted/50 p-2 rounded-md mt-1 border">
                                        {policy?.assetTagInformation || <span className="text-muted-foreground italic">Not configured</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-full mt-0.5">
                                    <Text className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Footnote</p>
                                    <p className="text-sm text-foreground bg-muted/50 p-2 rounded-md mt-1 border">
                                        {policy?.lockScreenFootnote || <span className="text-muted-foreground italic">Not configured</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Audit Info if available */}
                        {(policy?.creationTime || policy?.modificationTime) && (
                            <div className="border-t pt-4 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                {policy.createdBy && <div><span className="font-medium">Created by:</span> {policy.createdBy}</div>}
                                {policy.creationTime && <div><span className="font-medium">Created on:</span> {new Date(policy.creationTime).toLocaleDateString()}</div>}
                                {policy.lastModifiedBy && <div><span className="font-medium">Modified by:</span> {policy.lastModifiedBy}</div>}
                                {policy.modificationTime && <div><span className="font-medium">Modified on:</span> {new Date(policy.modificationTime).toLocaleDateString()}</div>}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>{t('common.close')}</Button>
                        <Button onClick={() => { setIsViewDialogOpen(false); handleOpenDialog(policy!); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
