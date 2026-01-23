import { restrictionAPI } from '@/api/services/Androidrestrictions';
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
import { Switch } from '@/components/ui/switch';
import { DateTimeRestriction as DateTimeRestrictionType, Platform } from '@/types/models';
import { Clock, Edit, Globe, Loader2, Save, Settings } from 'lucide-react';
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
        dateTimePolicy: initialData?.dateTimePolicy || { dateTimeSetting: 'NetworkProvidedDateTime' },
        disableDateTimeSetting: initialData?.disableDateTimeSetting ?? false,
        devicePolicyType: 'AndroidDateTimeRestriction',
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

    const isManualDateTime = formData.dateTimePolicy?.dateTimeSetting === 'ManualDateTime';

    const getDateTimeLabel = () => {
        if (isManualDateTime) {
            const timezone = (formData.dateTimePolicy as any)?.timezone;
            return `Manual${timezone ? ` (${timezone})` : ''}`;
        }
        return 'Network Provided';
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
                        <p className="text-sm text-muted-foreground">Time synchronization settings</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">Date/Time Source</span>
                        </div>
                        <Badge variant="secondary">{getDateTimeLabel()}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {isManualDateTime 
                                ? 'Time is set manually with a fixed timezone' 
                                : 'Time is synchronized from the network'}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableDateTimeSetting ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Date/Time Settings Access</span>
                        </div>
                        <Badge variant={formData.disableDateTimeSetting ? 'default' : 'secondary'}>
                            {formData.disableDateTimeSetting ? 'Locked' : 'User Accessible'}
                        </Badge>
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
                    <div className="p-2 bg-cyan-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Date/Time Restriction</h3>
                        <p className="text-sm text-muted-foreground">Configure time synchronization policy</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                <div className="space-y-2">
                    <Label>Date/Time Policy</Label>
                    <Select
                        value={formData.dateTimePolicy?.dateTimeSetting || 'NetworkProvidedDateTime'}
                        onValueChange={(value) => {
                            if (value === 'ManualDateTime') {
                                setFormData(prev => ({
                                    ...prev,
                                    dateTimePolicy: { dateTimeSetting: 'ManualDateTime', timezone: '' }
                                }));
                            } else {
                                setFormData(prev => ({
                                    ...prev,
                                    dateTimePolicy: { dateTimeSetting: 'NetworkProvidedDateTime' }
                                }));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select date/time policy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NetworkProvidedDateTime">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    Network Provided - Sync from network
                                </div>
                            </SelectItem>
                            <SelectItem value="ManualDateTime">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cyan-500" />
                                    Manual - Set timezone manually
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isManualDateTime && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                            id="timezone"
                            value={(formData.dateTimePolicy as any)?.timezone || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                dateTimePolicy: {
                                    dateTimeSetting: 'ManualDateTime',
                                    timezone: e.target.value
                                }
                            }))}
                            placeholder="e.g., Asia/Kolkata, America/New_York"
                        />
                        <p className="text-xs text-muted-foreground">
                            IANA timezone identifier
                        </p>
                    </div>
                )}

                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Settings className="w-5 h-5 mt-0.5 text-blue-500" />
                            <div>
                                <span className="font-medium">Disable Date/Time Setting</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    Prevent users from changing date/time settings
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableDateTimeSetting}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableDateTimeSetting: c }))}
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
