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
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosPerAppVpnPolicy } from '@/types/ios';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Loader2, Plus, Smartphone, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface PerAppVpnPolicyProps {
    profileId: string;
    initialData?: IosPerAppVpnPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function PerAppVpnPolicy({ profileId, initialData, onSave, onCancel }: PerAppVpnPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState<Partial<IosPerAppVpnPolicy>>({
        name: '',
        applicationIds: [],
        ...initialData,
    });

    const [newAppId, setNewAppId] = useState('');

    const handleChange = (field: keyof IosPerAppVpnPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addAppId = () => {
        if (newAppId.trim()) {
            handleChange('applicationIds', [...(formData.applicationIds || []), newAppId.trim()]);
            setNewAppId('');
        }
    };

    const removeAppId = (index: number) => {
        handleChange('applicationIds', (formData.applicationIds || []).filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const payload = cleanPayload(formData) as IosPerAppVpnPolicy;
            if (initialData?.id) {
                await PolicyService.updatePerAppVpnPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Per-App VPN policy updated' });
            } else {
                await PolicyService.createPerAppVpnPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Per-App VPN policy created' });
            }
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await PolicyService.deletePerAppVpnPolicy(profileId);
            toast({ title: 'Success', description: 'Per-App VPN policy deleted' });
            setShowDeleteDialog(false);
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing && initialData) {
        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-fuchsia-500/10 rounded-full">
                            <Smartphone className="w-6 h-6 text-fuchsia-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Per-App VPN</h3>
                            <p className="text-sm text-muted-foreground">App-specific VPN tunnel configuration</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} disabled={loading}>
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this policy? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground text-sm">Name</span><p className="font-medium">{formData.name}</p></div>
                    <div><span className="text-muted-foreground text-sm">Application IDs</span><p className="font-medium">{formData.applicationIds?.length || 0} app(s)</p></div>
                </div>
                {(formData.applicationIds || []).length > 0 && (
                    <div>
                        <span className="text-muted-foreground text-sm">Applications</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {formData.applicationIds!.map((id, i) => (
                                <span key={i} className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300 text-xs px-2 py-1 rounded-full">{id}</span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-fuchsia-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-fuchsia-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} Per-App VPN</h3>
                    <p className="text-sm text-muted-foreground">Configure app-specific VPN tunnels</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Policy name" />
                </div>

                <div>
                    <label className="text-sm font-medium">Application IDs</label>
                    <div className="flex gap-2 mt-1">
                        <Input value={newAppId} onChange={e => setNewAppId(e.target.value)} placeholder="com.example.app" onKeyDown={e => e.key === 'Enter' && addAppId()} />
                        <Button variant="outline" size="icon" onClick={addAppId}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.applicationIds || []).map((id, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 text-xs px-2 py-1 rounded-full">
                                {id}
                                <button onClick={() => removeAppId(i)}><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <CardFooter className="flex justify-between px-0 pt-6">
                <Button variant="outline" onClick={initialData?.id ? () => setIsEditing(false) : onCancel}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </div>
    );
}
