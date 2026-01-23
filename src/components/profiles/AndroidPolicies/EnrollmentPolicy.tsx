import { policyAPI } from '@/api/services/Androidpolicies';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EnrollmentPolicy as EnrollmentPolicyType, Platform, WifiSecurity } from '@/types/models';
import { Edit, Key, Loader2, Monitor, Save, Signal, Smartphone, UserPlus, Wifi } from 'lucide-react';
import { useState } from 'react';

interface EnrollmentPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: EnrollmentPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function EnrollmentPolicy({ platform, profileId, initialData, onSave, onCancel }: EnrollmentPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [configureWifi, setConfigureWifi] = useState(!!initialData?.wifiHotspot);

    const [formData, setFormData] = useState<Partial<EnrollmentPolicyType>>({
        isKioskMode: initialData?.isKioskMode ?? false,
        useMobileData: initialData?.useMobileData ?? false,
        wifiHotspot: initialData?.wifiHotspot || undefined,
        devicePolicyType: 'AndroidEnrollmentPolicy',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (!configureWifi) {
                delete payload.wifiHotspot;
            }
            
            if (initialData?.id) {
                await policyAPI.updateEnrollmentPolicy(platform, profileId, payload);
            } else {
                await policyAPI.createEnrollmentPolicy(platform, profileId, payload);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save enrollment policy:', error);
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

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <UserPlus className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Enrollment Policy</h3>
                        <p className="text-sm text-muted-foreground">Device enrollment settings</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Policy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={`border-l-4 ${formData.isKioskMode ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Monitor className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">Kiosk Mode</span>
                        </div>
                        <Badge variant={formData.isKioskMode ? 'default' : 'secondary'}>
                            {formData.isKioskMode ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.isKioskMode 
                                ? 'Device will be locked to managed apps' 
                                : 'Normal device operation'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.useMobileData ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Signal className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Mobile Data</span>
                        </div>
                        <Badge variant={formData.useMobileData ? 'default' : 'secondary'}>
                            {formData.useMobileData ? 'Use for Enrollment' : 'Wi-Fi Only'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.wifiHotspot ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Wi-Fi Configuration</span>
                        </div>
                        {formData.wifiHotspot ? (
                            <div className="space-y-1">
                                <span className="font-mono text-sm">{formData.wifiHotspot.ssid}</span>
                                <Badge variant="secondary" className="ml-2">{formData.wifiHotspot.security}</Badge>
                            </div>
                        ) : (
                            <Badge variant="secondary">Not configured</Badge>
                        )}
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
                        <h3 className="text-lg font-medium">Edit Enrollment Policy</h3>
                        <p className="text-sm text-muted-foreground">Configure device enrollment settings</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* Kiosk Mode */}
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Monitor className="w-5 h-5 mt-0.5 text-orange-500" />
                            <div>
                                <span className="font-medium">Kiosk Mode</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Lock device to managed applications only
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.isKioskMode}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, isKioskMode: c }))}
                        />
                    </div>
                </div>

                {/* Use Mobile Data */}
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Signal className="w-5 h-5 mt-0.5 text-green-500" />
                            <div>
                                <span className="font-medium">Use Mobile Data</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Allow enrollment over cellular data
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.useMobileData}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, useMobileData: c }))}
                        />
                    </div>
                </div>

                {/* Configure WiFi Hotspot Toggle */}
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Wifi className="w-5 h-5 mt-0.5 text-blue-500" />
                            <div>
                                <span className="font-medium">Configure Wi-Fi</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Pre-configure Wi-Fi for enrollment
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={configureWifi}
                            onCheckedChange={(c) => {
                                setConfigureWifi(c);
                                if (c && !formData.wifiHotspot) {
                                    setFormData(prev => ({
                                        ...prev,
                                        wifiHotspot: { ssid: '', security: 'WPA', password: '' }
                                    }));
                                }
                            }}
                        />
                    </div>
                </div>

                {/* WiFi Hotspot Configuration */}
                {configureWifi && (
                    <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
                        <h4 className="font-medium flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-blue-500" />
                            Wi-Fi Hotspot Configuration
                        </h4>
                        
                        <div className="space-y-2">
                            <Label htmlFor="ssid">Network Name (SSID)</Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="ssid"
                                    className="pl-9"
                                    value={formData.wifiHotspot?.ssid || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        wifiHotspot: { ...prev.wifiHotspot!, ssid: e.target.value }
                                    }))}
                                    placeholder="Enter Wi-Fi network name"
                                    required={configureWifi}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Security Type</Label>
                            <Select
                                value={formData.wifiHotspot?.security || 'WPA'}
                                onValueChange={(value: WifiSecurity) => setFormData(prev => ({
                                    ...prev,
                                    wifiHotspot: { ...prev.wifiHotspot!, security: value }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select security type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                    <SelectItem value="WEP">WEP</SelectItem>
                                    <SelectItem value="EAP">EAP (Enterprise)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-9"
                                    value={formData.wifiHotspot?.password || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        wifiHotspot: { ...prev.wifiHotspot!, password: e.target.value }
                                    }))}
                                    placeholder="Enter Wi-Fi password"
                                    required={configureWifi}
                                />
                            </div>
                        </div>
                    </div>
                )}
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
