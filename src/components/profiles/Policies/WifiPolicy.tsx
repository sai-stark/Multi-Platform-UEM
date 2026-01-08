import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { EAPClientConfiguration, EAPType, IosWiFiConfiguration, TLSVersion, TTLSInnerAuth } from '@/types/models';
import { Edit, Eye, EyeOff, Globe, Lock, Shield, Wifi } from 'lucide-react';
import { useState } from 'react';

interface WifiPolicyProps {
    profileId: string;
    initialData?: IosWiFiConfiguration;
    onSave: () => void;
    onCancel: () => void;
}

const defaultWifiConfig: Partial<IosWiFiConfiguration> = {
    name: '',
    policyType: 'IosWiFiConfiguration',
    ssid: '',
    autoJoin: true,
    hiddenNetwork: false,
    encryptionType: 'WPA2',
    proxyType: 'None',
    enableIPv6: true,
    captiveBypass: false,
    disableAssociationMACRandomization: false,
    creationTime: new Date().toISOString(),
    modificationTime: new Date().toISOString(),
    createdBy: '',
    lastModifiedBy: '',
};

const EAP_TYPE_LABELS: Record<EAPType, string> = {
    13: 'EAP-TLS',
    17: 'LEAP',
    18: 'EAP-SIM',
    21: 'EAP-TTLS',
    23: 'EAP-AKA',
    25: 'PEAP',
    43: 'EAP-FAST',
};

