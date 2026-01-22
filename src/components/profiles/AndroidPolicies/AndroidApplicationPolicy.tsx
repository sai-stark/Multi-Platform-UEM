import { policyAPI } from '@/api/services/Androidpolicies';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AndroidApplicationPolicy as AndroidApplicationPolicyType, ApplicationAction, Platform } from '@/types/models';
import { AppWindow, Ban, Check, Download, Edit, Loader2, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AndroidApplicationPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: AndroidApplicationPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function AndroidApplicationPolicy({ platform, profileId, initialData, onSave, onCancel }: AndroidApplicationPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<AndroidApplicationPolicyType>>({
        applicationVersionId: initialData?.applicationVersionId || '',
        action: initialData?.action || 'INSTALL',
        devicePolicyType: 'AndroidApplicationPolicy',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateApplicationPolicy(platform, profileId, formData);
            } else {
                await policyAPI.createApplicationPolicy(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save application policy:', error);
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

    const getActionIcon = (action?: ApplicationAction) => {
        switch (action) {
            case 'INSTALL': return <Download className="w-4 h-4 text-green-500" />;
            case 'UNINSTALL': return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'ALLOW': return <Check className="w-4 h-4 text-blue-500" />;
            case 'BLOCK': return <Ban className="w-4 h-4 text-orange-500" />;
            default: return <AppWindow className="w-4 h-4" />;
        }
    };

    const getActionColor = (action?: ApplicationAction) => {
        switch (action) {
            case 'INSTALL': return 'border-l-green-500';
            case 'UNINSTALL': return 'border-l-red-500';
            case 'ALLOW': return 'border-l-blue-500';
            case 'BLOCK': return 'border-l-orange-500';
            default: return 'border-l-gray-300';
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <AppWindow className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Application Policy</h3>
                        <p className="text-sm text-muted-foreground">Manage Android applications</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Policy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${getActionColor(formData.action)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {getActionIcon(formData.action)}
                            <span className="font-medium">Action</span>
                        </div>
                        <Badge variant="default">{formData.action}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AppWindow className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Application Version ID</span>
                        </div>
                        <p className="text-sm font-mono bg-muted/50 p-2 rounded truncate">
                            {formData.applicationVersionId || 'Not set'}
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
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Application Policy</h3>
                        <p className="text-sm text-muted-foreground">Configure Android app management</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="space-y-2">
                    <Label htmlFor="applicationVersionId">Application Version ID</Label>
                    <Input
                        id="applicationVersionId"
                        value={formData.applicationVersionId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, applicationVersionId: e.target.value }))}
                        placeholder="Enter application version UUID"
                    />
                    <p className="text-xs text-muted-foreground">
                        The UUID of the application version from the app repository
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                        value={formData.action}
                        onValueChange={(value: ApplicationAction) => 
                            setFormData(prev => ({ ...prev, action: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INSTALL">
                                <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4 text-green-500" />
                                    Install
                                </div>
                            </SelectItem>
                            <SelectItem value="UNINSTALL">
                                <div className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    Uninstall
                                </div>
                            </SelectItem>
                            <SelectItem value="ALLOW">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-blue-500" />
                                    Allow
                                </div>
                            </SelectItem>
                            <SelectItem value="BLOCK">
                                <div className="flex items-center gap-2">
                                    <Ban className="w-4 h-4 text-orange-500" />
                                    Block
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
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
