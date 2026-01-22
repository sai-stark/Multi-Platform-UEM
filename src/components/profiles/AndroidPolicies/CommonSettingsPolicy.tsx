import { policyAPI } from '@/api/services/Androidpolicies';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CommonSettingsPolicy as CommonSettingsPolicyType, Platform } from '@/types/models';
import { Edit, Loader2, Save, Settings } from 'lucide-react';
import { useState } from 'react';

interface CommonSettingsPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: CommonSettingsPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function CommonSettingsPolicy({ platform, profileId, initialData, onSave, onCancel }: CommonSettingsPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<CommonSettingsPolicyType>>({
        name: initialData?.name || 'Common Settings',
        description: initialData?.description || '',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateCommonSettingsPolicy(platform, profileId, formData);
            } else {
                await policyAPI.createCommonSettingsPolicy(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save common settings policy:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof CommonSettingsPolicyType, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Common Settings</h3>
                        <p className="text-sm text-muted-foreground">Device name and general configuration</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-muted-foreground">Policy Name</span>
                        </div>
                        <div className="text-lg font-semibold">{formData.name || 'Not Set'}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Edit className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-muted-foreground">Description</span>
                        </div>
                        <div className="text-sm">{formData.description || 'No description provided'}</div>
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
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Common Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure device naming and general settings</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 p-1">
                <div className="space-y-2">
                    <Label htmlFor="policyName">Policy Name</Label>
                    <Input
                        id="policyName"
                        value={formData.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g. Corporate Device Settings"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Describe the purpose of this policy..."
                        rows={3}
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
