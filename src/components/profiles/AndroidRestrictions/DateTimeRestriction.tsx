import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DateTimeRestriction as DateTimeRestrictionType, Platform } from '@/types/models';
import { Clock, Edit, Loader2, Save } from 'lucide-react';
import { useState } from 'react';

interface DateTimeRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: DateTimeRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function DateTimeRestriction({ platform, profileId, initialData, onSave, onCancel }: DateTimeRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<DateTimeRestrictionType>>({
        forceAutomaticTime: initialData?.forceAutomaticTime ?? false,
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateDateTimeRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createDateTimeRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save datetime restriction:', error);
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
                    <div className="p-2 bg-cyan-500/10 rounded-full">
                        <Clock className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Date/Time Restriction</h3>
                        <p className="text-sm text-muted-foreground">Automatic time synchronization</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <Card className={`border-l-4 ${formData.forceAutomaticTime ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-cyan-500" />
                        <span className="font-medium">Force Automatic Time</span>
                    </div>
                    <Badge variant={formData.forceAutomaticTime ? 'default' : 'secondary'}>
                        {formData.forceAutomaticTime ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                        {formData.forceAutomaticTime 
                            ? 'Users cannot manually change time settings' 
                            : 'Users can manually set date and time'}
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
                    <div className="p-2 bg-cyan-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Date/Time Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure time synchronization policy</p>
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between">
                    <Label className="flex items-start gap-3">
                        <Clock className="w-5 h-5 mt-0.5 text-cyan-500" />
                        <div>
                            <span className="font-medium">Force Automatic Time</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Prevent manual date/time changes
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.forceAutomaticTime}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, forceAutomaticTime: c }))}
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
