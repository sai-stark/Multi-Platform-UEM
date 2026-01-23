import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Platform, TetheringRestriction as TetheringRestrictionType } from '@/types/models';
import { Edit, Loader2, Save, Share2, Wifi } from 'lucide-react';
import { useState } from 'react';

interface TetheringRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: TetheringRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function TetheringRestriction({ platform, profileId, initialData, onSave, onCancel }: TetheringRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<TetheringRestrictionType>>({
        disableTethering: initialData?.disableTethering ?? true,
        disableWifiTethering: initialData?.disableWifiTethering ?? true,
        devicePolicyType: 'AndroidTetheringRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateTetheringRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createTetheringRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save tethering restriction:', error);
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
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Share2 className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Tethering Restriction</h3>
                        <p className="text-sm text-muted-foreground">Hotspot and tethering controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableTethering ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Share2 className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">All Tethering</span>
                        </div>
                        <Badge variant={formData.disableTethering ? 'default' : 'destructive'}>
                            {formData.disableTethering ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableTethering 
                                ? 'All tethering modes blocked' 
                                : 'USB/Bluetooth tethering allowed'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableWifiTethering ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Wi-Fi Hotspot</span>
                        </div>
                        <Badge variant={formData.disableWifiTethering ? 'default' : 'destructive'}>
                            {formData.disableWifiTethering ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableWifiTethering 
                                ? 'Mobile hotspot is blocked' 
                                : 'Users can create hotspots'}
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
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Tethering Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure hotspot and tethering policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Share2 className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">Disable Tethering</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block all tethering (USB, Bluetooth)
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableTethering}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableTethering: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Wifi className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">Disable Wi-Fi Tethering</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block mobile Wi-Fi hotspot functionality
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableWifiTethering}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableWifiTethering: c }))}
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
