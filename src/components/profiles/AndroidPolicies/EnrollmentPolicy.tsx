import { policyAPI } from '@/api/services/Androidpolicies';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EnrollmentPolicy as EnrollmentPolicyType, Platform } from '@/types/models';
import { CheckCircle, Edit, Link, Loader2, Save, UserPlus, XCircle } from 'lucide-react';
import { useState } from 'react';

interface EnrollmentPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: EnrollmentPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function EnrollmentPolicy({ platform, profileId, initialData, onSave, onCancel }: EnrollmentPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<EnrollmentPolicyType>>({
        allowEnrollment: initialData?.allowEnrollment ?? true,
        enrollmentUrl: initialData?.enrollmentUrl || '',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateEnrollmentPolicy(platform, profileId, formData);
            } else {
                await policyAPI.createEnrollmentPolicy(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save enrollment policy:', error);
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
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <UserPlus className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Enrollment Policy</h3>
                        <p className="text-sm text-muted-foreground">Device enrollment settings</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Policy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={`border-l-4 ${formData.allowEnrollment ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {formData.allowEnrollment 
                                ? <CheckCircle className="w-5 h-5 text-green-500" />
                                : <XCircle className="w-5 h-5 text-red-500" />
                            }
                            <span className="text-sm font-medium text-muted-foreground">Enrollment Status</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">
                                {formData.allowEnrollment ? 'Allowed' : 'Disabled'}
                            </span>
                            <Badge variant={formData.allowEnrollment ? 'default' : 'destructive'}>
                                {formData.allowEnrollment ? 'Active' : 'Blocked'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Link className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-muted-foreground">Enrollment URL</span>
                        </div>
                        <div className="text-sm font-mono bg-muted/50 p-2 rounded truncate">
                            {formData.enrollmentUrl || 'Not configured'}
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
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Enrollment Policy</h3>
                        <p className="text-sm text-muted-foreground">Configure device enrollment settings</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-base">Allow Device Enrollment</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable or disable new device enrollments for this profile
                            </p>
                        </div>
                        <Switch
                            checked={formData.allowEnrollment}
                            onCheckedChange={(checked) => 
                                setFormData(prev => ({ ...prev, allowEnrollment: checked }))
                            }
                        />
                    </div>
                </div>

                {formData.allowEnrollment && (
                    <div className="space-y-2">
                        <Label htmlFor="enrollmentUrl">Enrollment URL</Label>
                        <div className="relative">
                            <Link className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="enrollmentUrl"
                                className="pl-9"
                                value={formData.enrollmentUrl || ''}
                                onChange={(e) => 
                                    setFormData(prev => ({ ...prev, enrollmentUrl: e.target.value }))
                                }
                                placeholder="https://enrollment.example.com/android"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            The URL where devices will be directed for enrollment
                        </p>
                    </div>
                )}
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
