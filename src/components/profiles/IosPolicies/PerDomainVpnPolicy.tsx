import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosPerDomainVpnPolicy } from '@/types/ios';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Globe, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface PerDomainVpnPolicyProps {
    profileId: string;
    initialData?: IosPerDomainVpnPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function PerDomainVpnPolicy({ profileId, initialData, onSave, onCancel }: PerDomainVpnPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<IosPerDomainVpnPolicy>>({
        name: '',
        policyType: 'IosPerDomainVpnPolicy',
        safariDomains: [],
        associatedDomains: [],
        excludedDomains: [],
        onDemandMatchAppEnabled: false,
        ...initialData,
    });

    const [newDomain, setNewDomain] = useState({ safari: '', associated: '', excluded: '' });

    const handleChange = (field: keyof IosPerDomainVpnPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addDomain = (field: 'safariDomains' | 'associatedDomains' | 'excludedDomains', key: 'safari' | 'associated' | 'excluded') => {
        if (newDomain[key].trim()) {
            handleChange(field, [...(formData[field] || []), newDomain[key].trim()]);
            setNewDomain(prev => ({ ...prev, [key]: '' }));
        }
    };

    const removeDomain = (field: 'safariDomains' | 'associatedDomains' | 'excludedDomains', index: number) => {
        handleChange(field, (formData[field] || []).filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            if (initialData?.id) {
                await PolicyService.updatePerDomainVpnPolicy(profileId, formData as IosPerDomainVpnPolicy);
                toast({ title: 'Success', description: 'Per-Domain VPN policy updated' });
            } else {
                await PolicyService.createPerDomainVpnPolicy(profileId, formData as IosPerDomainVpnPolicy);
                toast({ title: 'Success', description: 'Per-Domain VPN policy created' });
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
            await PolicyService.deletePerDomainVpnPolicy(profileId);
            toast({ title: 'Success', description: 'Per-Domain VPN policy deleted' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const renderDomainList = (label: string, field: 'safariDomains' | 'associatedDomains' | 'excludedDomains', key: 'safari' | 'associated' | 'excluded', color: string) => (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <div className="flex gap-2 mt-1">
                <Input
                    value={newDomain[key]}
                    onChange={e => setNewDomain(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="example.com"
                    onKeyDown={e => e.key === 'Enter' && addDomain(field, key)}
                />
                <Button variant="outline" size="icon" onClick={() => addDomain(field, key)}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {(formData[field] || []).map((domain, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 ${color} text-xs px-2 py-1 rounded-full`}>
                        {domain}
                        <button onClick={() => removeDomain(field, i)}><X className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
        </div>
    );

    if (!isEditing && initialData) {
        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-full">
                            <Globe className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Per-Domain VPN</h3>
                            <p className="text-sm text-muted-foreground">Domain-based VPN routing rules</p>
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
                    <div><span className="text-muted-foreground text-sm">On-Demand Match</span><p className="font-medium">{formData.onDemandMatchAppEnabled ? 'Yes' : 'No'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Safari Domains</span><p className="font-medium">{formData.safariDomains?.length || 0} domain(s)</p></div>
                    <div><span className="text-muted-foreground text-sm">Associated Domains</span><p className="font-medium">{formData.associatedDomains?.length || 0} domain(s)</p></div>
                    <div><span className="text-muted-foreground text-sm">Excluded Domains</span><p className="font-medium">{formData.excludedDomains?.length || 0} domain(s)</p></div>
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
                <div className="p-2 bg-rose-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} Per-Domain VPN</h3>
                    <p className="text-sm text-muted-foreground">Configure domain-based VPN routing</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Policy name" />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox checked={formData.onDemandMatchAppEnabled || false} onCheckedChange={v => handleChange('onDemandMatchAppEnabled', v)} />
                    <label className="text-sm">On-Demand Match App Enabled</label>
                </div>

                {renderDomainList('Safari Domains', 'safariDomains', 'safari', 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300')}
                {renderDomainList('Associated Domains', 'associatedDomains', 'associated', 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300')}
                {renderDomainList('Excluded Domains', 'excludedDomains', 'excluded', 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300')}
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
