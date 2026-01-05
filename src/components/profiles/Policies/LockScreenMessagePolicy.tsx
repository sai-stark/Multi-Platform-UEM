import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LockScreenMessagePolicy as LockScreenMessagePolicyType, Platform } from '@/types/models';
import { Edit, Loader2, MessageSquare, Plus, Tag, Text, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LockScreenMessagePolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: LockScreenMessagePolicyType | null;
}

export function LockScreenMessagePolicy({ platform, profileId, initialData }: LockScreenMessagePolicyProps) {
    const { toast } = useToast();
    const [policy, setPolicy] = useState<LockScreenMessagePolicyType | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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
                        description: 'Failed to load lock screen message policy',
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
                await PolicyService.updateLockScreenMessage(platform, profileId, { ...formData, id: policy.id } as LockScreenMessagePolicyType);
                toast({ title: 'Success', description: 'Lock Screen Message updated successfully' });
            } else {
                await PolicyService.createLockScreenMessage(platform, profileId, formData as LockScreenMessagePolicyType);
                toast({ title: 'Success', description: 'Lock Screen Message created successfully' });
            }
            setIsDialogOpen(false);
            fetchPolicy();
        } catch (error) {
            console.error('Failed to save policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to save lock screen message',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove the lock screen message configuration?')) return;
        try {
            await PolicyService.deleteLockScreenMessage(platform, profileId);
            toast({ title: 'Success', description: 'Lock Screen Message removed successfully' });
            setPolicy(null);
        } catch (error) {
            console.error('Failed to delete policy:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete lock screen message',
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
                <div>
                    <h3 className="text-lg font-medium">Lock Screen Message</h3>
                    <p className="text-sm text-muted-foreground">Configure asset tag and footnote message on lock screen</p>
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
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
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
                            <Label htmlFor="name">Policy Name</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Corporate Device Message"
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
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
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
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
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
