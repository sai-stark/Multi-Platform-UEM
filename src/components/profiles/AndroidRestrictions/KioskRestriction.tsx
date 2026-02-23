import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    BatteryPluggedMode,
    KioskRestriction as KioskRestrictionType,
    Platform,
    StatusBarRestrictionEnum,
    SystemNavigationRestriction,
} from '@/types/models';
import { Battery, Edit, Loader2, Monitor, Navigation, Power, Save, Settings, Shield, Square } from 'lucide-react';
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

const NAVIGATION_OPTIONS: { value: SystemNavigationRestriction; label: string; desc: string }[] = [
    { value: 'NAVIGATION_ENABLED', label: 'Navigation Enabled', desc: 'All navigation buttons visible' },
    { value: 'NAVIGATION_DISABLED', label: 'Navigation Disabled', desc: 'All navigation buttons hidden' },
    { value: 'HOME_BUTTON_ONLY', label: 'Home Button Only', desc: 'Only home button is visible' },
];

const STATUS_BAR_OPTIONS: { value: StatusBarRestrictionEnum; label: string; desc: string }[] = [
    { value: 'NOTIFICATIONS_AND_SYSTEM_INFO_ENABLED', label: 'Notifications & System Info', desc: 'Full status bar access' },
    { value: 'NOTIFICATIONS_AND_SYSTEM_INFO_DISABLED', label: 'Disabled', desc: 'Status bar fully hidden' },
    { value: 'SYSTEM_INFO_ONLY', label: 'System Info Only', desc: 'Notifications hidden, info visible' },
];

const PLUGGED_MODES: { value: BatteryPluggedMode; label: string }[] = [
    { value: 'AC', label: 'AC Power' },
    { value: 'USB', label: 'USB' },
    { value: 'WIRELESS', label: 'Wireless' },
];

