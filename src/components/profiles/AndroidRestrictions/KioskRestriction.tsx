import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { KioskRestriction as KioskRestrictionType, Platform } from '@/types/models';
import { Bell, Edit, Home, Lock, Loader2, Power, Rows, Save, Square } from 'lucide-react';
import { useState } from 'react';

interface KioskRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: KioskRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function KioskRestriction({ platform, profileId, initialData, onSave, onCancel }: KioskRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<KioskRestrictionType>>({
        enableHomeButton: initialData?.enableHomeButton ?? false,
        enableRecentsButton: initialData?.enableRecentsButton ?? false,
        enableNotifications: initialData?.enableNotifications ?? false,
        enableStatusBar: initialData?.enableStatusBar ?? false,
        enableScreenLock: initialData?.enableScreenLock ?? false,
        lockPowerButton: initialData?.lockPowerButton ?? true,
        exitKioskButton: initialData?.exitKioskButton ?? false,
        devicePolicyType: 'AndroidKioskRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateKioskRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createKioskRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save kiosk restriction:', error);
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
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Square className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Kiosk Restriction</h3>
                        <p className="text-sm text-muted-foreground">Kiosk mode UI controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={`border-l-4 ${formData.enableHomeButton ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Home className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Home Button</span>
                        </div>
                        <Badge variant={formData.enableHomeButton ? 'default' : 'secondary'}>
                            {formData.enableHomeButton ? 'Enabled' : 'Hidden'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableRecentsButton ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Rows className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Recents Button</span>
                        </div>
                        <Badge variant={formData.enableRecentsButton ? 'default' : 'secondary'}>
                            {formData.enableRecentsButton ? 'Enabled' : 'Hidden'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableNotifications ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">Notifications</span>
                        </div>
                        <Badge variant={formData.enableNotifications ? 'default' : 'secondary'}>
                            {formData.enableNotifications ? 'Shown' : 'Hidden'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableStatusBar ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Rows className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">Status Bar</span>
                        </div>
                        <Badge variant={formData.enableStatusBar ? 'default' : 'secondary'}>
                            {formData.enableStatusBar ? 'Visible' : 'Hidden'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableScreenLock ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Screen Lock</span>
                        </div>
                        <Badge variant={formData.enableScreenLock ? 'default' : 'secondary'}>
                            {formData.enableScreenLock ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.lockPowerButton ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Power className="w-5 h-5 text-red-500" />
                            <span className="font-medium">Power Button</span>
                        </div>
                        <Badge variant={formData.lockPowerButton ? 'secondary' : 'default'}>
                            {formData.lockPowerButton ? 'Locked' : 'Unlocked'}
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
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Kiosk Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure kiosk mode UI elements</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Home className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">Enable Home Button</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Show the home button in kiosk mode
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableHomeButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableHomeButton: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Rows className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">Enable Recents Button</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Allow access to recent apps
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableRecentsButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableRecentsButton: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Bell className="w-5 h-5 mt-0.5 text-yellow-500" />
                        <div>
                            <span className="font-medium">Enable Notifications</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Show system notifications
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableNotifications}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableNotifications: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Rows className="w-5 h-5 mt-0.5 text-cyan-500" />
                        <div>
                            <span className="font-medium">Enable Status Bar</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Show the system status bar
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableStatusBar}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableStatusBar: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Lock className="w-5 h-5 mt-0.5 text-green-500" />
                        <div>
                            <span className="font-medium">Enable Screen Lock</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Allow device screen lock
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableScreenLock}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableScreenLock: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Power className="w-5 h-5 mt-0.5 text-red-500" />
                        <div>
                            <span className="font-medium">Lock Power Button</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Disable power button functionality
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.lockPowerButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, lockPowerButton: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Square className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">Exit Kiosk Button</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Show button to exit kiosk mode (requires admin PIN)
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.exitKioskButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, exitKioskButton: c }))}
                    />
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
