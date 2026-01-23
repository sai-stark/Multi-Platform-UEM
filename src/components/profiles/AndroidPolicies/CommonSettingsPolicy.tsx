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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AppPermissionType, CommonSettingsPolicy as CommonSettingsPolicyType, Platform, SystemUpdatePolicy, VolumePolicy } from '@/types/models';
import { Clock, Download, Edit, Loader2, MapPin, Monitor, Save, Settings, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface CommonSettingsPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: CommonSettingsPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function CommonSettingsPolicy({ platform, profileId, initialData, onSave, onCancel }: CommonSettingsPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<CommonSettingsPolicyType>>({
        locationTracking: initialData?.locationTracking ?? true,
        defaultAppPerms: initialData?.defaultAppPerms || 'PROMPT',
        keepAliveTime: initialData?.keepAliveTime ?? 30,
        disableScreenCapture: initialData?.disableScreenCapture ?? false,
        appUpdateSchedule: initialData?.appUpdateSchedule || { from: '02:00', to: '05:00' },
        volumePolicy: initialData?.volumePolicy || { manageVolume: 'UnmanagedVolume' },
        systemUpdatePolicy: initialData?.systemUpdatePolicy || { systemUpdate: 'DEFAULT' },
        devicePolicyType: 'AndroidCommonSettingsPolicy',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateCommonSettingsPolicy(platform, profileId, formData);
            } else {
                await policyAPI.createCommonSettingsPolicy(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save common settings policy:', error);
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

    const getPermissionLabel = (perm?: AppPermissionType) => {
        switch (perm) {
            case 'GRANT': return 'Auto Grant';
            case 'DENY': return 'Auto Deny';
            case 'PROMPT': return 'Prompt User';
            default: return 'Prompt User';
        }
    };

    const getSystemUpdateLabel = (policy?: SystemUpdatePolicy) => {
        if (!policy) return 'Default';
        if (policy.systemUpdate === 'SCHEDULED') {
            return `Scheduled (${(policy as any).systemUpdateScheduleFrom} - ${(policy as any).systemUpdateScheduleTo})`;
        }
        switch (policy.systemUpdate) {
            case 'IMMEDIATELY': return 'Install Immediately';
            case 'POSTPONE': return 'Postpone';
            default: return 'Default';
        }
    };

    const getVolumeLabel = (policy?: VolumePolicy) => {
        if (!policy) return 'User Controlled';
        if (policy.manageVolume === 'ManagedVolume') {
            return `Managed (${(policy as any).volume}%)`;
        }
        return 'User Controlled';
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Common Settings</h3>
                        <p className="text-sm text-muted-foreground">Device management configuration</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={`border-l-4 ${formData.locationTracking ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="font-medium">Location Tracking</span>
                        </div>
                        <Badge variant={formData.locationTracking ? 'default' : 'secondary'}>
                            {formData.locationTracking ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">App Permissions</span>
                        </div>
                        <Badge variant="secondary">{getPermissionLabel(formData.defaultAppPerms)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Keep Alive Time</span>
                        </div>
                        <span className="text-lg font-semibold">{formData.keepAliveTime} min</span>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableScreenCapture ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Monitor className="w-5 h-5 text-indigo-500" />
                            <span className="font-medium">Screen Capture</span>
                        </div>
                        <Badge variant={formData.disableScreenCapture ? 'destructive' : 'default'}>
                            {formData.disableScreenCapture ? 'Disabled' : 'Allowed'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">System Updates</span>
                        </div>
                        <Badge variant="secondary">{getSystemUpdateLabel(formData.systemUpdatePolicy)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Volume2 className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">Volume Policy</span>
                        </div>
                        <Badge variant="secondary">{getVolumeLabel(formData.volumePolicy)}</Badge>
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
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Common Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure device management policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* Location Tracking */}
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 mt-0.5 text-red-500" />
                            <div>
                                <span className="font-medium">Location Tracking</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Track device location for management
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.locationTracking}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, locationTracking: c }))}
                        />
                    </div>
                </div>

                {/* Disable Screen Capture */}
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Monitor className="w-5 h-5 mt-0.5 text-indigo-500" />
                            <div>
                                <span className="font-medium">Disable Screen Capture</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block screenshots and screen recording
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableScreenCapture}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableScreenCapture: c }))}
                        />
                    </div>
                </div>

                {/* Default App Permissions */}
                <div className="space-y-2">
                    <Label>Default App Permissions</Label>
                    <Select
                        value={formData.defaultAppPerms}
                        onValueChange={(value: AppPermissionType) => 
                            setFormData(prev => ({ ...prev, defaultAppPerms: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select permission handling" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GRANT">Auto Grant - Automatically approve</SelectItem>
                            <SelectItem value="DENY">Auto Deny - Automatically reject</SelectItem>
                            <SelectItem value="PROMPT">Prompt User - Ask user for each permission</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        How the device handles app permission requests
                    </p>
                </div>

                {/* Keep Alive Time */}
                <div className="space-y-2">
                    <Label htmlFor="keepAliveTime">Keep Alive Time (minutes)</Label>
                    <Input
                        id="keepAliveTime"
                        type="number"
                        min={1}
                        max={1440}
                        value={formData.keepAliveTime || 30}
                        onChange={(e) => setFormData(prev => ({ ...prev, keepAliveTime: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Interval for device check-in with the management server
                    </p>
                </div>

                {/* System Update Policy */}
                <div className="space-y-2">
                    <Label>System Update Policy</Label>
                    <Select
                        value={formData.systemUpdatePolicy?.systemUpdate || 'DEFAULT'}
                        onValueChange={(value) => {
                            if (value === 'SCHEDULED') {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    systemUpdatePolicy: { 
                                        systemUpdate: 'SCHEDULED',
                                        systemUpdateScheduleFrom: '02:00',
                                        systemUpdateScheduleTo: '05:00'
                                    } 
                                }));
                            } else {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    systemUpdatePolicy: { systemUpdate: value as 'DEFAULT' | 'IMMEDIATELY' | 'POSTPONE' } 
                                }));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select update policy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEFAULT">Default - Follow device settings</SelectItem>
                            <SelectItem value="IMMEDIATELY">Immediately - Install updates as soon as available</SelectItem>
                            <SelectItem value="POSTPONE">Postpone - Delay updates</SelectItem>
                            <SelectItem value="SCHEDULED">Scheduled - Install during specific window</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Schedule Time Inputs (if SCHEDULED) */}
                {formData.systemUpdatePolicy?.systemUpdate === 'SCHEDULED' && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                        <div className="space-y-2">
                            <Label>Update Window Start</Label>
                            <Input
                                type="time"
                                value={(formData.systemUpdatePolicy as any).systemUpdateScheduleFrom || '02:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        ...prev.systemUpdatePolicy as any,
                                        systemUpdateScheduleFrom: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Update Window End</Label>
                            <Input
                                type="time"
                                value={(formData.systemUpdatePolicy as any).systemUpdateScheduleTo || '05:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        ...prev.systemUpdatePolicy as any,
                                        systemUpdateScheduleTo: e.target.value
                                    }
                                }))}
                            />
                        </div>
                    </div>
                )}

                {/* Volume Policy */}
                <div className="space-y-2">
                    <Label>Volume Policy</Label>
                    <div className="flex gap-2 mb-2">
                        <Button
                            type="button"
                            variant={formData.volumePolicy?.manageVolume === 'UnmanagedVolume' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, volumePolicy: { manageVolume: 'UnmanagedVolume' } }))}
                        >
                            User Controlled
                        </Button>
                        <Button
                            type="button"
                            variant={formData.volumePolicy?.manageVolume === 'ManagedVolume' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, volumePolicy: { manageVolume: 'ManagedVolume', volume: 50 } }))}
                        >
                            Managed
                        </Button>
                    </div>
                    {formData.volumePolicy?.manageVolume === 'ManagedVolume' && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                            <Label>Volume Level: {(formData.volumePolicy as any).volume || 50}%</Label>
                            <Slider
                                value={[(formData.volumePolicy as any).volume || 50]}
                                onValueChange={([value]) => setFormData(prev => ({
                                    ...prev,
                                    volumePolicy: { manageVolume: 'ManagedVolume', volume: value }
                                }))}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>
                    )}
                </div>

                {/* App Update Schedule */}
                <div className="space-y-2">
                    <Label>App Update Schedule</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">From</Label>
                            <Input
                                type="time"
                                value={formData.appUpdateSchedule?.from || '02:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    appUpdateSchedule: { ...prev.appUpdateSchedule!, from: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">To</Label>
                            <Input
                                type="time"
                                value={formData.appUpdateSchedule?.to || '05:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    appUpdateSchedule: { ...prev.appUpdateSchedule!, to: e.target.value }
                                }))}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Time window for automatic app updates
                    </p>
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
