import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LocationRestriction as LocationRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, MapPin, Save } from 'lucide-react';
import { useState } from 'react';

interface LocationRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: LocationRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function LocationRestriction({ platform, profileId, initialData, onSave, onCancel }: LocationRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<LocationRestrictionType>>({
        forceGps: initialData?.forceGps ?? false,
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateLocationRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createLocationRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save location restriction:', error);
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
                    <div className="p-2 bg-red-500/10 rounded-full">
                        <MapPin className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Location Restriction</h3>
                        <p className="text-sm text-muted-foreground">GPS and location services control</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <Card className={`border-l-4 ${formData.forceGps ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Force GPS On</span>
                    </div>
                    <Badge variant={formData.forceGps ? 'default' : 'secondary'}>
                        {formData.forceGps ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                        {formData.forceGps 
                            ? 'Users cannot disable location services' 
                            : 'Users can control location settings'}
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
                    <div className="p-2 bg-red-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Location Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure GPS and location policies</p>
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between">
                    <Label className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-0.5 text-red-500" />
                        <div>
                            <span className="font-medium">Force GPS On</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Prevent users from disabling location services
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.forceGps}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, forceGps: c }))}
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
