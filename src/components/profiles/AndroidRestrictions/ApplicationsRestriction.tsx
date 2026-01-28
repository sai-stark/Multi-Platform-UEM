import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ApplicationsRestriction as ApplicationsRestrictionType, Platform } from '@/types/models';
import { AppWindow, Download, Edit, Loader2, Save, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApplicationsRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: ApplicationsRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function ApplicationsRestriction({ platform, profileId, initialData, onSave, onCancel }: ApplicationsRestrictionProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<ApplicationsRestrictionType>>({
        disableAppInstall: initialData?.disableAppInstall ?? true,
        disableAppUninstall: initialData?.disableAppUninstall ?? true,
        disableAppControl: initialData?.disableAppControl ?? true,
        devicePolicyType: 'AndroidApplicationsRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateApplicationsRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createApplicationsRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save applications restriction:', error);
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
                        <AppWindow className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.applications')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.apps.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`border-l-4 ${formData.disableAppInstall ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.apps.install')}</span>
                        </div>
                        <Badge variant={formData.disableAppInstall ? 'default' : 'secondary'}>
                            {formData.disableAppInstall ? t('restrictions.blocked') : t('restrictions.allowed')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableAppUninstall ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <span className="font-medium">{t('restrictions.apps.uninstall')}</span>
                        </div>
                        <Badge variant={formData.disableAppUninstall ? 'default' : 'secondary'}>
                            {formData.disableAppUninstall ? t('restrictions.blocked') : t('restrictions.allowed')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableAppControl ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('restrictions.apps.control')}</span>
                        </div>
                        <Badge variant={formData.disableAppControl ? 'default' : 'secondary'}>
                            {formData.disableAppControl ? t('restrictions.blocked') : t('restrictions.allowed')}
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
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.applications')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.apps.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Download className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.apps.disableInstall')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.apps.disableInstallDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableAppInstall}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAppInstall: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Trash2 className="w-5 h-5 mt-0.5 text-red-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.apps.disableUninstall')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.apps.disableUninstallDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableAppUninstall}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAppUninstall: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <Settings className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.apps.disableControl')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.apps.disableControlDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableAppControl}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAppControl: c }))}
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
