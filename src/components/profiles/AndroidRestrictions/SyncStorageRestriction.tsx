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
import { Platform, SyncStorageRestriction as SyncStorageRestrictionType, UsbDataAccess } from '@/types/models';
import { Edit, HardDrive, Loader2, Save, Trash2, Usb } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface SyncStorageRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: SyncStorageRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

const USB_DATA_ACCESS_OPTIONS: { value: UsbDataAccess; label: string; desc: string }[] = [
    { value: 'ALLOW_USB_DATA_TRANSFER', label: 'Allow USB Data Transfer', desc: 'Full USB data transfer allowed' },
    { value: 'DISALLOW_USB_FILE_TRANSFER', label: 'Disallow File Transfer', desc: 'USB file transfer blocked, other USB functions allowed' },
    { value: 'DISALLOW_USB_DATA_TRANSFER', label: 'Disallow All USB Data', desc: 'All USB data transfer blocked' },
];

export function SyncStorageRestriction({ platform, profileId, initialData, onSave, onCancel }: SyncStorageRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<SyncStorageRestrictionType>>({
        disableExternalMediaMount: initialData?.disableExternalMediaMount ?? true,
        usbDataAccess: initialData?.usbDataAccess,
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
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save storage restriction'), variant: 'destructive' });
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
            await restrictionAPI.deleteSyncStorageRestriction(platform, profileId);
            toast({ title: 'Success', description: 'Sync/storage restriction removed.' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to remove sync/storage restriction'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getUsbLabel = (v?: UsbDataAccess) => USB_DATA_ACCESS_OPTIONS.find(o => o.value === v)?.label ?? 'Not set';

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

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Usb className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.storage.usbDataAccess')}</span>
                        </div>
                        <Badge variant="secondary">
                            {getUsbLabel(formData.usbDataAccess)}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between pt-4 border-t">
                {initialData?.id ? (
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" /> Deinitialise
                    </Button>
                ) : <span />}
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
                {/* External Media Mount */}
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

                {/* USB Data Access */}
                <div className="space-y-2 py-3">
                    <Label className="flex items-start gap-3">
                        <Usb className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.storage.usbDataAccess')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.storage.usbDataAccessDesc')}
                            </p>
                        </div>
                    </Label>
                    <Select
                        value={formData.usbDataAccess}
                        onValueChange={(v: UsbDataAccess) => setFormData(prev => ({ ...prev, usbDataAccess: v }))}
                    >
                        <SelectTrigger className="ml-8">
                            <SelectValue placeholder={t('restrictions.storage.selectUsbAccess')} />
                        </SelectTrigger>
                        <SelectContent>
                            {USB_DATA_ACCESS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label} — {opt.desc}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-between gap-3 pt-6 border-t">
                {initialData?.id ? (
                    <Button variant="destructive" size="sm" type="button" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" /> Deinitialise
                    </Button>
                ) : <span />}
                <div className="flex gap-3">
                    <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2 min-w-[140px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t('form.saveChanges')}
                    </Button>
                </div>
            </div>
        </form>
    );
}
