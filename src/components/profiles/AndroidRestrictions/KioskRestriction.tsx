import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { KioskRestriction as KioskRestrictionType, Platform } from '@/types/models';
import { Bell, Edit, Home, Lock, Loader2, Power, Rows, Save, Square } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface KioskRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: KioskRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function KioskRestriction({ platform, profileId, initialData, onSave, onCancel }: KioskRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<KioskRestrictionType>>({
        enableHomeButton: initialData?.enableHomeButton ?? false,
        enableRecentsButton: initialData?.enableRecentsButton ?? false,
        enableNotifications: initialData?.enableNotifications ?? false,
        enableStatusBar: initialData?.enableStatusBar ?? false,
        enableScreenLock: initialData?.enableScreenLock ?? false,
        lockPowerButton: initialData?.lockPowerButton ?? true,
        exitKioskButton: initialData?.exitKioskButton ?? false,
        devicePolicyType: 'AndroidKioskRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateKioskRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createKioskRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save kiosk restriction:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save kiosk restriction'), variant: 'destructive' });
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
                        <Square className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.kiosk')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.kiosk.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={`border-l-4 ${formData.enableHomeButton ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Home className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.kiosk.homeButton')}</span>
                        </div>
                        <Badge variant={formData.enableHomeButton ? 'default' : 'secondary'}>
                            {formData.enableHomeButton ? t('common.enabled') : t('restrictions.kiosk.hidden')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableRecentsButton ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Rows className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('restrictions.kiosk.recentsButton')}</span>
                        </div>
                        <Badge variant={formData.enableRecentsButton ? 'default' : 'secondary'}>
                            {formData.enableRecentsButton ? t('common.enabled') : t('restrictions.kiosk.hidden')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableNotifications ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{t('restrictions.kiosk.notifications')}</span>
                        </div>
                        <Badge variant={formData.enableNotifications ? 'default' : 'secondary'}>
                            {formData.enableNotifications ? t('restrictions.kiosk.shown') : t('restrictions.kiosk.hidden')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableStatusBar ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Rows className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">{t('restrictions.kiosk.statusBar')}</span>
                        </div>
                        <Badge variant={formData.enableStatusBar ? 'default' : 'secondary'}>
                            {formData.enableStatusBar ? t('restrictions.kiosk.visible') : t('restrictions.kiosk.hidden')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.enableScreenLock ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{t('restrictions.kiosk.screenLock')}</span>
                        </div>
                        <Badge variant={formData.enableScreenLock ? 'default' : 'secondary'}>
                            {formData.enableScreenLock ? t('common.enabled') : t('common.disabled')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.lockPowerButton ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Power className="w-5 h-5 text-red-500" />
                            <span className="font-medium">{t('restrictions.kiosk.powerButton')}</span>
                        </div>
                        <Badge variant={formData.lockPowerButton ? 'secondary' : 'default'}>
                            {formData.lockPowerButton ? t('restrictions.locked') : t('restrictions.unlocked')}
                        </Badge>
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
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.kiosk')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.kiosk.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Home className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.enableHomeButton')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.enableHomeButtonDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableHomeButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableHomeButton: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Rows className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.enableRecentsButton')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.enableRecentsButtonDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableRecentsButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableRecentsButton: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Bell className="w-5 h-5 mt-0.5 text-yellow-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.enableNotifications')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.enableNotificationsDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableNotifications}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableNotifications: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Rows className="w-5 h-5 mt-0.5 text-cyan-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.enableStatusBar')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.enableStatusBarDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableStatusBar}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableStatusBar: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Lock className="w-5 h-5 mt-0.5 text-green-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.enableScreenLock')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.enableScreenLockDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableScreenLock}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableScreenLock: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Power className="w-5 h-5 mt-0.5 text-red-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.lockPowerButton')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.lockPowerButtonDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.lockPowerButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, lockPowerButton: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Square className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.exitKioskButton')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.exitKioskButtonDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.exitKioskButton}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, exitKioskButton: c }))}
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
