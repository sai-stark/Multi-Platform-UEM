import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosRelayPolicy } from '@/types/ios';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Loader2, Plus, Radio, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface RelayPolicyProps {
    profileId: string;
    initialData?: IosRelayPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function RelayPolicy({ profileId, initialData, onSave, onCancel }: RelayPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<IosRelayPolicy>>({
        name: '',
        policyType: 'IosRelayPolicy',
        http3RelayUrl: '',
        http2RelayUrl: '',
        additionalHttpHeaders: {},
        matchDomains: [],
        excludedDomains: [],
        payloadCertificateUUID: '',
        rawPublicKeys: [],
        ...initialData,
    });

    const [newMatchDomain, setNewMatchDomain] = useState('');
    const [newExcludedDomain, setNewExcludedDomain] = useState('');
    const [newHeaderKey, setNewHeaderKey] = useState('');
    const [newHeaderValue, setNewHeaderValue] = useState('');

    const handleChange = (field: keyof IosRelayPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addMatchDomain = () => {
        if (newMatchDomain.trim()) {
            handleChange('matchDomains', [...(formData.matchDomains || []), newMatchDomain.trim()]);
            setNewMatchDomain('');
        }
    };

    const addExcludedDomain = () => {
        if (newExcludedDomain.trim()) {
            handleChange('excludedDomains', [...(formData.excludedDomains || []), newExcludedDomain.trim()]);
            setNewExcludedDomain('');
        }
    };

    const addHeader = () => {
        if (newHeaderKey.trim()) {
            handleChange('additionalHttpHeaders', { ...(formData.additionalHttpHeaders || {}), [newHeaderKey.trim()]: newHeaderValue });
            setNewHeaderKey('');
            setNewHeaderValue('');
        }
    };

    const removeHeader = (key: string) => {
        const headers = { ...(formData.additionalHttpHeaders || {}) };
        delete headers[key];
        handleChange('additionalHttpHeaders', headers);
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const payload = cleanPayload(formData) as IosRelayPolicy;
            if (initialData?.id) {
                await PolicyService.updateRelayPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Relay policy updated' });
            } else {
                await PolicyService.createRelayPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Relay policy created' });
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
            await PolicyService.deleteRelayPolicy(profileId);
            toast({ title: 'Success', description: 'Relay policy deleted' });
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
                        <div className="p-2 bg-amber-500/10 rounded-full">
                            <Radio className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Relay</h3>
                            <p className="text-sm text-muted-foreground">Network relay configuration</p>
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
                    <div><span className="text-muted-foreground text-sm">HTTP/3 Relay URL</span><p className="font-medium">{formData.http3RelayUrl || '-'}</p></div>
                    <div><span className="text-muted-foreground text-sm">HTTP/2 Relay URL</span><p className="font-medium">{formData.http2RelayUrl || '-'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Match Domains</span><p className="font-medium">{formData.matchDomains?.length || 0} domain(s)</p></div>
                    <div><span className="text-muted-foreground text-sm">Excluded Domains</span><p className="font-medium">{formData.excludedDomains?.length || 0} domain(s)</p></div>
                    <div><span className="text-muted-foreground text-sm">HTTP Headers</span><p className="font-medium">{Object.keys(formData.additionalHttpHeaders || {}).length} header(s)</p></div>
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
                <div className="p-2 bg-amber-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} Relay</h3>
                    <p className="text-sm text-muted-foreground">Configure network relay settings</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Policy name" />
                </div>

                <div>
                    <label className="text-sm font-medium">HTTP/3 Relay URL</label>
                    <Input value={formData.http3RelayUrl || ''} onChange={e => handleChange('http3RelayUrl', e.target.value)} placeholder="https://relay.example.com/h3" />
                </div>

                <div>
                    <label className="text-sm font-medium">HTTP/2 Relay URL</label>
                    <Input value={formData.http2RelayUrl || ''} onChange={e => handleChange('http2RelayUrl', e.target.value)} placeholder="https://relay.example.com/h2" />
                </div>

                <div>
                    <label className="text-sm font-medium">Certificate UUID</label>
                    <Input value={formData.payloadCertificateUUID || ''} onChange={e => handleChange('payloadCertificateUUID', e.target.value)} placeholder="UUID" />
                </div>

                {/* Additional HTTP Headers */}
                <div>
                    <label className="text-sm font-medium">Additional HTTP Headers</label>
                    <div className="flex gap-2 mt-1">
                        <Input value={newHeaderKey} onChange={e => setNewHeaderKey(e.target.value)} placeholder="Header key" className="flex-1" />
                        <Input value={newHeaderValue} onChange={e => setNewHeaderValue(e.target.value)} placeholder="Header value" className="flex-1" />
                        <Button variant="outline" size="icon" onClick={addHeader}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="space-y-1 mt-2">
                        {Object.entries(formData.additionalHttpHeaders || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                                <span><span className="font-medium">{key}:</span> {value}</span>
                                <button onClick={() => removeHeader(key)}><X className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Match Domains */}
                <div>
                    <label className="text-sm font-medium">Match Domains</label>
                    <div className="flex gap-2 mt-1">
                        <Input value={newMatchDomain} onChange={e => setNewMatchDomain(e.target.value)} placeholder="example.com" onKeyDown={e => e.key === 'Enter' && addMatchDomain()} />
                        <Button variant="outline" size="icon" onClick={addMatchDomain}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.matchDomains || []).map((d, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 text-xs px-2 py-1 rounded-full">
                                {d}
                                <button onClick={() => handleChange('matchDomains', (formData.matchDomains || []).filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Excluded Domains */}
                <div>
                    <label className="text-sm font-medium">Excluded Domains</label>
                    <div className="flex gap-2 mt-1">
                        <Input value={newExcludedDomain} onChange={e => setNewExcludedDomain(e.target.value)} placeholder="internal.example.com" onKeyDown={e => e.key === 'Enter' && addExcludedDomain()} />
                        <Button variant="outline" size="icon" onClick={addExcludedDomain}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.excludedDomains || []).map((d, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                                {d}
                                <button onClick={() => handleChange('excludedDomains', (formData.excludedDomains || []).filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
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
