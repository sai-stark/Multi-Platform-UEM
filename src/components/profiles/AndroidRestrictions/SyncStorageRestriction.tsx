import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Platform, SyncStorageRestriction as SyncStorageRestrictionType } from '@/types/models';
import { Edit, HardDrive, Loader2, Save } from 'lucide-react';
import { useState } from 'react';

interface SyncStorageRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: SyncStorageRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function SyncStorageRestriction({ platform, profileId, initialData, onSave, onCancel }: SyncStorageRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<SyncStorageRestrictionType>>({
        allowUsbMassStorage: initialData?.allowUsbMassStorage ?? true,
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateSyncStorageRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createSyncStorageRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save storage restriction:', error);
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
                        <HardDrive className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Storage Restriction</h3>
                        <p className="text-sm text-muted-foreground">USB mass storage controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <Card className={`border-l-4 ${formData.allowUsbMassStorage ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="w-5 h-5 text-orange-500" />
                        <span className="font-medium">USB Mass Storage</span>
                    </div>
                    <Badge variant={formData.allowUsbMassStorage ? 'default' : 'destructive'}>
                        {formData.allowUsbMassStorage ? 'Allowed' : 'Blocked'}
                    </Badge>
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
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Storage Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure USB storage policy</p>
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between">
                    <Label className="flex items-start gap-3">
                        <HardDrive className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">Allow USB Mass Storage</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Enable USB file transfer
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.allowUsbMassStorage}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, allowUsbMassStorage: c }))}
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
