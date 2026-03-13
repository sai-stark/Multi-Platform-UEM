import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DisplayRestriction as DisplayRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, Monitor, Moon, Save, Sun, Timer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface DisplayRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: DisplayRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function DisplayRestriction({ platform, profileId, initialData, onSave, onCancel }: DisplayRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<DisplayRestrictionType>>({
        screenTimeoutSeconds: initialData?.screenTimeoutSeconds ?? 300,
        disableScreenTimeoutSetting: initialData?.disableScreenTimeoutSetting ?? false,
        disableBrightnessSetting: initialData?.disableBrightnessSetting ?? false,
        disableAmbientDisplay: initialData?.disableAmbientDisplay ?? false,
        brightnessPolicy: initialData?.brightnessPolicy || { brightness: 'AdaptiveBrightness' },
        devicePolicyType: 'AndroidDisplayRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateDisplayRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createDisplayRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save display restriction:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save display restriction'), variant: 'destructive' });
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
            await restrictionAPI.deleteDisplayRestriction(platform, profileId);
            toast({ title: 'Success', description: 'Display restriction removed.' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to remove display restriction'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const formatTimeout = (seconds?: number) => {
        if (!seconds || seconds === 0) return t('restrictions.display.never');
        if (seconds < 60) return `${seconds} ${t('restrictions.display.seconds')}`;
        return `${Math.floor(seconds / 60)} ${t('restrictions.display.minutes')}`;
    };

    const isFixedBrightness = formData.brightnessPolicy?.brightness === 'FixedBrightness';

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Monitor className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.display')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.display.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Timer className="w-5 h-5 text-indigo-500" />
                            <span className="font-medium">{t('restrictions.display.screenTimeout')}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{formData.screenTimeoutSeconds || 0}</span>
                            <span className="text-muted-foreground">{t('restrictions.display.seconds')}</span>
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {formatTimeout(formData.screenTimeoutSeconds)}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{t('restrictions.display.brightness')}</span>
                        </div>
                        <Badge variant="secondary">
                            {isFixedBrightness 
                                ? `${t('restrictions.display.fixed')} (${(formData.brightnessPolicy as any)?.brightnessLevel || 50}%)`
                                : t('restrictions.display.adaptive')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableAmbientDisplay ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Moon className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('restrictions.display.ambientDisplay')}</span>
                        </div>
                        <Badge variant={formData.disableAmbientDisplay ? 'default' : 'secondary'}>
                            {formData.disableAmbientDisplay ? t('common.disabled') : t('common.enabled')}
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
                    <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.display')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.display.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* Screen Timeout */}
                <div className="space-y-2">
                    <Label htmlFor="screenTimeoutSeconds">{t('restrictions.display.screenTimeoutLabel')}</Label>
                    <Input
                        id="screenTimeoutSeconds"
                        type="number"
                        min={0}
                        max={3600}
                        value={formData.screenTimeoutSeconds || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, screenTimeoutSeconds: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        {t('restrictions.display.screenTimeoutDesc')} {formatTimeout(formData.screenTimeoutSeconds)}
                    </p>
                </div>

                {/* Brightness Policy */}
                <div className="space-y-2">
                    <Label>{t('restrictions.display.brightnessPolicy')}</Label>
                    <div className="flex gap-2 mb-2">
                        <Button
                            type="button"
                            variant={!isFixedBrightness ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                brightnessPolicy: { brightness: 'AdaptiveBrightness' } 
                            }))}
                        >
                            <Sun className="w-4 h-4 mr-2" />
                            {t('restrictions.display.adaptive')}
                        </Button>
                        <Button
                            type="button"
                            variant={isFixedBrightness ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                brightnessPolicy: { brightness: 'FixedBrightness', brightnessLevel: 50 } 
                            }))}
                        >
                            <Monitor className="w-4 h-4 mr-2" />
                            {t('restrictions.display.fixed')}
                        </Button>
                    </div>
                    {isFixedBrightness && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                            <Label>{t('restrictions.display.brightnessLevel')}: {(formData.brightnessPolicy as any)?.brightnessLevel || 50}%</Label>
                            <Slider
                                value={[(formData.brightnessPolicy as any)?.brightnessLevel || 50]}
                                onValueChange={([value]) => setFormData(prev => ({
                                    ...prev,
                                    brightnessPolicy: { brightness: 'FixedBrightness', brightnessLevel: value }
                                }))}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>
                    )}
                </div>

                {/* Toggle switches */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Timer className="w-5 h-5 mt-0.5 text-indigo-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.display.disableTimeoutSetting')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.display.disableTimeoutSettingDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableScreenTimeoutSetting}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableScreenTimeoutSetting: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Sun className="w-5 h-5 mt-0.5 text-yellow-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.display.disableBrightnessSetting')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.display.disableBrightnessSettingDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableBrightnessSetting}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableBrightnessSetting: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <Label className="flex items-start gap-3">
                            <Moon className="w-5 h-5 mt-0.5 text-purple-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.display.disableAmbientDisplay')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.display.disableAmbientDisplayDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableAmbientDisplay}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableAmbientDisplay: c }))}
                        />
                    </div>
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
