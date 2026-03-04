import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosVpnPolicy } from '@/types/ios';
import { getErrorMessage } from '@/utils/errorUtils';
import { ChevronDown, ChevronRight, Edit, Loader2, Lock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VpnPolicyProps {
    profileId: string;
    initialData?: IosVpnPolicy;
    onSave: () => void;
    onCancel: () => void;
}

const VPN_TYPES = ['L2TP', 'PPTP', 'IPSec', 'IKEv2', 'AlwaysOn', 'VPN', 'TransparentProxy'] as const;

export function VpnPolicy({ profileId, initialData, onSave, onCancel }: VpnPolicyProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [certificates, setCertificates] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const data = await PolicyService.getCertificatesPkcs12(profileId);
                setCertificates(data?.content || []);
            } catch {
                // Silently fail - dropdown will just be empty
            }
        };
        fetchCertificates();
    }, [profileId]);

    const [formData, setFormData] = useState<Partial<IosVpnPolicy>>({
        name: '',
        policyType: 'IosVpnPolicy',
        vpnType: 'IKEv2',
        remoteAddress: '',
        authName: '',
        authPassword: '',
        ikev2: {},
        ipsec: {},
        ppp: {},
        dns: { serverAddresses: [], searchDomains: [] },
        proxies: {},
        ...initialData,
    });

    // Collapsible sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const toggleSection = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

    const handleChange = (field: keyof IosVpnPolicy, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (section: 'ikev2' | 'ipsec' | 'ppp' | 'dns' | 'proxies', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...(prev[section] as any || {}), [field]: value },
        }));
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        if (!formData.remoteAddress?.trim()) {
            toast({ title: 'Validation Error', description: 'Remote address is required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            if (initialData?.id) {
                await PolicyService.updateVpnPolicy(profileId, formData as IosVpnPolicy);
                toast({ title: 'Success', description: 'VPN policy updated' });
            } else {
                await PolicyService.createVpnPolicy(profileId, formData as IosVpnPolicy);
                toast({ title: 'Success', description: 'VPN policy created' });
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
            await PolicyService.deleteVpnPolicy(profileId);
            toast({ title: 'Success', description: 'VPN policy deleted' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ title, section }: { title: string; section: string }) => (
        <button
            className="flex items-center gap-2 w-full text-left py-2 px-3 bg-muted/50 rounded-md hover:bg-muted transition-colors font-medium text-sm"
            onClick={() => toggleSection(section)}
        >
            {expandedSections[section] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {title}
        </button>
    );

    if (!isEditing && initialData) {
        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-full">
                            <Lock className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">VPN Configuration</h3>
                            <p className="text-sm text-muted-foreground">Virtual private network settings</p>
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
                    <div><span className="text-muted-foreground text-sm">VPN Type</span><p className="font-medium">{formData.vpnType}</p></div>
                    <div><span className="text-muted-foreground text-sm">Remote Address</span><p className="font-medium">{formData.remoteAddress || '-'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Auth Name</span><p className="font-medium">{formData.authName || '-'}</p></div>
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
                <div className="p-2 bg-violet-500/10 rounded-full">
                    <Edit className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} VPN Configuration</h3>
                    <p className="text-sm text-muted-foreground">Configure VPN connection settings</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Basic Settings */}
                <div>
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="Policy name" />
                </div>

                <div>
                    <label className="text-sm font-medium">VPN Type <span className="text-red-500">*</span></label>
                    <Select value={formData.vpnType} onValueChange={v => handleChange('vpnType', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {VPN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-medium">Remote Address <span className="text-red-500">*</span></label>
                    <Input value={formData.remoteAddress || ''} onChange={e => handleChange('remoteAddress', e.target.value)} placeholder="vpn.example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Auth Name</label>
                        <Input value={formData.authName || ''} onChange={e => handleChange('authName', e.target.value)} placeholder="Username" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Auth Password</label>
                        <Input type="password" value={formData.authPassword || ''} onChange={e => handleChange('authPassword', e.target.value)} placeholder="Password" />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Certificate</label>
                    <Select value={formData.payloadCertificateUUID || ''} onValueChange={v => handleChange('payloadCertificateUUID', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder={certificates.length === 0 ? 'No certificates available' : 'Select a certificate'} />
                        </SelectTrigger>
                        <SelectContent>
                            {certificates.map(cert => (
                                <SelectItem key={cert.id} value={cert.id}>{cert.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* IKEv2 Section */}
                {(formData.vpnType === 'IKEv2' || formData.vpnType === 'AlwaysOn') && (
                    <div className="space-y-3">
                        <SectionHeader title="IKEv2 Settings" section="ikev2" />
                        {expandedSections.ikev2 && (
                            <div className="pl-4 space-y-3 border-l-2 border-muted">
                                <div>
                                    <label className="text-sm font-medium">Remote Identifier</label>
                                    <Input value={formData.ikev2?.remoteIdentifier || ''} onChange={e => handleNestedChange('ikev2', 'remoteIdentifier', e.target.value)} placeholder="Remote ID" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Local Identifier</label>
                                    <Input value={formData.ikev2?.localIdentifier || ''} onChange={e => handleNestedChange('ikev2', 'localIdentifier', e.target.value)} placeholder="Local ID" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Authentication Method</label>
                                    <Select value={formData.ikev2?.authenticationMethod || 'None'} onValueChange={v => handleNestedChange('ikev2', 'authenticationMethod', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="SharedSecret">Shared Secret</SelectItem>
                                            <SelectItem value="Certificate">Certificate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.ikev2?.authenticationMethod === 'SharedSecret' && (
                                    <div>
                                        <label className="text-sm font-medium">Shared Secret</label>
                                        <Input type="password" value={formData.ikev2?.sharedSecret || ''} onChange={e => handleNestedChange('ikev2', 'sharedSecret', e.target.value)} />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium">Dead Peer Detection Rate</label>
                                    <Select value={formData.ikev2?.deadPeerDetectionRate || 'Medium'} onValueChange={v => handleNestedChange('ikev2', 'deadPeerDetectionRate', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!formData.ikev2?.enablePFS} onCheckedChange={v => handleNestedChange('ikev2', 'enablePFS', v ? 1 : 0)} />
                                    <label className="text-sm">Enable Perfect Forward Secrecy</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!formData.ikev2?.includeAllNetworks} onCheckedChange={v => handleNestedChange('ikev2', 'includeAllNetworks', v ? 1 : 0)} />
                                    <label className="text-sm">Include All Networks</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!formData.ikev2?.excludeLocalNetworks} onCheckedChange={v => handleNestedChange('ikev2', 'excludeLocalNetworks', v ? 1 : 0)} />
                                    <label className="text-sm">Exclude Local Networks</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!formData.ikev2?.disableMOBIKE} onCheckedChange={v => handleNestedChange('ikev2', 'disableMOBIKE', v ? 1 : 0)} />
                                    <label className="text-sm">Disable MOBIKE</label>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* IPSec Section */}
                {(formData.vpnType === 'IPSec' || formData.vpnType === 'L2TP') && (
                    <div className="space-y-3">
                        <SectionHeader title="IPSec Settings" section="ipsec" />
                        {expandedSections.ipsec && (
                            <div className="pl-4 space-y-3 border-l-2 border-muted">
                                <div>
                                    <label className="text-sm font-medium">Authentication Method</label>
                                    <Select value={formData.ipsec?.authenticationMethod || 'SharedSecret'} onValueChange={v => handleNestedChange('ipsec', 'authenticationMethod', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SharedSecret">Shared Secret</SelectItem>
                                            <SelectItem value="Certificate">Certificate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.ipsec?.authenticationMethod === 'SharedSecret' && (
                                    <div>
                                        <label className="text-sm font-medium">Shared Secret</label>
                                        <Input type="password" value={formData.ipsec?.sharedSecret || ''} onChange={e => handleNestedChange('ipsec', 'sharedSecret', e.target.value)} />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium">Local Identifier</label>
                                    <Input value={formData.ipsec?.localIdentifier || ''} onChange={e => handleNestedChange('ipsec', 'localIdentifier', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!formData.ipsec?.xAuthEnabled} onCheckedChange={v => handleNestedChange('ipsec', 'xAuthEnabled', v ? 1 : 0)} />
                                    <label className="text-sm">Enable XAuth</label>
                                </div>
                                {formData.ipsec?.xAuthEnabled === 1 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">XAuth Name</label>
                                            <Input value={formData.ipsec?.xAuthName || ''} onChange={e => handleNestedChange('ipsec', 'xAuthName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">XAuth Password</label>
                                            <Input type="password" value={formData.ipsec?.xAuthPassword || ''} onChange={e => handleNestedChange('ipsec', 'xAuthPassword', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* PPP Section */}
                {(formData.vpnType === 'L2TP' || formData.vpnType === 'PPTP') && (
                    <div className="space-y-3">
                        <SectionHeader title="PPP Settings" section="ppp" />
                        {expandedSections.ppp && (
                            <div className="pl-4 space-y-3 border-l-2 border-muted">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Auth Name</label>
                                        <Input value={formData.ppp?.authName || ''} onChange={e => handleNestedChange('ppp', 'authName', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Auth Password</label>
                                        <Input type="password" value={formData.ppp?.authPassword || ''} onChange={e => handleNestedChange('ppp', 'authPassword', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Comm Remote Address</label>
                                    <Input value={formData.ppp?.commRemoteAddress || ''} onChange={e => handleNestedChange('ppp', 'commRemoteAddress', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!formData.ppp?.tokenCard} onCheckedChange={v => handleNestedChange('ppp', 'tokenCard', v ? 1 : 0)} />
                                    <label className="text-sm">Token Card</label>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* DNS Section */}
                <div className="space-y-3">
                    <SectionHeader title="DNS Settings" section="dns" />
                    {expandedSections.dns && (
                        <div className="pl-4 space-y-3 border-l-2 border-muted">
                            <div>
                                <label className="text-sm font-medium">Server Addresses (comma-separated)</label>
                                <Input
                                    value={(formData.dns?.serverAddresses || []).join(', ')}
                                    onChange={e => handleNestedChange('dns', 'serverAddresses', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="8.8.8.8, 8.8.4.4"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Search Domains (comma-separated)</label>
                                <Input
                                    value={(formData.dns?.searchDomains || []).join(', ')}
                                    onChange={e => handleNestedChange('dns', 'searchDomains', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="example.com, corp.local"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Proxies Section */}
                <div className="space-y-3">
                    <SectionHeader title="Proxy Settings" section="proxies" />
                    {expandedSections.proxies && (
                        <div className="pl-4 space-y-3 border-l-2 border-muted">
                            <div className="flex items-center gap-2">
                                <Checkbox checked={!!formData.proxies?.hTTPEnable} onCheckedChange={v => handleNestedChange('proxies', 'hTTPEnable', v ? 1 : 0)} />
                                <label className="text-sm">Enable HTTP Proxy</label>
                            </div>
                            {formData.proxies?.hTTPEnable === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">HTTP Proxy</label>
                                        <Input value={formData.proxies?.hTTPProxy || ''} onChange={e => handleNestedChange('proxies', 'hTTPProxy', e.target.value)} placeholder="proxy.example.com" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">HTTP Port</label>
                                        <Input type="number" value={formData.proxies?.hTTPPort ?? ''} onChange={e => handleNestedChange('proxies', 'hTTPPort', e.target.value ? Number(e.target.value) : undefined)} placeholder="8080" />
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Checkbox checked={!!formData.proxies?.proxyAutoConfigEnable} onCheckedChange={v => handleNestedChange('proxies', 'proxyAutoConfigEnable', v ? 1 : 0)} />
                                <label className="text-sm">Enable Proxy Auto-Config</label>
                            </div>
                            {formData.proxies?.proxyAutoConfigEnable === 1 && (
                                <div>
                                    <label className="text-sm font-medium">PAC URL</label>
                                    <Input value={formData.proxies?.proxyAutoConfigURLString || ''} onChange={e => handleNestedChange('proxies', 'proxyAutoConfigURLString', e.target.value)} placeholder="https://example.com/proxy.pac" />
                                </div>
                            )}
                        </div>
                    )}
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
