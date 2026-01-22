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
import { KioskRestriction as KioskRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, Monitor, Power, Save } from 'lucide-react';
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
        mode: initialData?.mode,
        apps: initialData?.apps || [],
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

    const getModeLabel = (mode?: string) => {
        switch (mode) {
            case 'SINGLE_APP': return 'Single App Mode';
            case 'MULTI_APP': return 'Multi App Mode';
            default: return 'Disabled';
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Power className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Kiosk Restriction</h3>
                        <p className="text-sm text-muted-foreground">Lock device to specific apps</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.mode ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Monitor className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Kiosk Mode</span>
                        </div>
                        <Badge variant={formData.mode ? 'default' : 'secondary'}>
                            {getModeLabel(formData.mode)}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Power className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Allowed Apps</span>
                        </div>
                        <span className="text-2xl font-bold">{formData.apps?.length || 0}</span>
                        <span className="text-sm text-muted-foreground ml-2">configured</span>
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
                        <p className="text-sm text-muted-foreground">Lock device to specific applications</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="space-y-2">
                    <Label>Kiosk Mode</Label>
                    <Select
                        value={formData.mode || 'disabled'}
                        onValueChange={(value) => 
                            setFormData(prev => ({ 
                                ...prev, 
                                mode: value === 'disabled' ? undefined : value as 'SINGLE_APP' | 'MULTI_APP'
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="disabled">Disabled</SelectItem>
                            <SelectItem value="SINGLE_APP">Single App Mode</SelectItem>
                            <SelectItem value="MULTI_APP">Multi App Mode</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {formData.mode === 'SINGLE_APP' && 'Device will be locked to a single application'}
                        {formData.mode === 'MULTI_APP' && 'Device will only allow selected applications'}
                        {!formData.mode && 'No kiosk restrictions applied'}
                    </p>
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
