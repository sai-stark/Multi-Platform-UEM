import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneRestriction as PhoneRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, MessageSquare, Phone, PhoneOff, Save } from 'lucide-react';
import { useState } from 'react';

interface PhoneRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: PhoneRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function PhoneRestriction({ platform, profileId, initialData, onSave, onCancel }: PhoneRestrictionProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<PhoneRestrictionType>>({
        disableSms: initialData?.disableSms ?? false,
        disableCalls: initialData?.disableCalls ?? false,
        devicePolicyType: 'AndroidPhoneRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updatePhoneRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createPhoneRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save phone restriction:', error);
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
                        <Phone className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Phone Restriction</h3>
                        <p className="text-sm text-muted-foreground">Call and SMS controls</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableCalls ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {formData.disableCalls 
                                ? <PhoneOff className="w-5 h-5 text-red-500" />
                                : <Phone className="w-5 h-5 text-green-500" />
                            }
                            <span className="font-medium">Phone Calls</span>
                        </div>
                        <Badge variant={formData.disableCalls ? 'destructive' : 'default'}>
                            {formData.disableCalls ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableCalls 
                                ? 'Users cannot make or receive calls' 
                                : 'Phone calls are allowed'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableSms ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">SMS Messages</span>
                        </div>
                        <Badge variant={formData.disableSms ? 'destructive' : 'default'}>
                            {formData.disableSms ? 'Disabled' : 'Allowed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableSms 
                                ? 'Users cannot send or receive SMS' 
                                : 'SMS messaging is allowed'}
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
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Phone Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure call and SMS policies</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <PhoneOff className="w-5 h-5 mt-0.5 text-red-500" />
                        <div>
                            <span className="font-medium">Disable Calls</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block all incoming and outgoing phone calls
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableCalls}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableCalls: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">Disable SMS</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                Block sending and receiving text messages
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableSms}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableSms: c }))}
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
