import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosGlobalHttpProxyPolicy } from '@/types/ios';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Globe, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface GlobalHttpProxyPolicyProps {
    profileId: string;
    initialData?: IosGlobalHttpProxyPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function GlobalHttpProxyPolicy({ profileId, initialData, onSave, onCancel }: GlobalHttpProxyPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<IosGlobalHttpProxyPolicy>>({
        name: '',
        policyType: 'IosGlobalHttpProxyPolicy',
        proxyType: 'Manual',
        proxyServer: '',
        proxyServerPort: undefined,
        proxyUsername: '',
        proxyPassword: '',
        proxyPacUrl: '',
        proxyPacFallbackAllowed: false,
        proxyCaptiveLoginAllowed: false,
        ...initialData,
    });

    const handleChange = (field: keyof IosGlobalHttpProxyPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        if (formData.proxyType === 'Manual' && !formData.proxyServer?.trim()) {
            toast({ title: 'Validation Error', description: 'Proxy server is required for Manual type', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            if (initialData?.id) {
                await PolicyService.updateGlobalHttpProxyPolicy(profileId, formData as IosGlobalHttpProxyPolicy);
                toast({ title: 'Success', description: 'HTTP Proxy policy updated' });
            } else {
                await PolicyService.createGlobalHttpProxyPolicy(profileId, formData as IosGlobalHttpProxyPolicy);
                toast({ title: 'Success', description: 'HTTP Proxy policy created' });
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
            await PolicyService.deleteGlobalHttpProxyPolicy(profileId);
            toast({ title: 'Success', description: 'HTTP Proxy policy deleted' });
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
                        <div className="p-2 bg-cyan-500/10 rounded-full">
                            <Globe className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Global HTTP Proxy</h3>
                            <p className="text-sm text-muted-foreground">Network proxy configuration</p>
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
                    <div><span className="text-muted-foreground text-sm">Proxy Type</span><p className="font-medium">{formData.proxyType}</p></div>
                    {formData.proxyType === 'Manual' && (
                        <>
                            <div><span className="text-muted-foreground text-sm">Server</span><p className="font-medium">{formData.proxyServer || '-'}</p></div>
                            <div><span className="text-muted-foreground text-sm">Port</span><p className="font-medium">{formData.proxyServerPort || '-'}</p></div>
                            <div><span className="text-muted-foreground text-sm">Username</span><p className="font-medium">{formData.proxyUsername || '-'}</p></div>
                        </>
                    )}
                    {formData.proxyType === 'Automatic' && (
                        <>
                            <div><span className="text-muted-foreground text-sm">PAC URL</span><p className="font-medium">{formData.proxyPacUrl || '-'}</p></div>
                            <div><span className="text-muted-foreground text-sm">PAC Fallback</span><p className="font-medium">{formData.proxyPacFallbackAllowed ? 'Yes' : 'No'}</p></div>
                            <div><span className="text-muted-foreground text-sm">Captive Login</span><p className="font-medium">{formData.proxyCaptiveLoginAllowed ? 'Yes' : 'No'}</p></div>
                        </>
                    )}
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
                <div className="p-2 bg-cyan-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} Global HTTP Proxy</h3>
                    <p className="text-sm text-muted-foreground">Configure network proxy settings</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Policy name" />
                </div>

                <div>
                    <label className="text-sm font-medium">Proxy Type <span className="text-red-500">*</span></label>
                    <Select value={formData.proxyType} onValueChange={v => handleChange('proxyType', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.proxyType === 'Manual' && (
                    <>
                        <div>
                            <label className="text-sm font-medium">Proxy Server <span className="text-red-500">*</span></label>
                            <Input value={formData.proxyServer || ''} onChange={e => handleChange('proxyServer', e.target.value)} placeholder="proxy.example.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Port</label>
                            <Input type="number" value={formData.proxyServerPort ?? ''} onChange={e => handleChange('proxyServerPort', e.target.value ? Number(e.target.value) : undefined)} placeholder="8080" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Username</label>
                            <Input value={formData.proxyUsername || ''} onChange={e => handleChange('proxyUsername', e.target.value)} placeholder="Username" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <Input type="password" value={formData.proxyPassword || ''} onChange={e => handleChange('proxyPassword', e.target.value)} placeholder="Password" />
                        </div>
                    </>
                )}

                {formData.proxyType === 'Automatic' && (
                    <>
                        <div>
                            <label className="text-sm font-medium">PAC URL</label>
                            <Input value={formData.proxyPacUrl || ''} onChange={e => handleChange('proxyPacUrl', e.target.value)} placeholder="https://example.com/proxy.pac" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={formData.proxyPacFallbackAllowed || false} onCheckedChange={v => handleChange('proxyPacFallbackAllowed', v)} />
                            <label className="text-sm">Allow PAC Fallback</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={formData.proxyCaptiveLoginAllowed || false} onCheckedChange={v => handleChange('proxyCaptiveLoginAllowed', v)} />
                            <label className="text-sm">Allow Captive Login</label>
                        </div>
                    </>
                )}
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
