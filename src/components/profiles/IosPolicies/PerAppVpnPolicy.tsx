import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { PolicyService } from '@/api/services/IOSpolicies';
import { IosPerAppVpnPolicy } from '@/types/ios';
import { Smartphone, Plus, X, Loader2 } from 'lucide-react';

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
            if (initialData?.id) {
                await PolicyService.updatePerAppVpnPolicy(profileId, formData as IosPerAppVpnPolicy);
                toast({ title: 'Success', description: 'Per-App VPN policy updated' });
            } else {
                await PolicyService.createPerAppVpnPolicy(profileId, formData as IosPerAppVpnPolicy);
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
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing && initialData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="w-5 h-5 text-violet-500" />
                    <h3 className="text-lg font-semibold">Per-App VPN</h3>
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
                                <span key={i} className="bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 text-xs px-2 py-1 rounded-full">{id}</span>
                            ))}
                        </div>
                    </div>
                )}
                <CardFooter className="flex justify-end gap-2 px-0">
                    <Button variant="outline" onClick={onCancel}>Close</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                </CardFooter>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-violet-500" />
                <h3 className="text-lg font-semibold">{initialData?.id ? 'Edit' : 'Create'} Per-App VPN</h3>
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

            <CardFooter className="flex justify-end gap-2 px-0">
                <Button variant="outline" onClick={initialData?.id ? () => setIsEditing(false) : onCancel}>Cancel</Button>
                {initialData?.id && <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>}
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData?.id ? 'Update' : 'Create'}
                </Button>
            </CardFooter>
        </div>
    );
}
