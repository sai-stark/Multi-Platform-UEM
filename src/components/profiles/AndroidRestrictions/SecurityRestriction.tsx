import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Platform, SecurityRestriction as SecurityRestrictionType } from '@/types/models';
import { Code, Edit, Loader2, Lock, Save, Shield, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

interface SecurityRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: SecurityRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function SecurityRestriction({ platform, profileId, initialData, onSave, onCancel }: SecurityRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<SecurityRestrictionType>>({
        lockSafeSettings: initialData?.lockSafeSettings ?? false,
        disableDevMode: initialData?.disableDevMode ?? true,
        disableThirdPartyAppInstall: initialData?.disableThirdPartyAppInstall ?? true,
        enablePermissiveMode: initialData?.enablePermissiveMode ?? false,
        devicePolicyType: 'AndroidSecurityRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateSecurityRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createSecurityRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save security restriction:', error);
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
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Security Restriction</h3>
                        <p className="text-sm text-muted-foreground">Device security configurations</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.lockSafeSettings ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Lock Safe Settings</span>
                        </div>
                        <Badge variant={formData.lockSafeSettings ? 'default' : 'secondary'}>
                            {formData.lockSafeSettings ? 'Locked' : 'Unlocked'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.lockSafeSettings ? 'System settings are protected' : 'Users can access settings'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableDevMode ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Code className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Developer Mode</span>
                        </div>
                        <Badge variant={formData.disableDevMode ? 'default' : 'destructive'}>
                            {formData.disableDevMode ? 'Disabled' : 'Allowed'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableThirdPartyAppInstall ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">Third-Party Apps</span>
                        </div>
                        <Badge variant={formData.disableThirdPartyAppInstall ? 'default' : 'destructive'}>
                            {formData.disableThirdPartyAppInstall ? 'Blocked' : 'Allowed'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enablePermissiveMode ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">Permissive Mode</span>
                        </div>
                        <Badge variant={formData.enablePermissiveMode ? 'secondary' : 'default'}>
                            {formData.enablePermissiveMode ? 'Enabled' : 'Disabled'}
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
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Security Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure device security policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Lock className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">Lock Safe Settings</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Prevent users from modifying critical system settings
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.lockSafeSettings}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, lockSafeSettings: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Code className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">Disable Developer Mode</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block access to developer options and USB debugging
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableDevMode}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableDevMode: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">Disable Third-Party App Install</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block installation of apps from unknown sources
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableThirdPartyAppInstall}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableThirdPartyAppInstall: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Shield className="w-5 h-5 mt-0.5 text-yellow-500" />
                        <div>
                            <span className="font-medium">Enable Permissive Mode</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Allow temporary relaxation of security policies
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enablePermissiveMode}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enablePermissiveMode: c }))}
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