export function WifiPolicy({ profileId, initialData, onSave, onCancel }: WifiPolicyProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    // If we have an ID, start in view mode. Otherwise, start in edit mode.
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [formData, setFormData] = useState<Partial<IosWiFiConfiguration>>(
        initialData || defaultWifiConfig
    );
    const [showEnterprise, setShowEnterprise] = useState(!!initialData?.eapClientConfiguration);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = <K extends keyof IosWiFiConfiguration>(field: K, value: IosWiFiConfiguration[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleEAPChange = <K extends keyof EAPClientConfiguration>(field: K, value: EAPClientConfiguration[K]) => {
        setFormData((prev) => ({
            ...prev,
            eapClientConfiguration: {
                ...prev.eapClientConfiguration,
                acceptEAPTypes: prev.eapClientConfiguration?.acceptEAPTypes || [25],
                [field]: value,
            },
        }));
    };

    const toggleEAPType = (type: EAPType) => {
        const current = formData.eapClientConfiguration?.acceptEAPTypes || [];
        const newTypes = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        handleEAPChange('acceptEAPTypes', newTypes.length > 0 ? newTypes : [25]);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            toast({ title: "Validation Error", description: "Policy name is required", variant: "destructive" });
            return;
        }
        if (!formData.ssid?.trim() && !formData.domainName?.trim()) {
            toast({ title: "Validation Error", description: "SSID or Domain Name is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await PolicyService.createIosWiFiConfiguration(profileId, formData as IosWiFiConfiguration);
            toast({ title: "Success", description: "WiFi configuration saved successfully" });
            onSave();
        } catch (error) {
            console.error("Failed to save WiFi policy", error);
            toast({ title: "Error", description: "Failed to save WiFi configuration", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = () => {
        if (isEditing && initialData?.id) {
            setIsEditing(false);
            setFormData(initialData); // Reset to initial
        } else {
            onCancel();
        }
    };

    const needsPassword = formData.encryptionType && formData.encryptionType !== 'None';
    const isManualProxy = formData.proxyType === 'Manual';
    const isAutoProxy = formData.proxyType === 'Auto';

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-full">
                        <Wifi className="w-6 h-6 text-info" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{formData.name || 'WiFi Policy'}</h3>
                        <p className="text-sm text-muted-foreground">
                            {formData.ssid ? `Network: ${formData.ssid}` : 'Configure WiFi settings'}
                        </p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Configuration
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="p-4 rounded-xl border bg-card space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                            <Wifi className="w-4 h-4" /> Network Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">SSID</span>
                                <span className="font-medium">{formData.ssid || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Auto Join</span>
                                <span className="font-medium">{formData.autoJoin ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Hidden Network</span>
                                <span className="font-medium">{formData.hiddenNetwork ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">IPv6 Enabled</span>
                                <span className="font-medium">{formData.enableIPv6 ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-card space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                            <Globe className="w-4 h-4" /> Proxy Settings
                        </h4>
                        <div className="text-sm">
                            <div className="mb-2">
                                <span className="text-muted-foreground block">Type</span>
                                <span className="font-medium">{formData.proxyType || 'None'}</span>
                            </div>
                            {formData.proxyType === 'Manual' && (
                                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-dashed">
                                    <div>
                                        <span className="text-muted-foreground block">Server</span>
                                        <span className="font-medium">{formData.proxyServer || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Port</span>
                                        <span className="font-medium">{formData.proxyServerPort || '-'}</span>
                                    </div>
                                </div>
                            )}
                            {formData.proxyType === 'Auto' && (
                                <div className="mt-2 pt-2 border-t border-dashed">
                                    <span className="text-muted-foreground block">PAC URL</span>
                                    <span className="font-medium break-all">{formData.proxyPACURL || '-'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 rounded-xl border bg-card space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                            <Lock className="w-4 h-4" /> Security
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Encryption</span>
                                <span className="font-medium">{formData.encryptionType || 'None'}</span>
                            </div>
                            {formData.password && (
                                <div>
                                    <span className="text-muted-foreground block">Password</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                                            {showPassword ? formData.password : '••••••••'}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {showEnterprise && (
                        <div className="p-4 rounded-xl border bg-card space-y-4">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                <Shield className="w-4 h-4" /> Enterprise (802.1X)
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">EAP Types</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {formData.eapClientConfiguration?.acceptEAPTypes?.map(t => (
                                            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                {EAP_TYPE_LABELS[t] || t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {formData.eapClientConfiguration?.userName && (
                                    <div>
                                        <span className="text-muted-foreground block">Username</span>
                                        <span className="font-medium">{formData.eapClientConfiguration.userName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>Close</Button>
            </div>
        </div>
    );

    if (!isEditing) {
        return renderView();
    }

    return (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-full">
                        <Edit className="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            Update WiFi settings for {formData.ssid || 'new network'}
                        </p>
                    </div>
                </div>
            </div>
            {/* Basic Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Basic Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Policy Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            placeholder="e.g. Corporate WiFi"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ssid">SSID (Network Name) <span className="text-destructive">*</span></Label>
                        <Input
                            id="ssid"
                            placeholder="e.g. Corp-Wifi"
                            value={formData.ssid || ''}
                            onChange={(e) => handleChange('ssid', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="encryptionType">Encryption Type</Label>
                        <Select
                            value={formData.encryptionType || 'Any'}
                            onValueChange={(val) => handleChange('encryptionType', val as IosWiFiConfiguration['encryptionType'])}
                        >
                            <SelectTrigger id="encryptionType">
                                <SelectValue placeholder="Select encryption" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None (Open)</SelectItem>
                                <SelectItem value="WEP">WEP</SelectItem>
                                <SelectItem value="WPA">WPA</SelectItem>
                                <SelectItem value="WPA2">WPA2</SelectItem>
                                <SelectItem value="WPA3">WPA3</SelectItem>
                                <SelectItem value="Any">Any</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {needsPassword && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter WiFi password"
                                value={formData.password || ''}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="autoJoin"
                            checked={formData.autoJoin ?? true}
                            onCheckedChange={(checked) => handleChange('autoJoin', checked as boolean)}
                        />
                        <Label htmlFor="autoJoin" className="cursor-pointer">Auto Join</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hiddenNetwork"
                            checked={formData.hiddenNetwork ?? false}
                            onCheckedChange={(checked) => handleChange('hiddenNetwork', checked as boolean)}
                        />
                        <Label htmlFor="hiddenNetwork" className="cursor-pointer">Hidden Network</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="enableIPv6"
                            checked={formData.enableIPv6 ?? true}
                            onCheckedChange={(checked) => handleChange('enableIPv6', checked as boolean)}
                        />
                        <Label htmlFor="enableIPv6" className="cursor-pointer">Enable IPv6</Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Proxy Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Proxy Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="proxyType">Proxy Type</Label>
                        <Select
                            value={formData.proxyType || 'None'}
                            onValueChange={(val) => handleChange('proxyType', val as IosWiFiConfiguration['proxyType'])}
                        >
                            <SelectTrigger id="proxyType">
                                <SelectValue placeholder="Select proxy type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                                <SelectItem value="Auto">Auto (PAC)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {isManualProxy && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                        <div className="space-y-2">
                            <Label htmlFor="proxyServer">Proxy Server</Label>
                            <Input
                                id="proxyServer"
                                placeholder="e.g. proxy.company.com"
                                value={formData.proxyServer || ''}
                                onChange={(e) => handleChange('proxyServer', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proxyServerPort">Port</Label>
                            <Input
                                id="proxyServerPort"
                                type="number"
                                placeholder="8080"
                                min={0}
                                max={65535}
                                value={formData.proxyServerPort || ''}
                                onChange={(e) => handleChange('proxyServerPort', parseInt(e.target.value) || undefined)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proxyUsername">Username</Label>
                            <Input
                                id="proxyUsername"
                                placeholder="Proxy username"
                                value={formData.proxyUsername || ''}
                                onChange={(e) => handleChange('proxyUsername', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proxyPassword">Password</Label>
                            <Input
                                id="proxyPassword"
                                type="password"
                                placeholder="Proxy password"
                                value={formData.proxyPassword || ''}
                                onChange={(e) => handleChange('proxyPassword', e.target.value)}
                            />
                        </div>
                    </div>
                )}
                {isAutoProxy && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="proxyPACURL">PAC URL</Label>
                            <Input
                                id="proxyPACURL"
                                type="url"
                                placeholder="https://proxy.company.com/proxy.pac"
                                value={formData.proxyPACURL || ''}
                                onChange={(e) => handleChange('proxyPACURL', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="proxyPACFallbackAllowed"
                                checked={formData.proxyPACFallbackAllowed ?? false}
                                onCheckedChange={(checked) => handleChange('proxyPACFallbackAllowed', checked as boolean)}
                            />
                            <Label htmlFor="proxyPACFallbackAllowed" className="cursor-pointer">
                                Allow direct connection if PAC unreachable
                            </Label>
                        </div>
                    </div>
                )}
            </div>

            <Separator />

            {/* Enterprise Settings Toggle */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Enterprise (802.1X) Settings</h3>
                    <Checkbox
                        id="showEnterprise"
                        checked={showEnterprise}
                        onCheckedChange={(checked) => {
                            setShowEnterprise(checked as boolean);
                            if (!checked) {
                                setFormData(prev => ({ ...prev, eapClientConfiguration: undefined }));
                            } else {
                                handleEAPChange('acceptEAPTypes', [25]);
                            }
                        }}
                    />
                    <Label htmlFor="showEnterprise" className="cursor-pointer text-sm">Enable Enterprise</Label>
                </div>

                {showEnterprise && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                        <div className="space-y-2">
                            <Label>Accepted EAP Types <span className="text-destructive">*</span></Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {(Object.entries(EAP_TYPE_LABELS) as [string, string][]).map(([type, label]) => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`eap-${type}`}
                                            checked={formData.eapClientConfiguration?.acceptEAPTypes?.includes(Number(type) as EAPType) ?? false}
                                            onCheckedChange={() => toggleEAPType(Number(type) as EAPType)}
                                        />
                                        <Label htmlFor={`eap-${type}`} className="cursor-pointer text-sm">{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eapUserName">Username</Label>
                                <Input
                                    id="eapUserName"
                                    placeholder="EAP username"
                                    value={formData.eapClientConfiguration?.userName || ''}
                                    onChange={(e) => handleEAPChange('userName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eapUserPassword">Password</Label>
                                <Input
                                    id="eapUserPassword"
                                    type="password"
                                    placeholder="EAP password"
                                    value={formData.eapClientConfiguration?.userPassword || ''}
                                    onChange={(e) => handleEAPChange('userPassword', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="outerIdentity">Outer Identity</Label>
                                <Input
                                    id="outerIdentity"
                                    placeholder="Anonymous identity"
                                    value={formData.eapClientConfiguration?.outerIdentity || ''}
                                    onChange={(e) => handleEAPChange('outerIdentity', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ttlsInnerAuthentication">TTLS Inner Auth</Label>
                                <Select
                                    value={formData.eapClientConfiguration?.ttlsInnerAuthentication || 'MSCHAPv2'}
                                    onValueChange={(val) => handleEAPChange('ttlsInnerAuthentication', val as TTLSInnerAuth)}
                                >
                                    <SelectTrigger id="ttlsInnerAuthentication">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PAP">PAP</SelectItem>
                                        <SelectItem value="EAP">EAP</SelectItem>
                                        <SelectItem value="CHAP">CHAP</SelectItem>
                                        <SelectItem value="MSCHAP">MSCHAP</SelectItem>
                                        <SelectItem value="MSCHAPv2">MSCHAPv2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tlsMinimumVersion">TLS Min Version</Label>
                                <Select
                                    value={formData.eapClientConfiguration?.tlsMinimumVersion || '1.0'}
                                    onValueChange={(val) => handleEAPChange('tlsMinimumVersion', val as TLSVersion)}
                                >
                                    <SelectTrigger id="tlsMinimumVersion">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1.0">TLS 1.0</SelectItem>
                                        <SelectItem value="1.1">TLS 1.1</SelectItem>
                                        <SelectItem value="1.2">TLS 1.2</SelectItem>
                                        <SelectItem value="1.3">TLS 1.3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tlsMaximumVersion">TLS Max Version</Label>
                                <Select
                                    value={formData.eapClientConfiguration?.tlsMaximumVersion || '1.2'}
                                    onValueChange={(val) => handleEAPChange('tlsMaximumVersion', val as TLSVersion)}
                                >
                                    <SelectTrigger id="tlsMaximumVersion">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1.0">TLS 1.0</SelectItem>
                                        <SelectItem value="1.1">TLS 1.1</SelectItem>
                                        <SelectItem value="1.2">TLS 1.2</SelectItem>
                                        <SelectItem value="1.3">TLS 1.3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="tlsCertificateIsRequired"
                                    checked={formData.eapClientConfiguration?.tlsCertificateIsRequired ?? false}
                                    onCheckedChange={(checked) => handleEAPChange('tlsCertificateIsRequired', checked as boolean)}
                                />
                                <Label htmlFor="tlsCertificateIsRequired" className="cursor-pointer">
                                    Require TLS Certificate
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="oneTimeUserPassword"
                                    checked={formData.eapClientConfiguration?.oneTimeUserPassword ?? false}
                                    onCheckedChange={(checked) => handleEAPChange('oneTimeUserPassword', checked as boolean)}
                                />
                                <Label htmlFor="oneTimeUserPassword" className="cursor-pointer">
                                    One-time Password (prompt each connection)
                                </Label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Separator />

            {/* Advanced Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Advanced Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="captiveBypass"
                            checked={formData.captiveBypass ?? false}
                            onCheckedChange={(checked) => handleChange('captiveBypass', checked as boolean)}
                        />
                        <Label htmlFor="captiveBypass" className="cursor-pointer">
                            Bypass Captive Network Detection
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="disableAssociationMACRandomization"
                            checked={formData.disableAssociationMACRandomization ?? false}
                            onCheckedChange={(checked) => handleChange('disableAssociationMACRandomization', checked as boolean)}
                        />
                        <Label htmlFor="disableAssociationMACRandomization" className="cursor-pointer">
                            Disable MAC Randomization
                        </Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Hotspot 2.0 Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Hotspot 2.0 (Passpoint)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isHotspot"
                            checked={formData.isHotspot ?? false}
                            onCheckedChange={(checked) => handleChange('isHotspot', checked as boolean)}
                        />
                        <Label htmlFor="isHotspot" className="cursor-pointer">Enable Hotspot 2.0</Label>
                    </div>
                    {formData.isHotspot && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="domainName">Domain Name</Label>
                                <Input
                                    id="domainName"
                                    placeholder="e.g. company.com"
                                    value={formData.domainName || ''}
                                    onChange={(e) => handleChange('domainName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayedOperatorName">Operator Name</Label>
                                <Input
                                    id="displayedOperatorName"
                                    placeholder="e.g. Company Inc."
                                    value={formData.displayedOperatorName || ''}
                                    onChange={(e) => handleChange('displayedOperatorName', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="serviceProviderRoamingEnabled"
                                    checked={formData.serviceProviderRoamingEnabled ?? false}
                                    onCheckedChange={(checked) => handleChange('serviceProviderRoamingEnabled', checked as boolean)}
                                />
                                <Label htmlFor="serviceProviderRoamingEnabled" className="cursor-pointer">
                                    Enable Roaming
                                </Label>
                            </div>
                        </>
                    )}

                </div>
            </div>

            <CardFooter className="flex justify-between px-0 pt-6">
                <Button variant="outline" onClick={handleCancelClick} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save WiFi Configuration'}
                </Button>
            </CardFooter>
        </div>
    );
}
