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
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
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
    const { t } = useLanguage();
    const { toast } = useToast();
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
            toast({
                title: t('common.error'),
                description: getErrorMessage(error, t('restrictions.saveFailed')),
                variant: 'destructive',
            });
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
            case 'ENABLE': return t('restrictions.location.alwaysEnabled');
            case 'DISABLE': return t('restrictions.location.alwaysDisabled');
            case 'USER_CONTROLLED': return t('restrictions.control.userControlled');
            default: return t('restrictions.control.userControlled');
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
                        <h3 className="text-xl font-semibold">{t('restrictions.android.location')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.location.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${getLocationColor(formData.location)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="font-medium">{t('restrictions.location.services')}</span>
                        </div>
                        <Badge variant="secondary">{getLocationLabel(formData.location)}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.location === 'ENABLE' && t('restrictions.location.gpsAlwaysOnDesc')}
                            {formData.location === 'DISABLE' && t('restrictions.location.gpsAlwaysOffDesc')}
                            {formData.location === 'USER_CONTROLLED' && t('restrictions.location.userToggleDesc')}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableLocationSharing ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Share2 className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('restrictions.location.sharing')}</span>
                        </div>
                        <Badge variant={formData.disableLocationSharing ? 'default' : 'destructive'}>
                            {formData.disableLocationSharing ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableLocationSharing 
                                ? t('restrictions.location.sharingDisabledDesc') 
                                : t('restrictions.location.sharingAllowedDesc')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>{t('common.close')}</Button>
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
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.location')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.location.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                <div className="space-y-2">
                    <Label>{t('restrictions.location.servicesControl')}</Label>
                    <Select
                        value={formData.location}
                        onValueChange={(value: ControlType) => 
                            setFormData(prev => ({ ...prev, location: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('restrictions.location.servicesControl')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ENABLE">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-500" />
                                    {t('restrictions.location.alwaysEnabled')} - {t('restrictions.location.forceGpsOn')}
                                </div>
                            </SelectItem>
                            <SelectItem value="DISABLE">
                                <div className="flex items-center gap-2">
                                    <MapPinOff className="w-4 h-4 text-red-500" />
                                    {t('restrictions.location.alwaysDisabled')} - {t('restrictions.location.forceGpsOff')}
                                </div>
                            </SelectItem>
                            <SelectItem value="USER_CONTROLLED">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    {t('restrictions.control.userControlled')} - {t('restrictions.control.letUserDecide')}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {t('restrictions.location.controlDesc')}
                    </p>
                </div>

                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Share2 className="w-5 h-5 mt-0.5 text-purple-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.location.disableSharing')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.location.disableSharingDesc')}
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
                    {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading} className="gap-2 min-w-[140px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('form.saveChanges')}
                </Button>
            </div>
        </form>
    );
}
