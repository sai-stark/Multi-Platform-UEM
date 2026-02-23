import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { PolicyService } from '@/api/services/IOSpolicies';
import { IosVpnPolicy, IosVpnIKEv2, IosVpnIPSec, IosVpnPPP, IosVpnDNS, IosVpnProxies } from '@/types/ios';
import { Lock, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

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
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold">VPN Configuration</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground text-sm">Name</span><p className="font-medium">{formData.name}</p></div>
                    <div><span className="text-muted-foreground text-sm">VPN Type</span><p className="font-medium">{formData.vpnType}</p></div>
                    <div><span className="text-muted-foreground text-sm">Remote Address</span><p className="font-medium">{formData.remoteAddress || '-'}</p></div>
                    <div><span className="text-muted-foreground text-sm">Auth Name</span><p className="font-medium">{formData.authName || '-'}</p></div>
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
                <Lock className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">{initialData?.id ? 'Edit' : 'Create'} VPN Configuration</h3>
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
                    <label className="text-sm font-medium">Certificate UUID</label>
                    <Input value={formData.payloadCertificateUUID || ''} onChange={e => handleChange('payloadCertificateUUID', e.target.value)} placeholder="UUID" />
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
                                    <Checkbox checked={formData.ikev2?.enablePFS || false} onCheckedChange={v => handleNestedChange('ikev2', 'enablePFS', v)} />
                                    <label className="text-sm">Enable Perfect Forward Secrecy</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={formData.ikev2?.includeAllNetworks || false} onCheckedChange={v => handleNestedChange('ikev2', 'includeAllNetworks', v)} />
                                    <label className="text-sm">Include All Networks</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={formData.ikev2?.excludeLocalNetworks || false} onCheckedChange={v => handleNestedChange('ikev2', 'excludeLocalNetworks', v)} />
                                    <label className="text-sm">Exclude Local Networks</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={formData.ikev2?.disableMOBIKE || false} onCheckedChange={v => handleNestedChange('ikev2', 'disableMOBIKE', v)} />
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
                                    <Checkbox checked={formData.ipsec?.xAuthEnabled || false} onCheckedChange={v => handleNestedChange('ipsec', 'xAuthEnabled', v)} />
                                    <label className="text-sm">Enable XAuth</label>
                                </div>
                                {formData.ipsec?.xAuthEnabled && (
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
                                    <Checkbox checked={formData.ppp?.tokenCard || false} onCheckedChange={v => handleNestedChange('ppp', 'tokenCard', v)} />
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
                                <Checkbox checked={formData.proxies?.hTTPEnable || false} onCheckedChange={v => handleNestedChange('proxies', 'hTTPEnable', v)} />
                                <label className="text-sm">Enable HTTP Proxy</label>
                            </div>
                            {formData.proxies?.hTTPEnable && (
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
                                <Checkbox checked={formData.proxies?.proxyAutoConfigEnable || false} onCheckedChange={v => handleNestedChange('proxies', 'proxyAutoConfigEnable', v)} />
                                <label className="text-sm">Enable Proxy Auto-Config</label>
                            </div>
                            {formData.proxies?.proxyAutoConfigEnable && (
                                <div>
                                    <label className="text-sm font-medium">PAC URL</label>
                                    <Input value={formData.proxies?.proxyAutoConfigURLString || ''} onChange={e => handleNestedChange('proxies', 'proxyAutoConfigURLString', e.target.value)} placeholder="https://example.com/proxy.pac" />
                                </div>
                            )}
                        </div>
                    )}
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
