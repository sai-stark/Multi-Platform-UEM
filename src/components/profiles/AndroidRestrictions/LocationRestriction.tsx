import { restrictionAPI } from '@/api/services/Androidrestrictions';
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
import { Switch } from '@/components/ui/switch';
import { ControlType, LocationRestriction as LocationRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, MapPin, MapPinOff, Save, Share2 } from 'lucide-react';
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
        location: initialData?.location || 'USER_CONTROLLED',
        disableLocationSharing: initialData?.disableLocationSharing ?? true,
        devicePolicyType: 'AndroidLocationRestriction',
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

    const getLocationLabel = (control?: ControlType) => {
        switch (control) {
            case 'ENABLE': return 'Always Enabled';
            case 'DISABLE': return 'Always Disabled';
            case 'USER_CONTROLLED': return 'User Controlled';
            default: return 'User Controlled';
        }
    };

    const getLocationColor = (control?: ControlType) => {
        switch (control) {
            case 'ENABLE': return 'border-l-green-500';
            case 'DISABLE': return 'border-l-red-500';
            default: return 'border-l-blue-500';
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${getLocationColor(formData.location)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="font-medium">Location Services</span>
                        </div>
                        <Badge variant="secondary">{getLocationLabel(formData.location)}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.location === 'ENABLE' && 'GPS is always on, users cannot disable'}
                            {formData.location === 'DISABLE' && 'GPS is always off, users cannot enable'}
                            {formData.location === 'USER_CONTROLLED' && 'Users can toggle location settings'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableLocationSharing ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Share2 className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Location Sharing</span>
                        </div>
                        <Badge variant={formData.disableLocationSharing ? 'default' : 'destructive'}>
                            {formData.disableLocationSharing ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableLocationSharing 
                                ? 'Users cannot share location with other apps' 
                                : 'Location sharing is allowed'}
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
                    <div className="p-2 bg-red-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Location Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure GPS and location policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                <div className="space-y-2">
                    <Label>Location Services Control</Label>
                    <Select
                        value={formData.location}
                        onValueChange={(value: ControlType) => 
                            setFormData(prev => ({ ...prev, location: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select location control" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ENABLE">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-500" />
                                    Always Enabled - Force GPS on
                                </div>
                            </SelectItem>
                            <SelectItem value="DISABLE">
                                <div className="flex items-center gap-2">
                                    <MapPinOff className="w-4 h-4 text-red-500" />
                                    Always Disabled - Force GPS off
                                </div>
                            </SelectItem>
                            <SelectItem value="USER_CONTROLLED">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    User Controlled - Let user decide
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Control whether location services can be toggled by users
                    </p>
                </div>

                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Share2 className="w-5 h-5 mt-0.5 text-purple-500" />
                            <div>
                                <span className="font-medium">Disable Location Sharing</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Block apps from sharing device location
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableLocationSharing}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableLocationSharing: c }))}
                        />
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
