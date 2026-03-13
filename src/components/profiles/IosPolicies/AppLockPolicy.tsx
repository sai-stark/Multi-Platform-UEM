import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosAppLockPolicy } from '@/types/ios';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Loader2, Lock, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AppLockPolicyProps {
    profileId: string;
    initialData?: IosAppLockPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function AppLockPolicy({ profileId, initialData, onSave, onCancel }: AppLockPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<IosAppLockPolicy>>({
        name: '',
        policyType: 'IosAppLockPolicy',
        appLock: {
            App: {
                Identifier: ''
            }
        },
        ...initialData,
    });

    const handleChange = (field: keyof IosAppLockPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAppLockChange = (identifier: string) => {
        setFormData(prev => ({ ...prev, appLock: { App: { Identifier: identifier } } }));
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        if (!formData.appLock?.App?.Identifier?.trim()) {
            toast({ title: 'Validation Error', description: 'App Identifier is required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const payload = cleanPayload(formData) as IosAppLockPolicy;
            if (initialData?.id) {
                await PolicyService.updateAppLockPolicy(profileId, payload);
                toast({ title: 'Success', description: 'App Lock policy updated' });
            } else {
                await PolicyService.createAppLockPolicy(profileId, payload);
                toast({ title: 'Success', description: 'App Lock policy created' });
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
            await PolicyService.deleteAppLockPolicy(profileId);
            toast({ title: 'Success', description: 'App Lock policy deleted' });
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
                        <div className="p-2 bg-indigo-500/10 rounded-full">
                            <Lock className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">App Lock</h3>
                            <p className="text-sm text-muted-foreground">Restrict device to a single application</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-muted-foreground text-sm">Policy Name</span>
                        <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground text-sm">App Identifier</span>
                        <p className="font-medium">{formData.appLock?.App?.Identifier || '-'}</p>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-indigo-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} App Lock Policy</h3>
                    <p className="text-sm text-muted-foreground">Configure single app mode settings</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Policy Name <span className="text-destructive">*</span></label>
                    <Input
                        value={formData.name || ''}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="e.g. Retail Kiosk Mode"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">App Identifier (Bundle ID) <span className="text-destructive">*</span></label>
                    <Input
                        value={formData.appLock?.App?.Identifier || ''}
                        onChange={e => handleAppLockChange(e.target.value)}
                        placeholder="com.example.app"
                        required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        The bundle identifier of the application to lock the device into.
                    </p>
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
