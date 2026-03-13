// ============================================================================
// COMMON SETTINGS POLICY - Work Profile (WP) Mode
// Currently configured for Work Profile mode only.
// WP supports: Disable Screen Capture, Default App Permissions
// DO supports: All fields (uncomment when Device Owner mode is implemented)
// ============================================================================

import { policyAPI } from '@/api/services/Androidpolicies';
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
import { Input } from '@/components/ui/input';
import { AppPermissionType, CommonSettingsPolicy as CommonSettingsPolicyType, DatePeriod, Platform, SystemUpdatePolicy } from '@/types/models';
import { Download, Edit, EyeOff, Loader2, Plus, Save, Settings, Shield, Trash2, X } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// DO-ONLY IMPORTS (Uncomment when Device Owner mode is implemented)
// ============================================================================
// import { Input } from '@/components/ui/input';
// import { Slider } from '@/components/ui/slider';
// import { SystemUpdatePolicy, VolumePolicy } from '@/types/models';
// import { Clock, Download, MapPin, Volume2 } from 'lucide-react';

interface CommonSettingsPolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: CommonSettingsPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function CommonSettingsPolicy({ platform, profileId, initialData, onSave, onCancel }: CommonSettingsPolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    // ========================================================================
    // WP-SUPPORTED FIELDS
    // ========================================================================
    const [formData, setFormData] = useState<Partial<CommonSettingsPolicyType>>({
        // WP-supported fields
        disableScreenCapture: initialData?.disableScreenCapture ?? false,
        defaultAppPerms: initialData?.defaultAppPerms || 'ASKALL',
        
        systemUpdatePolicy: initialData?.systemUpdatePolicy || { systemUpdate: 'DEFAULT' },

        // ------------------------------------------------------------------------
        // DO-ONLY FIELDS (Uncomment when Device Owner mode is implemented)
        // ------------------------------------------------------------------------
        // locationTracking: initialData?.locationTracking ?? true,
        // keepAliveTime: initialData?.keepAliveTime ?? 30,
        // appUpdateSchedule: initialData?.appUpdateSchedule || { from: '02:00', to: '05:00' },
        // volumePolicy: initialData?.volumePolicy || { manageVolume: 'UnmanagedVolume' },
        
        devicePolicyType: 'AndroidCommonSettingsPolicy',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await policyAPI.updateCommonSettingsPolicy(platform, profileId, formData);
            } else {
                await policyAPI.createCommonSettingsPolicy(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save common settings policy:', error);
            toast({
                title: t('common.error'),
                description: getErrorMessage(error, t('policies.commonSettings.saveFailed')),
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

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setLoading(true);
        try {
            await policyAPI.deleteCommonSettingsPolicy(platform, profileId);
            toast({ title: 'Success', description: 'Common settings policy removed.' });
            onSave();
        } catch (error) {
            toast({ title: t('common.error'), description: getErrorMessage(error, 'Failed to remove common settings policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getPermissionLabel = (perm?: AppPermissionType) => {
        switch (perm) {
            case 'GRANTALL': return t('policies.commonSettings.grantAll');
            case 'DENYLOCATION': return t('policies.commonSettings.denyLocation');
            case 'ASKLOCATION': return t('policies.commonSettings.askLocation');
            case 'ASKALL': return t('policies.commonSettings.askAll');
            default: return t('policies.commonSettings.askAll');
        }
    };

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const addFreezePeriod = () => {
        setFormData(prev => ({
            ...prev,
            systemUpdatePolicy: {
                ...prev.systemUpdatePolicy as any,
                freezePeriods: [
                    ...((prev.systemUpdatePolicy as any).freezePeriods || []),
                    { startDate: { day: 1, month: 1 }, endDate: { day: 28, month: 2 } }
                ]
            }
        }));
    };

    const removeFreezePeriod = (idx: number) => {
        setFormData(prev => {
            const periods = [...((prev.systemUpdatePolicy as any).freezePeriods || [])];
            periods.splice(idx, 1);
            return { ...prev, systemUpdatePolicy: { ...prev.systemUpdatePolicy as any, freezePeriods: periods } };
        });
    };

    const updateFreezePeriod = (idx: number, field: 'startDate' | 'endDate', key: 'day' | 'month', value: number) => {
        setFormData(prev => {
            const periods: DatePeriod[] = [...((prev.systemUpdatePolicy as any).freezePeriods || [])];
            periods[idx] = { ...periods[idx], [field]: { ...periods[idx][field], [key]: value } };
            return { ...prev, systemUpdatePolicy: { ...prev.systemUpdatePolicy as any, freezePeriods: periods } };
        });
    };

    const getSystemUpdateLabel = (policy?: SystemUpdatePolicy) => {
        if (!policy) return t('policies.commonSettings.default');
        if (policy.systemUpdate === 'SCHEDULED') {
            return `${t('policies.commonSettings.scheduled')} (${(policy as any).systemUpdateScheduleFrom} - ${(policy as any).systemUpdateScheduleTo})`;
        }
        switch (policy.systemUpdate) {
            case 'IMMEDIATELY': return t('policies.commonSettings.installImmediately');
            case 'POSTPONE': return t('policies.commonSettings.postpone');
            default: return t('policies.commonSettings.default');
        }
    };
    //
    // const getVolumeLabel = (policy?: VolumePolicy) => {
    //     if (!policy) return t('policies.commonSettings.userControlled');
    //     if (policy.manageVolume === 'ManagedVolume') {
    //         return `${t('policies.commonSettings.managed')} (${(policy as any).volume}%)`;
    //     }
    //     return t('policies.commonSettings.userControlled');
    // };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('policies.android.commonSettings')}</h3>
                        <p className="text-sm text-muted-foreground">{t('policies.commonSettings.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            {/* WP-SUPPORTED FIELDS - View Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Disable Screen Capture */}
                <Card className={`border-l-4 ${formData.disableScreenCapture ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <EyeOff className="w-5 h-5 text-indigo-500" />
                            <span className="font-medium">{t('policies.commonSettings.screenCapture')}</span>
                        </div>
                        <Badge variant={formData.disableScreenCapture ? 'destructive' : 'default'}>
                            {formData.disableScreenCapture ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Default App Permissions */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('policies.commonSettings.appPermissions')}</span>
                        </div>
                        <Badge variant="secondary">{getPermissionLabel(formData.defaultAppPerms)}</Badge>
                    </CardContent>
                </Card>
            </div>

            {/* System Update Policy */}
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('policies.commonSettings.systemUpdates')}</span>
                        </div>
                        <Badge variant="secondary">{getSystemUpdateLabel(formData.systemUpdatePolicy)}</Badge>
                        {formData.systemUpdatePolicy?.systemUpdate === 'SCHEDULED' &&
                            ((formData.systemUpdatePolicy as any).freezePeriods as DatePeriod[] | undefined)?.length ? (
                            <div className="mt-3 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">{t('policies.commonSettings.freezePeriods')}</p>
                                {((formData.systemUpdatePolicy as any).freezePeriods as DatePeriod[]).map((p, i) => (
                                    <p key={i} className="text-xs text-muted-foreground">
                                        {p.startDate.day} {MONTH_NAMES[p.startDate.month - 1]} – {p.endDate.day} {MONTH_NAMES[p.endDate.month - 1]}
                                    </p>
                                ))}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

            {/* --------------------------------------------------------------------
                DO-ONLY VIEW CARDS (Uncomment when Device Owner mode is implemented)
            -------------------------------------------------------------------- */}
            {/*
                <Card className={`border-l-4 ${formData.locationTracking ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="font-medium">{t('policies.commonSettings.locationTracking')}</span>
                        </div>
                        <Badge variant={formData.locationTracking ? 'default' : 'secondary'}>
                            {formData.locationTracking ? t('common.enabled') : t('common.disabled')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('policies.commonSettings.keepAliveTime')}</span>
                        </div>
                        <span className="text-lg font-semibold">{formData.keepAliveTime} {t('policies.commonSettings.minutes')}</span>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('policies.commonSettings.systemUpdates')}</span>
                        </div>
                        <Badge variant="secondary">{getSystemUpdateLabel(formData.systemUpdatePolicy)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Volume2 className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">{t('policies.commonSettings.volumePolicy')}</span>
                        </div>
                        <Badge variant="secondary">{getVolumeLabel(formData.volumePolicy)}</Badge>
                    </CardContent>
                </Card>
            */}

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

    // ========================================================================
    // EDIT MODE - WP Fields Only
    // ========================================================================
    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('policies.android.commonSettings')}</h3>
                        <p className="text-sm text-muted-foreground">{t('policies.commonSettings.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* ============================================================
                    WP-SUPPORTED FIELDS
                ============================================================ */}
                
                {/* Disable Screen Capture */}
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <EyeOff className="w-5 h-5 mt-0.5 text-indigo-500" />
                            <div>
                                <span className="font-medium">{t('policies.commonSettings.disableScreenCapture')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('policies.commonSettings.disableScreenCaptureDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableScreenCapture}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableScreenCapture: c }))}
                        />
                    </div>
                </div>

                {/* Default App Permissions */}
                <div className="space-y-2">
                    <Label>{t('policies.commonSettings.defaultAppPerms')}</Label>
                    <Select
                        value={formData.defaultAppPerms}
                        onValueChange={(value: AppPermissionType) => 
                            setFormData(prev => ({ ...prev, defaultAppPerms: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('policies.commonSettings.selectPermission')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GRANTALL">{t('policies.commonSettings.grantAll')} - {t('policies.commonSettings.grantAllDesc')}</SelectItem>
                            <SelectItem value="DENYLOCATION">{t('policies.commonSettings.denyLocation')} - {t('policies.commonSettings.denyLocationDesc')}</SelectItem>
                            <SelectItem value="ASKLOCATION">{t('policies.commonSettings.askLocation')} - {t('policies.commonSettings.askLocationDesc')}</SelectItem>
                            <SelectItem value="ASKALL">{t('policies.commonSettings.askAll')} - {t('policies.commonSettings.askAllDesc')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {t('policies.commonSettings.permissionHandlingDesc')}
                    </p>
                </div>

                {/* System Update Policy */}
                <div className="space-y-2">
                    <Label>{t('policies.commonSettings.systemUpdatePolicy')}</Label>
                    <Select
                        value={formData.systemUpdatePolicy?.systemUpdate || 'DEFAULT'}
                        onValueChange={(value) => {
                            if (value === 'SCHEDULED') {
                                setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        systemUpdate: 'SCHEDULED',
                                        systemUpdateScheduleFrom: '02:00',
                                        systemUpdateScheduleTo: '05:00'
                                    }
                                }));
                            } else {
                                setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: { systemUpdate: value as 'DEFAULT' | 'IMMEDIATELY' | 'POSTPONE' }
                                }));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('policies.commonSettings.selectUpdatePolicy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEFAULT">{t('policies.commonSettings.default')} - {t('policies.commonSettings.followDevice')}</SelectItem>
                            <SelectItem value="IMMEDIATELY">{t('policies.commonSettings.installImmediately')} - {t('policies.commonSettings.installAsap')}</SelectItem>
                            <SelectItem value="POSTPONE">{t('policies.commonSettings.postpone')} - {t('policies.commonSettings.delayUpdates')}</SelectItem>
                            <SelectItem value="SCHEDULED">{t('policies.commonSettings.scheduled')} - {t('policies.commonSettings.installDuringWindow')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.systemUpdatePolicy?.systemUpdate === 'SCHEDULED' && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                        <div className="space-y-2">
                            <Label>{t('policies.commonSettings.updateWindowStart')}</Label>
                            <Input
                                type="time"
                                value={(formData.systemUpdatePolicy as any).systemUpdateScheduleFrom || '02:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        ...prev.systemUpdatePolicy as any,
                                        systemUpdateScheduleFrom: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('policies.commonSettings.updateWindowEnd')}</Label>
                            <Input
                                type="time"
                                value={(formData.systemUpdatePolicy as any).systemUpdateScheduleTo || '05:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        ...prev.systemUpdatePolicy as any,
                                        systemUpdateScheduleTo: e.target.value
                                    }
                                }))}
                            />
                        </div>
                    </div>
                )}

                {formData.systemUpdatePolicy?.systemUpdate === 'SCHEDULED' && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                        <div className="flex items-start justify-between">
                            <div>
                                <Label>{t('policies.commonSettings.freezePeriods')}</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('policies.commonSettings.freezePeriodsDesc')}
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addFreezePeriod}>
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                {t('policies.commonSettings.addFreezePeriod')}
                            </Button>
                        </div>
                        {((formData.systemUpdatePolicy as any).freezePeriods as DatePeriod[] | undefined)?.map((period, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 border rounded-lg bg-muted/30">
                                <div className="space-y-1">
                                    <Label className="text-xs">{t('policies.commonSettings.freezePeriodStart')}</Label>
                                    <div className="flex gap-1.5">
                                        <Input
                                            type="number" min={1} max={31}
                                            placeholder={t('policies.commonSettings.freezePeriodDay')}
                                            value={period.startDate.day}
                                            className="w-16"
                                            onChange={(e) => updateFreezePeriod(idx, 'startDate', 'day', Number(e.target.value))}
                                        />
                                        <Select
                                            value={String(period.startDate.month)}
                                            onValueChange={(v) => updateFreezePeriod(idx, 'startDate', 'month', Number(v))}
                                        >
                                            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {MONTH_NAMES.map((m, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">{t('policies.commonSettings.freezePeriodEnd')}</Label>
                                    <div className="flex gap-1.5">
                                        <Input
                                            type="number" min={1} max={31}
                                            placeholder={t('policies.commonSettings.freezePeriodDay')}
                                            value={period.endDate.day}
                                            className="w-16"
                                            onChange={(e) => updateFreezePeriod(idx, 'endDate', 'day', Number(e.target.value))}
                                        />
                                        <Select
                                            value={String(period.endDate.month)}
                                            onValueChange={(v) => updateFreezePeriod(idx, 'endDate', 'month', Number(v))}
                                        >
                                            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {MONTH_NAMES.map((m, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFreezePeriod(idx)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============================================================
                    DO-ONLY FIELDS (Uncomment when Device Owner mode is implemented)
                ============================================================ */}

                {/* Location Tracking - DO Only */}
                {/*
                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 mt-0.5 text-red-500" />
                            <div>
                                <span className="font-medium">{t('policies.commonSettings.locationTracking')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('policies.commonSettings.locationTrackingDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.locationTracking}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, locationTracking: c }))}
                        />
                    </div>
                </div>
                */}

                {/* Keep Alive Time - DO Only */}
                {/*
                <div className="space-y-2">
                    <Label htmlFor="keepAliveTime">{t('policies.commonSettings.keepAliveTimeMinutes')}</Label>
                    <Input
                        id="keepAliveTime"
                        type="number"
                        min={1}
                        max={1440}
                        value={formData.keepAliveTime || 30}
                        onChange={(e) => setFormData(prev => ({ ...prev, keepAliveTime: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        {t('policies.commonSettings.keepAliveDesc')}
                    </p>
                </div>
                */}

                {/* System Update Policy - DO Only */}
                {/*
                <div className="space-y-2">
                    <Label>{t('policies.commonSettings.systemUpdatePolicy')}</Label>
                    <Select
                        value={formData.systemUpdatePolicy?.systemUpdate || 'DEFAULT'}
                        onValueChange={(value) => {
                            if (value === 'SCHEDULED') {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    systemUpdatePolicy: { 
                                        systemUpdate: 'SCHEDULED',
                                        systemUpdateScheduleFrom: '02:00',
                                        systemUpdateScheduleTo: '05:00'
                                    } 
                                }));
                            } else {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    systemUpdatePolicy: { systemUpdate: value as 'DEFAULT' | 'IMMEDIATELY' | 'POSTPONE' } 
                                }));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('policies.commonSettings.selectUpdatePolicy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEFAULT">{t('policies.commonSettings.default')} - {t('policies.commonSettings.followDevice')}</SelectItem>
                            <SelectItem value="IMMEDIATELY">{t('policies.commonSettings.installImmediately')} - {t('policies.commonSettings.installAsap')}</SelectItem>
                            <SelectItem value="POSTPONE">{t('policies.commonSettings.postpone')} - {t('policies.commonSettings.delayUpdates')}</SelectItem>
                            <SelectItem value="SCHEDULED">{t('policies.commonSettings.scheduled')} - {t('policies.commonSettings.installDuringWindow')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                */}

                {/* Schedule Time Inputs (if SCHEDULED) - DO Only */}
                {/*
                {formData.systemUpdatePolicy?.systemUpdate === 'SCHEDULED' && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                        <div className="space-y-2">
                            <Label>{t('policies.commonSettings.updateWindowStart')}</Label>
                            <Input
                                type="time"
                                value={(formData.systemUpdatePolicy as any).systemUpdateScheduleFrom || '02:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        ...prev.systemUpdatePolicy as any,
                                        systemUpdateScheduleFrom: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('policies.commonSettings.updateWindowEnd')}</Label>
                            <Input
                                type="time"
                                value={(formData.systemUpdatePolicy as any).systemUpdateScheduleTo || '05:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    systemUpdatePolicy: {
                                        ...prev.systemUpdatePolicy as any,
                                        systemUpdateScheduleTo: e.target.value
                                    }
                                }))}
                            />
                        </div>
                    </div>
                )}
                */}

                {/* Volume Policy - DO Only */}
                {/*
                <div className="space-y-2">
                    <Label>{t('policies.commonSettings.volumePolicy')}</Label>
                    <div className="flex gap-2 mb-2">
                        <Button
                            type="button"
                            variant={formData.volumePolicy?.manageVolume === 'UnmanagedVolume' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, volumePolicy: { manageVolume: 'UnmanagedVolume' } }))}
                        >
                            {t('policies.commonSettings.userControlled')}
                        </Button>
                        <Button
                            type="button"
                            variant={formData.volumePolicy?.manageVolume === 'ManagedVolume' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, volumePolicy: { manageVolume: 'ManagedVolume', volume: 50 } }))}
                        >
                            {t('policies.commonSettings.managed')}
                        </Button>
                    </div>
                    {formData.volumePolicy?.manageVolume === 'ManagedVolume' && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                            <Label>{t('policies.commonSettings.volumeLevel')}: {(formData.volumePolicy as any).volume || 50}%</Label>
                            <Slider
                                value={[(formData.volumePolicy as any).volume || 50]}
                                onValueChange={([value]) => setFormData(prev => ({
                                    ...prev,
                                    volumePolicy: { manageVolume: 'ManagedVolume', volume: value }
                                }))}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>
                    )}
                </div>
                */}

                {/* App Update Schedule - DO Only */}
                {/*
                <div className="space-y-2">
                    <Label>{t('policies.commonSettings.appUpdateSchedule')}</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t('common.from')}</Label>
                            <Input
                                type="time"
                                value={formData.appUpdateSchedule?.from || '02:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    appUpdateSchedule: { ...prev.appUpdateSchedule!, from: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t('common.to')}</Label>
                            <Input
                                type="time"
                                value={formData.appUpdateSchedule?.to || '05:00'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    appUpdateSchedule: { ...prev.appUpdateSchedule!, to: e.target.value }
                                }))}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('policies.commonSettings.appUpdateScheduleDesc')}
                    </p>
                </div>
                */}
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
