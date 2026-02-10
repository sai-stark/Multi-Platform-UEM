import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { PolicyService } from '@/api/services/IOSpolicies';
import { IosGlobalHttpProxyPolicy } from '@/types/ios';
import { Globe, Loader2 } from 'lucide-react';

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
            toast({ title: 'Error', description: 'Failed to save policy', variant: 'destructive' });
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
            toast({ title: 'Error', description: 'Failed to delete policy', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing && initialData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Global HTTP Proxy</h3>
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
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">{initialData?.id ? 'Edit' : 'Create'} Global HTTP Proxy</h3>
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
