import { policyAPI } from '@/api/services/Androidpolicies';
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
import { DeviceThemePolicy as DeviceThemePolicyType, Platform } from '@/types/models';
import { Edit, Loader2, Moon, Palette, Save, Sun, SunMoon } from 'lucide-react';
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

    const [formData, setFormData] = useState<Partial<DeviceThemePolicyType>>({
        name: initialData?.name || 'Device Theme',
        theme: initialData?.theme || 'SYSTEM',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateDeviceThemePolicy(platform, profileId, formData);
            } else {
                await policyAPI.createDeviceThemePolicy(platform, profileId, formData);
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

    const getThemeIcon = (theme?: string) => {
        switch (theme) {
            case 'LIGHT': return <Sun className="w-5 h-5 text-yellow-500" />;
            case 'DARK': return <Moon className="w-5 h-5 text-blue-500" />;
            default: return <SunMoon className="w-5 h-5 text-purple-500" />;
        }
    };

    const getThemeLabel = (theme?: string) => {
        switch (theme) {
            case 'LIGHT': return 'Light Mode';
            case 'DARK': return 'Dark Mode';
            default: return 'System Default';
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
                        <p className="text-sm text-muted-foreground">Device display theme configuration</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Theme
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['LIGHT', 'DARK', 'SYSTEM'].map((theme) => (
                    <Card 
                        key={theme}
                        className={`p-4 cursor-default transition-all ${
                            formData.theme === theme 
                                ? 'border-2 border-primary bg-primary/5' 
                                : 'border-dashed opacity-50'
                        }`}
                    >
                        <CardContent className="p-0 flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${
                                theme === 'LIGHT' ? 'bg-yellow-500/10' :
                                theme === 'DARK' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                            }`}>
                                {getThemeIcon(theme)}
                            </div>
                            <span className="font-medium">{getThemeLabel(theme)}</span>
                            {formData.theme === theme && (
                                <Badge className="bg-primary">Active</Badge>
                            )}
                        </CardContent>
                    </Card>
                ))}
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
                        <p className="text-sm text-muted-foreground">Select the display theme for managed devices</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                <div className="space-y-2">
                    <Label>Theme Mode</Label>
                    <Select
                        value={formData.theme}
                        onValueChange={(value: 'LIGHT' | 'DARK' | 'SYSTEM') => 
                            setFormData(prev => ({ ...prev, theme: value }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LIGHT">
                                <div className="flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-yellow-500" />
                                    Light Mode
                                </div>
                            </SelectItem>
                            <SelectItem value="DARK">
                                <div className="flex items-center gap-2">
                                    <Moon className="w-4 h-4 text-blue-500" />
                                    Dark Mode
                                </div>
                            </SelectItem>
                            <SelectItem value="SYSTEM">
                                <div className="flex items-center gap-2">
                                    <SunMoon className="w-4 h-4 text-purple-500" />
                                    System Default
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Choose the default theme mode for managed Android devices
                    </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-3">
                        {getThemeIcon(formData.theme)}
                        <div>
                            <p className="font-medium">{getThemeLabel(formData.theme)}</p>
                            <p className="text-xs text-muted-foreground">
                                {formData.theme === 'LIGHT' && 'Devices will use bright backgrounds'}
                                {formData.theme === 'DARK' && 'Devices will use dark backgrounds'}
                                {formData.theme === 'SYSTEM' && 'Devices will follow system settings'}
                            </p>
                        </div>
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
