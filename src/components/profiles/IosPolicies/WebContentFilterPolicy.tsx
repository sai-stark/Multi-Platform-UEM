import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosWebContentFilterPolicy } from '@/types/ios';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Filter, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface WebContentFilterPolicyProps {
    profileId: string;
    initialData?: IosWebContentFilterPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function WebContentFilterPolicy({ profileId, initialData, onSave, onCancel }: WebContentFilterPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<IosWebContentFilterPolicy>>({
        name: '',
        policyType: 'IosWebContentFilterPolicy',
        filterType: 'BuiltIn',
        autoFilterEnabled: false,
        permittedUrls: [],
        denyListUrls: [],
        filterSockets: false,
        whitelistedBookmarks: [],
        hideDenyListURLs: false,
        safariHistoryRetentionEnabled: false,
        ...initialData,
    });

    const [newPermittedUrl, setNewPermittedUrl] = useState('');
    const [newDenyListUrl, setNewDenyListUrl] = useState('');

    const handleChange = (field: keyof IosWebContentFilterPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addPermittedUrl = () => {
        if (newPermittedUrl.trim()) {
            handleChange('permittedUrls', [...(formData.permittedUrls || []), newPermittedUrl.trim()]);
            setNewPermittedUrl('');
        }
    };

    const removePermittedUrl = (index: number) => {
        handleChange('permittedUrls', (formData.permittedUrls || []).filter((_, i) => i !== index));
    };

    const addDenyListUrl = () => {
        if (newDenyListUrl.trim()) {
            handleChange('denyListUrls', [...(formData.denyListUrls || []), newDenyListUrl.trim()]);
            setNewDenyListUrl('');
        }
    };

    const removeDenyListUrl = (index: number) => {
        handleChange('denyListUrls', (formData.denyListUrls || []).filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const payload = cleanPayload(formData) as IosWebContentFilterPolicy;
            if (initialData?.id) {
                await PolicyService.updateWebContentFilterPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Web Content Filter policy updated' });
            } else {
                await PolicyService.createWebContentFilterPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Web Content Filter policy created' });
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
            await PolicyService.deleteWebContentFilterPolicy(profileId);
            toast({ title: 'Success', description: 'Web Content Filter policy deleted' });
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
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <Filter className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Web Content Filter</h3>
                            <p className="text-sm text-muted-foreground">URL filtering and content restrictions</p>
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
                    <div><span className="text-muted-foreground text-sm">Name</span><p className="font-medium">{formData.name}</p></div>
                    <div><span className="text-muted-foreground text-sm">Filter Type</span><p className="font-medium">{formData.filterType || '-'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Auto Filter</span><p className="font-medium">{formData.autoFilterEnabled ? 'Yes' : 'No'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Filter Sockets</span><p className="font-medium">{formData.filterSockets ? 'Yes' : 'No'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Permitted URLs</span><p className="font-medium">{formData.permittedUrls?.length || 0} URL(s)</p></div>
                    <div><span className="text-muted-foreground text-sm">Deny List URLs</span><p className="font-medium">{formData.denyListUrls?.length || 0} URL(s)</p></div>
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
                <div className="p-2 bg-orange-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} Web Content Filter</h3>
                    <p className="text-sm text-muted-foreground">Configure URL filtering rules</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Policy name" />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox checked={formData.autoFilterEnabled || false} onCheckedChange={v => handleChange('autoFilterEnabled', v)} />
                    <label className="text-sm">Enable Auto Filter</label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox checked={formData.filterSockets || false} onCheckedChange={v => handleChange('filterSockets', v)} />
                    <label className="text-sm">Filter Sockets</label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox checked={formData.hideDenyListURLs || false} onCheckedChange={v => handleChange('hideDenyListURLs', v)} />
                    <label className="text-sm">Hide Deny List URLs</label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox checked={formData.safariHistoryRetentionEnabled || false} onCheckedChange={v => handleChange('safariHistoryRetentionEnabled', v)} />
                    <label className="text-sm">Safari History Retention</label>
                </div>

                {/* Permitted URLs */}
                <div>
                    <label className="text-sm font-medium">Permitted URLs</label>
                    <div className="flex gap-2 mt-1">
                        <Input value={newPermittedUrl} onChange={e => setNewPermittedUrl(e.target.value)} placeholder="https://example.com" onKeyDown={e => e.key === 'Enter' && addPermittedUrl()} />
                        <Button variant="outline" size="icon" onClick={addPermittedUrl}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.permittedUrls || []).map((url, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                                {url}
                                <button onClick={() => removePermittedUrl(i)}><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Deny List URLs */}
                <div>
                    <label className="text-sm font-medium">Deny List URLs</label>
                    <div className="flex gap-2 mt-1">
                        <Input value={newDenyListUrl} onChange={e => setNewDenyListUrl(e.target.value)} placeholder="https://blocked.com" onKeyDown={e => e.key === 'Enter' && addDenyListUrl()} />
                        <Button variant="outline" size="icon" onClick={addDenyListUrl}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.denyListUrls || []).map((url, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                                {url}
                                <button onClick={() => removeDenyListUrl(i)}><X className="w-3 h-3" /></button>
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
