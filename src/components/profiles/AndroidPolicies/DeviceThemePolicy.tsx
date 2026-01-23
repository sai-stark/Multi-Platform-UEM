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
import { DeviceThemePolicy as DeviceThemePolicyType, IconSize, Platform, ScreenOrientation } from '@/types/models';
import { Edit, Image, Loader2, Maximize, Palette, Save, Type } from 'lucide-react';
import { useState } from 'react';

interface DeviceThemePolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: DeviceThemePolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function DeviceThemePolicy({ platform, profileId, initialData, onSave, onCancel }: DeviceThemePolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [useBackgroundImage, setUseBackgroundImage] = useState(!!initialData?.backgroundImage);

    const [formData, setFormData] = useState<Partial<DeviceThemePolicyType>>({
        appNamesColor: initialData?.appNamesColor || '#ffffff',
        iconSize: initialData?.iconSize || 'MEDIUM',
        screenOrientation: initialData?.screenOrientation || 'NONE',
        backgroundColor: initialData?.backgroundColor || '#1a1a2e',
        backgroundImage: initialData?.backgroundImage || '',
        screenSignature: initialData?.screenSignature || '',
        devicePolicyType: 'AndroidDeviceThemePolicy',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            // Only include one of backgroundColor or backgroundImage
            if (useBackgroundImage) {
                delete payload.backgroundColor;
            } else {
                delete payload.backgroundImage;
            }
            
            if (initialData?.id) {
                await policyAPI.updateDeviceThemePolicy(platform, profileId, payload);
            } else {
                await policyAPI.createDeviceThemePolicy(platform, profileId, payload);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save device theme policy:', error);
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

    const getIconSizeLabel = (size?: IconSize) => {
        switch (size) {
            case 'SMALL': return 'Small';
            case 'MEDIUM': return 'Medium';
            case 'LARGE': return 'Large';
            default: return 'Medium';
        }
    };

    const getOrientationLabel = (orientation?: ScreenOrientation) => {
        switch (orientation) {
            case 'PORTRAIT': return 'Portrait';
            case 'LANDSCAPE': return 'Landscape';
            case 'NONE': return 'Auto (None)';
            default: return 'Auto';
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Palette className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Device Theme</h3>
                        <p className="text-sm text-muted-foreground">Launcher appearance configuration</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Theme
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Type className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">App Names Color</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: formData.appNamesColor }}
                            />
                            <span className="font-mono text-sm">{formData.appNamesColor || 'Not set'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Maximize className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Icon Size</span>
                        </div>
                        <Badge variant="secondary">{getIconSizeLabel(formData.iconSize)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Maximize className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Screen Orientation</span>
                        </div>
                        <Badge variant="secondary">{getOrientationLabel(formData.screenOrientation)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Image className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">Background</span>
                        </div>
                        {formData.backgroundImage ? (
                            <span className="text-sm truncate">{formData.backgroundImage}</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-6 h-6 rounded border"
                                    style={{ backgroundColor: formData.backgroundColor }}
                                />
                                <span className="font-mono text-sm">{formData.backgroundColor || 'Not set'}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {formData.screenSignature && (
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Type className="w-5 h-5 text-cyan-500" />
                                <span className="font-medium">Screen Signature</span>
                            </div>
                            <span className="text-sm">{formData.screenSignature}</span>
                        </CardContent>
                    </Card>
                )}
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
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Device Theme</h3>
                        <p className="text-sm text-muted-foreground">Configure launcher appearance for managed devices</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* App Names Color */}
                <div className="space-y-2">
                    <Label htmlFor="appNamesColor">App Names Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="appNamesColor"
                            type="color"
                            value={formData.appNamesColor || '#ffffff'}
                            onChange={(e) => setFormData(prev => ({ ...prev, appNamesColor: e.target.value }))}
                            className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            value={formData.appNamesColor || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, appNamesColor: e.target.value }))}
                            placeholder="#ffffff"
                            pattern="^#[0-9a-fA-F]{6}$"
                            className="flex-1"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Color for app name labels on the launcher (hex format: #RRGGBB)
                    </p>
                </div>

                {/* Icon Size */}
                <div className="space-y-2">
                    <Label>Icon Size</Label>
                    <Select
                        value={formData.iconSize}
                        onValueChange={(value: IconSize) => 
                            setFormData(prev => ({ ...prev, iconSize: value }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select icon size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SMALL">Small</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LARGE">Large</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Size of app icons on the launcher
                    </p>
                </div>

                {/* Screen Orientation */}
                <div className="space-y-2">
                    <Label>Screen Orientation</Label>
                    <Select
                        value={formData.screenOrientation}
                        onValueChange={(value: ScreenOrientation) => 
                            setFormData(prev => ({ ...prev, screenOrientation: value }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select orientation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NONE">Auto (Follow device)</SelectItem>
                            <SelectItem value="PORTRAIT">Portrait</SelectItem>
                            <SelectItem value="LANDSCAPE">Landscape</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Lock screen orientation or allow device to auto-rotate
                    </p>
                </div>

                {/* Background Type Toggle */}
                <div className="space-y-2">
                    <Label>Background Type</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={!useBackgroundImage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setUseBackgroundImage(false)}
                        >
                            <Palette className="w-4 h-4 mr-2" />
                            Solid Color
                        </Button>
                        <Button
                            type="button"
                            variant={useBackgroundImage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setUseBackgroundImage(true)}
                        >
                            <Image className="w-4 h-4 mr-2" />
                            Image URL
                        </Button>
                    </div>
                </div>

                {/* Background Color or Image */}
                {!useBackgroundImage ? (
                    <div className="space-y-2">
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="backgroundColor"
                                type="color"
                                value={formData.backgroundColor || '#1a1a2e'}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                value={formData.backgroundColor || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                placeholder="#1a1a2e"
                                pattern="^#[0-9a-fA-F]{6}$"
                                className="flex-1"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="backgroundImage">Background Image URL</Label>
                        <Input
                            id="backgroundImage"
                            value={formData.backgroundImage || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                            placeholder="https://example.com/wallpaper.jpg"
                            type="url"
                        />
                        <p className="text-xs text-muted-foreground">
                            URL to the wallpaper image for the device launcher
                        </p>
                    </div>
                )}

                {/* Screen Signature */}
                <div className="space-y-2">
                    <Label htmlFor="screenSignature">Screen Signature (Optional)</Label>
                    <Input
                        id="screenSignature"
                        value={formData.screenSignature || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, screenSignature: e.target.value }))}
                        placeholder="Company managed device"
                    />
                    <p className="text-xs text-muted-foreground">
                        Text displayed on the device screen (e.g., organization branding)
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
