import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Platform, SyncStorageRestriction as SyncStorageRestrictionType } from '@/types/models';
import { Edit, HardDrive, Loader2, Save, Usb } from 'lucide-react';
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
        disableExternalMediaMount: initialData?.disableExternalMediaMount ?? true,
        disableUsbTransfer: initialData?.disableUsbTransfer ?? true,
        devicePolicyType: 'AndroidSyncStorageRestriction',
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
                        <h3 className="text-xl font-semibold">Sync/Storage Restriction</h3>
                        <p className="text-sm text-muted-foreground">External storage and USB controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableExternalMediaMount ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <HardDrive className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">External Media Mount</span>
                        </div>
                        <Badge variant={formData.disableExternalMediaMount ? 'default' : 'destructive'}>
                            {formData.disableExternalMediaMount ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableExternalMediaMount 
                                ? 'SD cards and external storage blocked' 
                                : 'External storage can be mounted'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableUsbTransfer ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Usb className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">USB File Transfer</span>
                        </div>
                        <Badge variant={formData.disableUsbTransfer ? 'default' : 'destructive'}>
                            {formData.disableUsbTransfer ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableUsbTransfer 
                                ? 'USB data transfer blocked' 
                                : 'Files can be transferred via USB'}
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
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Storage Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure storage and sync policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <HardDrive className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">Disable External Media Mount</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block mounting of SD cards and external storage
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableExternalMediaMount}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableExternalMediaMount: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Usb className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">Disable USB Transfer</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block file transfer over USB connection
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableUsbTransfer}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableUsbTransfer: c }))}
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
