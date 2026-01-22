import { policyAPI } from '@/api/services/Androidpolicies';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AndroidWebApplicationPolicy as AndroidWebApplicationPolicyType, Platform } from '@/types/models';
import { Edit, Globe, Link, Loader2, Save } from 'lucide-react';
import { useState } from 'react';

interface AndroidWebApplicationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: AndroidWebApplicationPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function AndroidWebApplicationPolicy({ platform, profileId, initialData, onSave, onCancel }: AndroidWebApplicationPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<AndroidWebApplicationPolicyType>>({
        webAppId: initialData?.webAppId || '',
        keyCode: initialData?.keyCode,
        screenOrder: initialData?.screenOrder ?? 0,
        screenBottom: initialData?.screenBottom ?? false,
        policyType: 'AndroidWebApplicationPolicy',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateWebApplicationPolicy(platform, profileId, formData);
            } else {
                await policyAPI.createWebApplicationPolicy(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save web application policy:', error);
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
                        <Globe className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Web Application Policy</h3>
                        <p className="text-sm text-muted-foreground">Web app shortcuts for Android</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Policy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Link className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Web App ID</span>
                        </div>
                        <p className="text-sm font-mono bg-muted/50 p-2 rounded truncate">
                            {formData.webAppId || 'Not set'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Web App Name</span>
                        </div>
                        <p className="text-sm">{formData.webAppName || 'Not available'}</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Screen Position</span>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="secondary">Order: {formData.screenOrder ?? 0}</Badge>
                            <Badge variant={formData.screenBottom ? 'default' : 'outline'}>
                                {formData.screenBottom ? 'Bottom' : 'Top'}
                            </Badge>
                        </div>
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
                        <h3 className="text-lg font-medium">Edit Web Application Policy</h3>
                        <p className="text-sm text-muted-foreground">Configure web app shortcut</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="space-y-2">
                    <Label htmlFor="webAppId">Web App ID</Label>
                    <Input
                        id="webAppId"
                        value={formData.webAppId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, webAppId: e.target.value }))}
                        placeholder="Enter web app ID"
                    />
                    <p className="text-xs text-muted-foreground">
                        The ID of the web application from the app repository
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="keyCode">Key Code (Optional)</Label>
                    <Input
                        id="keyCode"
                        type="number"
                        value={formData.keyCode || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, keyCode: Number(e.target.value) || undefined }))}
                        placeholder="Enter key code"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="screenOrder">Screen Order</Label>
                    <Input
                        id="screenOrder"
                        type="number"
                        min={0}
                        value={formData.screenOrder ?? 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, screenOrder: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Position of the app shortcut on screen (0 = first)
                    </p>
                </div>

                <div className="flex items-center justify-between py-3 border-t">
                    <Label className="flex items-start gap-3">
                        <div>
                            <span className="font-medium">Position at Bottom</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Place shortcut at bottom of screen
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.screenBottom}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, screenBottom: c }))}
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
