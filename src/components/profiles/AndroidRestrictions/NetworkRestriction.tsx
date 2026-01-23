import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ControlType, NetworkRestriction as NetworkRestrictionType, Platform } from '@/types/models';
import { Edit, Globe, Loader2, Plane, Save, Settings, Shield, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface NetworkRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: NetworkRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function NetworkRestriction({ platform, profileId, initialData, onSave, onCancel }: NetworkRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<NetworkRestrictionType>>({
        disableAirplaneMode: initialData?.disableAirplaneMode ?? true,
        disableRoamingData: initialData?.disableRoamingData ?? true,
        disableVpnConfig: initialData?.disableVpnConfig ?? true,
        disableWifiDirect: initialData?.disableWifiDirect ?? true,
        wifi: initialData?.wifi || 'USER_CONTROLLED',
        disableWifiConfig: initialData?.disableWifiConfig ?? true,
        devicePolicyType: 'AndroidNetworkRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateNetworkRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createNetworkRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save network restriction:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (isEditing && initialData?.id) {
            setIsEditing(false);
            setFormData({ ...initialData });
        } else {
            onCancel();
        }
    };

    const getWifiLabel = (control?: ControlType) => {
        switch (control) {
            case 'ENABLE': return 'Always On';
            case 'DISABLE': return 'Always Off';
            case 'USER_CONTROLLED': return 'User Controlled';
            default: return 'User Controlled';
        }
    };

    const getWifiColor = (control?: ControlType) => {
        switch (control) {
            case 'ENABLE': return 'border-l-green-500';
            case 'DISABLE': return 'border-l-red-500';
            default: return 'border-l-blue-500';
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <Wifi className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Network Restriction</h3>
                        <p className="text-sm text-muted-foreground">Wi-Fi and network controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={`border-l-4 ${getWifiColor(formData.wifi)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Wi-Fi</span>
                        </div>
                        <Badge variant="secondary">{getWifiLabel(formData.wifi)}</Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableWifiConfig ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Wi-Fi Config</span>
                        </div>
                        <Badge variant={formData.disableWifiConfig ? 'default' : 'secondary'}>
                            {formData.disableWifiConfig ? 'Locked' : 'Editable'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableAirplaneMode ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Plane className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Airplane Mode</span>
                        </div>
                        <Badge variant={formData.disableAirplaneMode ? 'default' : 'secondary'}>
                            {formData.disableAirplaneMode ? 'Disabled' : 'Available'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableRoamingData ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Data Roaming</span>
                        </div>
                        <Badge variant={formData.disableRoamingData ? 'default' : 'secondary'}>
                            {formData.disableRoamingData ? 'Disabled' : 'Allowed'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableVpnConfig ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">VPN Config</span>
                        </div>
                        <Badge variant={formData.disableVpnConfig ? 'default' : 'secondary'}>
                            {formData.disableVpnConfig ? 'Blocked' : 'Allowed'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableWifiDirect ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">Wi-Fi Direct</span>
                        </div>
                        <Badge variant={formData.disableWifiDirect ? 'default' : 'secondary'}>
                            {formData.disableWifiDirect ? 'Disabled' : 'Allowed'}
                        </Badge>
                    </CardContent>
                </Card>
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Network Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure Wi-Fi and network policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* Wi-Fi Control */}
                <div className="space-y-2">
                    <Label>Wi-Fi Control</Label>
                    <Select
                        value={formData.wifi}
                        onValueChange={(value: ControlType) => 
                            setFormData(prev => ({ ...prev, wifi: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Wi-Fi control" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ENABLE">
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-green-500" />
                                    Always On - Force Wi-Fi enabled
                                </div>
                            </SelectItem>
                            <SelectItem value="DISABLE">
                                <div className="flex items-center gap-2">
                                    <WifiOff className="w-4 h-4 text-red-500" />
                                    Always Off - Force Wi-Fi disabled
                                </div>
                            </SelectItem>
                            <SelectItem value="USER_CONTROLLED">
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-blue-500" />
                                    User Controlled - Let user decide
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Toggle Switches */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Settings className="w-5 h-5 mt-0.5 text-blue-500" />
                            <div>
                                <span className="font-medium">Disable Wi-Fi Config</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block changes to Wi-Fi settings
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableWifiConfig}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableWifiConfig: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Plane className="w-5 h-5 mt-0.5 text-blue-500" />
                            <div>
                                <span className="font-medium">Disable Airplane Mode</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block access to airplane mode
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableAirplaneMode}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAirplaneMode: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Globe className="w-5 h-5 mt-0.5 text-purple-500" />
                            <div>
                                <span className="font-medium">Disable Roaming Data</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block cellular data roaming
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableRoamingData}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableRoamingData: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Shield className="w-5 h-5 mt-0.5 text-orange-500" />
                            <div>
                                <span className="font-medium">Disable VPN Config</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block VPN configuration
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableVpnConfig}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableVpnConfig: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <Label className="flex items-start gap-3">
                            <Wifi className="w-5 h-5 mt-0.5 text-cyan-500" />
                            <div>
                                <span className="font-medium">Disable Wi-Fi Direct</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block peer-to-peer Wi-Fi connections
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableWifiDirect}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableWifiDirect: c }))}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2 min-w-[140px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