export function KioskRestriction({ platform, profileId, initialData, onSave, onCancel }: KioskRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<KioskRestrictionType>>({
        navigation: initialData?.navigation,
        statusBar: initialData?.statusBar,
        denyDeviceSettingsAccess: initialData?.denyDeviceSettingsAccess ?? false,
        enableSystemWarnings: initialData?.enableSystemWarnings ?? true,
        disableLockScreen: initialData?.disableLockScreen ?? true,
        createWindowsDisabled: initialData?.createWindowsDisabled ?? true,
        skipFirstUseHintsEnabled: initialData?.skipFirstUseHintsEnabled ?? true,
        stayOnPlugged: initialData?.stayOnPlugged ?? [],
        lockPowerButton: initialData?.lockPowerButton ?? true,
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

    const togglePluggedMode = (mode: BatteryPluggedMode) => {
        setFormData(prev => {
            const current = prev.stayOnPlugged ?? [];
            const updated = current.includes(mode)
                ? current.filter(m => m !== mode)
                : [...current, mode];
            return { ...prev, stayOnPlugged: updated };
        });
    };

    const getNavLabel = (v?: SystemNavigationRestriction) => NAVIGATION_OPTIONS.find(o => o.value === v)?.label ?? 'Not set';
    const getStatusBarLabel = (v?: StatusBarRestrictionEnum) => STATUS_BAR_OPTIONS.find(o => o.value === v)?.label ?? 'Not set';

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
                {/* Navigation */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Navigation className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.kiosk.navigation')}</span>
                        </div>
                        <Badge variant="secondary">{getNavLabel(formData.navigation)}</Badge>
                    </CardContent>
                </Card>

                {/* Status Bar */}
                <Card className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Monitor className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">{t('restrictions.kiosk.statusBarControl')}</span>
                        </div>
                        <Badge variant="secondary">{getStatusBarLabel(formData.statusBar)}</Badge>
                    </CardContent>
                </Card>

                {/* Deny Device Settings */}
                <Card className={`border-l-4 ${formData.denyDeviceSettingsAccess ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('restrictions.kiosk.deviceSettings')}</span>
                        </div>
                        <Badge variant={formData.denyDeviceSettingsAccess ? 'destructive' : 'default'}>
                            {formData.denyDeviceSettingsAccess ? t('restrictions.blocked') : t('restrictions.allowed')}
                        </Badge>
                    </CardContent>
                </Card>

                {/* System Warnings */}
                <Card className={`border-l-4 ${formData.enableSystemWarnings ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{t('restrictions.kiosk.systemWarnings')}</span>
                        </div>
                        <Badge variant={formData.enableSystemWarnings ? 'default' : 'secondary'}>
                            {formData.enableSystemWarnings ? t('common.enabled') : t('common.disabled')}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Lock Screen */}
                <Card className={`border-l-4 ${formData.disableLockScreen ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{t('restrictions.kiosk.lockScreen')}</span>
                        </div>
                        <Badge variant={formData.disableLockScreen ? 'destructive' : 'default'}>
                            {formData.disableLockScreen ? t('common.disabled') : t('common.enabled')}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Power Button */}
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

                {/* Stay On Plugged */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Battery className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('restrictions.kiosk.stayOnPlugged')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {(formData.stayOnPlugged ?? []).length > 0
                                ? (formData.stayOnPlugged ?? []).map(m => (
                                    <Badge key={m} variant="secondary">{m}</Badge>
                                ))
                                : <Badge variant="outline">{t('restrictions.kiosk.none')}</Badge>
                            }
                        </div>
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
                {/* Navigation */}
                <div className="space-y-2 pb-3 border-b">
                    <Label className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{t('restrictions.kiosk.navigation')}</span>
                    </Label>
                    <Select
                        value={formData.navigation}
                        onValueChange={(v: SystemNavigationRestriction) => setFormData(prev => ({ ...prev, navigation: v }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('restrictions.kiosk.selectNavigation')} />
                        </SelectTrigger>
                        <SelectContent>
                            {NAVIGATION_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label} — {opt.desc}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Bar */}
                <div className="space-y-2 pb-3 border-b">
                    <Label className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-cyan-500" />
                        <span className="font-medium">{t('restrictions.kiosk.statusBarControl')}</span>
                    </Label>
                    <Select
                        value={formData.statusBar}
                        onValueChange={(v: StatusBarRestrictionEnum) => setFormData(prev => ({ ...prev, statusBar: v }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('restrictions.kiosk.selectStatusBar')} />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_BAR_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label} — {opt.desc}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Deny Device Settings Access */}
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Settings className="w-5 h-5 mt-0.5 text-orange-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.denyDeviceSettings')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.denyDeviceSettingsDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.denyDeviceSettingsAccess}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, denyDeviceSettingsAccess: c }))}
                    />
                </div>

                {/* Enable System Warnings */}
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Shield className="w-5 h-5 mt-0.5 text-yellow-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.enableSystemWarnings')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.enableSystemWarningsDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.enableSystemWarnings}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableSystemWarnings: c }))}
                    />
                </div>

                {/* Disable Lock Screen */}
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Shield className="w-5 h-5 mt-0.5 text-green-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.disableLockScreen')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.disableLockScreenDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableLockScreen}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableLockScreen: c }))}
                    />
                </div>

                {/* Create Windows Disabled */}
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Monitor className="w-5 h-5 mt-0.5 text-indigo-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.createWindowsDisabled')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.createWindowsDisabledDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.createWindowsDisabled}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, createWindowsDisabled: c }))}
                    />
                </div>

                {/* Skip First Use Hints */}
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <Shield className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.skipFirstUseHints')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.skipFirstUseHintsDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.skipFirstUseHintsEnabled}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, skipFirstUseHintsEnabled: c }))}
                    />
                </div>

                {/* Lock Power Button */}
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

                {/* Stay On Plugged */}
                <div className="py-3">
                    <Label className="flex items-start gap-3 mb-3">
                        <Battery className="w-5 h-5 mt-0.5 text-purple-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.kiosk.stayOnPlugged')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.kiosk.stayOnPluggedDesc')}
                            </p>
                        </div>
                    </Label>
                    <div className="flex flex-wrap gap-4 pl-8">
                        {PLUGGED_MODES.map(mode => (
                            <label key={mode.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox
                                    checked={(formData.stayOnPlugged ?? []).includes(mode.value)}
                                    onCheckedChange={() => togglePluggedMode(mode.value)}
                                />
                                {mode.label}
                            </label>
                        ))}
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
