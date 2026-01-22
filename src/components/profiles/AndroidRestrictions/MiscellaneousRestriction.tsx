import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MiscellaneousRestriction as MiscellaneousRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, RefreshCw, Save, Settings } from 'lucide-react';
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
        allowFactoryReset: initialData?.allowFactoryReset ?? false,
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
                        <p className="text-sm text-muted-foreground">Factory reset and other controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <Card className={`border-l-4 ${formData.allowFactoryReset ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">Factory Reset</span>
                    </div>
                    <Badge variant={formData.allowFactoryReset ? 'default' : 'destructive'}>
                        {formData.allowFactoryReset ? 'Allowed' : 'Blocked'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                        {formData.allowFactoryReset 
                            ? 'Users can factory reset the device' 
                            : 'Factory reset is disabled'}
                    </p>
                </CardContent>
            </Card>

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

            <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between">
                    <Label className="flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 mt-0.5 text-amber-500" />
                        <div>
                            <span className="font-medium">Allow Factory Reset</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Allow users to factory reset the device
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.allowFactoryReset}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, allowFactoryReset: c }))}
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
