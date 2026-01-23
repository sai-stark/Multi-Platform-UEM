import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MiscellaneousRestriction as MiscellaneousRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, RefreshCw, Save, Settings, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface MiscellaneousRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: MiscellaneousRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function MiscellaneousRestriction({ platform, profileId, initialData, onSave, onCancel }: MiscellaneousRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<MiscellaneousRestrictionType>>({
        disableAddUser: initialData?.disableAddUser ?? true,
        disableFactoryReset: initialData?.disableFactoryReset ?? true,
        devicePolicyType: 'AndroidMiscellaneousRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateMiscellaneousRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createMiscellaneousRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save misc restriction:', error);
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
                    <div className="p-2 bg-amber-500/10 rounded-full">
                        <Settings className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Miscellaneous Restriction</h3>
                        <p className="text-sm text-muted-foreground">System-level controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableAddUser ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <UserPlus className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Add User</span>
                        </div>
                        <Badge variant={formData.disableAddUser ? 'default' : 'destructive'}>
                            {formData.disableAddUser ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableAddUser 
                                ? 'Users cannot add new accounts' 
                                : 'Multiple accounts can be added'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableFactoryReset ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-5 h-5 text-amber-500" />
                            <span className="font-medium">Factory Reset</span>
                        </div>
                        <Badge variant={formData.disableFactoryReset ? 'default' : 'destructive'}>
                            {formData.disableFactoryReset ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableFactoryReset 
                                ? 'Factory reset is blocked' 
                                : 'Device can be factory reset'}
                        </p>
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
                    <div className="p-2 bg-amber-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Miscellaneous Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure system-level controls</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <UserPlus className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">Disable Add User</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Prevent adding new user accounts
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableAddUser}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAddUser: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 mt-0.5 text-amber-500" />
                        <div>
                            <span className="font-medium">Disable Factory Reset</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block factory reset from settings
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableFactoryReset}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableFactoryReset: c }))}
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
