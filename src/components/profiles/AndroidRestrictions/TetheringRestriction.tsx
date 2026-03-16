import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Platform, TetheringRestriction as TetheringRestrictionType } from '@/types/models';
import { Edit, Loader2, Save, Share2, Trash2, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface TetheringRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: TetheringRestrictionType;
    onSave: () => void;
    onCancel: () => void;
    hideFooter?: boolean;
    formId?: string;
}

export function TetheringRestriction({ platform, profileId, initialData, onSave, onCancel, hideFooter, formId }: TetheringRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<TetheringRestrictionType>>({
        disableTethering: initialData?.disableTethering ?? true,
        disableWifiTethering: initialData?.disableWifiTethering ?? true,
        devicePolicyType: 'AndroidTetheringRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateTetheringRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createTetheringRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save tethering restriction:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save tethering restriction'), variant: 'destructive' });
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

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setLoading(true);
        try {
            await restrictionAPI.deleteTetheringRestriction(platform, profileId);
            toast({ title: 'Success', description: 'Tethering restriction removed.' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to remove tethering restriction'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Share2 className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.tethering')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.tethering.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableTethering ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Share2 className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('restrictions.tethering.allTethering')}</span>
                        </div>
                        <Badge variant={formData.disableTethering ? 'default' : 'destructive'}>
                            {formData.disableTethering ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableTethering 
                                ? t('restrictions.tethering.allBlockedDesc') 
                                : t('restrictions.tethering.allAllowedDesc')}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableWifiTethering ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.tethering.wifiHotspot')}</span>
                        </div>
                        <Badge variant={formData.disableWifiTethering ? 'default' : 'destructive'}>
                            {formData.disableWifiTethering ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableWifiTethering 
                                ? t('restrictions.tethering.hotspotBlockedDesc') 
                                : t('restrictions.tethering.hotspotAllowedDesc')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between pt-4 border-t">
                {initialData?.id ? (
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" /> Deinitialise
                    </Button>
                ) : <span />}
                {!hideFooter && <Button variant="outline" onClick={onCancel}>{t('common.close')}</Button>}
            </div>
        </div>
    );

    if (!isEditing) {
        return renderView();
    }

    return (
        <form onSubmit={handleSubmit} id={formId} className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.tethering')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.tethering.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Share2 className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.tethering.disableTethering')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.tethering.disableTetheringDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableTethering}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableTethering: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Wifi className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.tethering.disableWifiTethering')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.tethering.disableWifiTetheringDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableWifiTethering}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableWifiTethering: c }))}
                    />
                </div>
            </div>

            <div className="flex justify-between gap-3 pt-6 border-t">
                {initialData?.id ? (
                    <Button variant="destructive" size="sm" type="button" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" /> Deinitialise
                    </Button>
                ) : <span />}
                {!hideFooter && (
                    <div className="flex gap-3">
                        <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2 min-w-[140px]">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('form.saveChanges')}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    );
}
