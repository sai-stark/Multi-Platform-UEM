import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DisplayRestriction as DisplayRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, Monitor, Moon, Save, Sun, Timer } from 'lucide-react';
import { useState } from 'react';

interface DisplayRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: DisplayRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function DisplayRestriction({ platform, profileId, initialData, onSave, onCancel }: DisplayRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<DisplayRestrictionType>>({
        screenTimeoutSeconds: initialData?.screenTimeoutSeconds ?? 300,
        disableScreenTimeoutSetting: initialData?.disableScreenTimeoutSetting ?? false,
        disableBrightnessSetting: initialData?.disableBrightnessSetting ?? false,
        disableAmbientDisplay: initialData?.disableAmbientDisplay ?? false,
        brightnessPolicy: initialData?.brightnessPolicy || { brightness: 'AdaptiveBrightness' },
        devicePolicyType: 'AndroidDisplayRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateDisplayRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createDisplayRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save display restriction:', error);
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

    const formatTimeout = (seconds?: number) => {
        if (!seconds || seconds === 0) return 'Never';
        if (seconds < 60) return `${seconds} seconds`;
        return `${Math.floor(seconds / 60)} minutes`;
    };

    const isFixedBrightness = formData.brightnessPolicy?.brightness === 'FixedBrightness';

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Monitor className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Display Restriction</h3>
                        <p className="text-sm text-muted-foreground">Screen and brightness settings</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Timer className="w-5 h-5 text-indigo-500" />
                            <span className="font-medium">Screen Timeout</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{formData.screenTimeoutSeconds || 0}</span>
                            <span className="text-muted-foreground">seconds</span>
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {formatTimeout(formData.screenTimeoutSeconds)}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">Brightness</span>
                        </div>
                        <Badge variant="secondary">
                            {isFixedBrightness 
                                ? `Fixed (${(formData.brightnessPolicy as any)?.brightnessLevel || 50}%)`
                                : 'Adaptive'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableAmbientDisplay ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Moon className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Ambient Display</span>
                        </div>
                        <Badge variant={formData.disableAmbientDisplay ? 'default' : 'secondary'}>
                            {formData.disableAmbientDisplay ? 'Disabled' : 'Enabled'}
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
                    <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Display Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure screen and brightness policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* Screen Timeout */}
                <div className="space-y-2">
                    <Label htmlFor="screenTimeoutSeconds">Screen Timeout (seconds)</Label>
                    <Input
                        id="screenTimeoutSeconds"
                        type="number"
                        min={0}
                        max={3600}
                        value={formData.screenTimeoutSeconds || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, screenTimeoutSeconds: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Time in seconds before the screen turns off (0 = never). Current: {formatTimeout(formData.screenTimeoutSeconds)}
                    </p>
                </div>

                {/* Brightness Policy */}
                <div className="space-y-2">
                    <Label>Brightness Policy</Label>
                    <div className="flex gap-2 mb-2">
                        <Button
                            type="button"
                            variant={!isFixedBrightness ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                brightnessPolicy: { brightness: 'AdaptiveBrightness' } 
                            }))}
                        >
                            <Sun className="w-4 h-4 mr-2" />
                            Adaptive
                        </Button>
                        <Button
                            type="button"
                            variant={isFixedBrightness ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                brightnessPolicy: { brightness: 'FixedBrightness', brightnessLevel: 50 } 
                            }))}
                        >
                            <Monitor className="w-4 h-4 mr-2" />
                            Fixed
                        </Button>
                    </div>
                    {isFixedBrightness && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                            <Label>Brightness Level: {(formData.brightnessPolicy as any)?.brightnessLevel || 50}%</Label>
                            <Slider
                                value={[(formData.brightnessPolicy as any)?.brightnessLevel || 50]}
                                onValueChange={([value]) => setFormData(prev => ({
                                    ...prev,
                                    brightnessPolicy: { brightness: 'FixedBrightness', brightnessLevel: value }
                                }))}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>
                    )}
                </div>

                {/* Toggle switches */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Timer className="w-5 h-5 mt-0.5 text-indigo-500" />
                            <div>
                                <span className="font-medium">Disable Screen Timeout Setting</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Prevent users from changing screen timeout
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableScreenTimeoutSetting}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableScreenTimeoutSetting: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Sun className="w-5 h-5 mt-0.5 text-yellow-500" />
                            <div>
                                <span className="font-medium">Disable Brightness Setting</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Prevent users from adjusting brightness
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableBrightnessSetting}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableBrightnessSetting: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <Label className="flex items-start gap-3">
                            <Moon className="w-5 h-5 mt-0.5 text-purple-500" />
                            <div>
                                <span className="font-medium">Disable Ambient Display</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Turn off always-on display features
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableAmbientDisplay}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAmbientDisplay: c }))}
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
