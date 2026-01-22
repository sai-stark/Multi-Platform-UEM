import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DisplayRestriction as DisplayRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, Monitor, Save } from 'lucide-react';
import { useState } from 'react';

interface DisplayRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: DisplayRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function DisplayRestriction({ platform, profileId, initialData, onSave, onCancel }: DisplayRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<DisplayRestrictionType>>({
        screenTimeout: initialData?.screenTimeout ?? 300,
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateDisplayRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createDisplayRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save display restriction:', error);
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

    const formatTimeout = (seconds?: number) => {
        if (!seconds || seconds === 0) return 'Never';
        if (seconds < 60) return `${seconds} seconds`;
        return `${Math.floor(seconds / 60)} minutes`;
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Monitor className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Display Restriction</h3>
                        <p className="text-sm text-muted-foreground">Screen timeout settings</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-5 h-5 text-indigo-500" />
                        <span className="font-medium">Screen Timeout</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{formData.screenTimeout || 0}</span>
                        <span className="text-muted-foreground">seconds</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                        {formatTimeout(formData.screenTimeout)}
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
                    <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Display Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure screen timeout policy</p>
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded-xl bg-card space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="screenTimeout">Screen Timeout (seconds)</Label>
                    <Input
                        id="screenTimeout"
                        type="number"
                        min={0}
                        max={3600}
                        value={formData.screenTimeout || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, screenTimeout: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Time in seconds before the screen turns off (0 = never)
                    </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm">
                        Current setting: <strong>{formatTimeout(formData.screenTimeout)}</strong>
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
