import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Platform, SyncStorageRestriction as SyncStorageRestrictionType } from '@/types/models';
import { Edit, HardDrive, Loader2, Save, Usb } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SyncStorageRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: SyncStorageRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function SyncStorageRestriction({ platform, profileId, initialData, onSave, onCancel }: SyncStorageRestrictionProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<SyncStorageRestrictionType>>({
        disableExternalMediaMount: initialData?.disableExternalMediaMount ?? true,
        disableUsbTransfer: initialData?.disableUsbTransfer ?? true,
        devicePolicyType: 'AndroidSyncStorageRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateSyncStorageRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createSyncStorageRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save storage restriction:', error);
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
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <HardDrive className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.storage')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.storage.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableExternalMediaMount ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <HardDrive className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('restrictions.storage.externalMedia')}</span>
                        </div>
                        <Badge variant={formData.disableExternalMediaMount ? 'default' : 'destructive'}>
                            {formData.disableExternalMediaMount ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableExternalMediaMount 
                                ? t('restrictions.storage.externalBlockedDesc') 
                                : t('restrictions.storage.externalAllowedDesc')}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableUsbTransfer ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Usb className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.storage.usbTransfer')}</span>
                        </div>
                        <Badge variant={formData.disableUsbTransfer ? 'default' : 'destructive'}>
                            {formData.disableUsbTransfer ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableUsbTransfer 
                                ? t('restrictions.storage.usbBlockedDesc') 
                                : t('restrictions.storage.usbAllowedDesc')}
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
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.storage')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.storage.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <HardDrive className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.storage.disableExternalMedia')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.storage.disableExternalMediaDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableExternalMediaMount}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableExternalMediaMount: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Usb className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.storage.disableUsbTransfer')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.storage.disableUsbTransferDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableUsbTransfer}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableUsbTransfer: c }))}
                    />
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
