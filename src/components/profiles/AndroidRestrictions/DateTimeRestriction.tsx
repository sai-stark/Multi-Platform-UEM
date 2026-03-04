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
import { DateTimeRestriction as DateTimeRestrictionType, Platform } from '@/types/models';
import { Clock, Edit, Globe, Loader2, Save, Settings } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

// Curated timezone list sorted by UTC offset with friendly names
const TIMEZONE_LIST = [
    { value: 'Pacific/Midway', label: 'Samoa Standard Time / SST', offset: 'UTC −11:00' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Standard Time / HST', offset: 'UTC −10:00' },
    { value: 'America/Anchorage', label: 'Alaska Standard Time / AKST', offset: 'UTC −09:00' },
    { value: 'America/Los_Angeles', label: 'Pacific Standard Time / PST', offset: 'UTC −08:00' },
    { value: 'America/Denver', label: 'Mountain Standard Time / MST', offset: 'UTC −07:00' },
    { value: 'America/Chicago', label: 'Central Standard Time / CST', offset: 'UTC −06:00' },
    { value: 'America/New_York', label: 'Eastern Standard Time / EST', offset: 'UTC −05:00' },
    { value: 'America/Caracas', label: 'Venezuelan Standard Time / VET', offset: 'UTC −04:30' },
    { value: 'America/Halifax', label: 'Atlantic Standard Time / AST', offset: 'UTC −04:00' },
    { value: 'America/St_Johns', label: 'Newfoundland Standard Time / NST', offset: 'UTC −03:30' },
    { value: 'America/Sao_Paulo', label: 'Brasília Standard Time / BRT', offset: 'UTC −03:00' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time / ART', offset: 'UTC −03:00' },
    { value: 'Atlantic/South_Georgia', label: 'South Georgia Time / GST', offset: 'UTC −02:00' },
    { value: 'Atlantic/Azores', label: 'Azores Standard Time / AZOT', offset: 'UTC −01:00' },
    { value: 'UTC', label: 'Coordinated Universal Time / UTC', offset: 'UTC +00:00' },
    { value: 'Europe/London', label: 'Greenwich Mean Time / GMT', offset: 'UTC +00:00' },
    { value: 'Europe/Paris', label: 'Central European Time / CET', offset: 'UTC +01:00' },
    { value: 'Europe/Berlin', label: 'Central European Time / CET', offset: 'UTC +01:00' },
    { value: 'Africa/Lagos', label: 'West Africa Time / WAT', offset: 'UTC +01:00' },
    { value: 'Europe/Athens', label: 'Eastern European Time / EET', offset: 'UTC +02:00' },
    { value: 'Africa/Cairo', label: 'Eastern European Time / EET', offset: 'UTC +02:00' },
    { value: 'Africa/Johannesburg', label: 'South Africa Standard Time / SAST', offset: 'UTC +02:00' },
    { value: 'Europe/Istanbul', label: 'Turkey Time / TRT', offset: 'UTC +03:00' },
    { value: 'Europe/Moscow', label: 'Moscow Standard Time / MSK', offset: 'UTC +03:00' },
    { value: 'Africa/Nairobi', label: 'East Africa Time / EAT', offset: 'UTC +03:00' },
    { value: 'Asia/Riyadh', label: 'Arabia Standard Time / AST', offset: 'UTC +03:00' },
    { value: 'Asia/Tehran', label: 'Iran Standard Time / IRST', offset: 'UTC +03:30' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time / GST', offset: 'UTC +04:00' },
    { value: 'Asia/Kabul', label: 'Afghanistan Time / AFT', offset: 'UTC +04:30' },
    { value: 'Asia/Karachi', label: 'Pakistan Standard Time / PKT', offset: 'UTC +05:00' },
    { value: 'Asia/Tashkent', label: 'Uzbekistan Time / UZT', offset: 'UTC +05:00' },
    { value: 'Asia/Kolkata', label: 'Indian Standard Time / IST', offset: 'UTC +05:30' },
    { value: 'Asia/Colombo', label: 'Sri Lanka Standard Time / SLST', offset: 'UTC +05:30' },
    { value: 'Asia/Kathmandu', label: 'Nepal Time / NPT', offset: 'UTC +05:45' },
    { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time / BST', offset: 'UTC +06:00' },
    { value: 'Asia/Almaty', label: 'East Kazakhstan Time / ALMT', offset: 'UTC +06:00' },
    { value: 'Asia/Yangon', label: 'Myanmar Time / MMT', offset: 'UTC +06:30' },
    { value: 'Asia/Bangkok', label: 'Indochina Time / ICT', offset: 'UTC +07:00' },
    { value: 'Asia/Jakarta', label: 'Western Indonesian Time / WIB', offset: 'UTC +07:00' },
    { value: 'Asia/Shanghai', label: 'China Standard Time / CST', offset: 'UTC +08:00' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time / HKT', offset: 'UTC +08:00' },
    { value: 'Asia/Singapore', label: 'Singapore Standard Time / SGT', offset: 'UTC +08:00' },
    { value: 'Asia/Kuala_Lumpur', label: 'Malaysia Time / MYT', offset: 'UTC +08:00' },
    { value: 'Asia/Taipei', label: 'Taipei Standard Time / CST', offset: 'UTC +08:00' },
    { value: 'Australia/Perth', label: 'Australian Western Standard Time / AWST', offset: 'UTC +08:00' },
    { value: 'Asia/Manila', label: 'Philippine Standard Time / PST', offset: 'UTC +08:00' },
    { value: 'Asia/Seoul', label: 'Korean Standard Time / KST', offset: 'UTC +09:00' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time / JST', offset: 'UTC +09:00' },
    { value: 'Australia/Adelaide', label: 'Australian Central Standard Time / ACST', offset: 'UTC +09:30' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Standard Time / AEST', offset: 'UTC +10:00' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Standard Time / AEST', offset: 'UTC +10:00' },
    { value: 'Pacific/Guam', label: 'Chamorro Standard Time / ChST', offset: 'UTC +10:00' },
    { value: 'Pacific/Noumea', label: 'New Caledonia Time / NCT', offset: 'UTC +11:00' },
    { value: 'Pacific/Auckland', label: 'New Zealand Standard Time / NZST', offset: 'UTC +12:00' },
    { value: 'Pacific/Fiji', label: 'Fiji Standard Time / FJT', offset: 'UTC +12:00' },
    { value: 'Pacific/Tongatapu', label: 'Tonga Standard Time / TOT', offset: 'UTC +13:00' },
];

interface DateTimeRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: DateTimeRestrictionType;
    onSave: () => void;
    onCancel: () => void;
}

export function DateTimeRestriction({ platform, profileId, initialData, onSave, onCancel }: DateTimeRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
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
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save date/time restriction'), variant: 'destructive' });
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
            return `${t('restrictions.dateTime.manual')}${timezone ? ` (${timezone})` : ''}`;
        }
        return t('restrictions.dateTime.networkProvided');
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-full">
                        <Clock className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.dateTime')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.dateTime.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-cyan-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">{t('restrictions.dateTime.source')}</span>
                        </div>
                        <Badge variant="secondary">{getDateTimeLabel()}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {isManualDateTime 
                                ? t('restrictions.dateTime.manualDesc') 
                                : t('restrictions.dateTime.networkDesc')}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableDateTimeSetting ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.dateTime.settingsAccess')}</span>
                        </div>
                        <Badge variant={formData.disableDateTimeSetting ? 'default' : 'secondary'}>
                            {formData.disableDateTimeSetting ? t('restrictions.locked') : t('restrictions.dateTime.userAccessible')}
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
                    <div className="p-2 bg-cyan-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.dateTime')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.dateTime.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                <div className="space-y-2">
                    <Label>{t('restrictions.dateTime.policy')}</Label>
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
                            <SelectValue placeholder={t('restrictions.dateTime.policy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NetworkProvidedDateTime">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    {t('restrictions.dateTime.networkProvided')} - {t('restrictions.dateTime.syncFromNetwork')}
                                </div>
                            </SelectItem>
                            <SelectItem value="ManualDateTime">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cyan-500" />
                                    {t('restrictions.dateTime.manual')} - {t('restrictions.dateTime.setTimezoneManually')}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isManualDateTime && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                        <Label>{t('restrictions.dateTime.timezone')}</Label>
                        <Select
                            value={(formData.dateTimePolicy as any)?.timezone || ''}
                            onValueChange={(value) => setFormData(prev => ({
                                ...prev,
                                dateTimePolicy: {
                                    dateTimeSetting: 'ManualDateTime',
                                    timezone: value
                                }
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONE_LIST.map((tz) => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                        <span className="flex items-center justify-between gap-3 w-full">
                                            <span>{tz.label}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{tz.offset}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {t('restrictions.dateTime.timezoneDesc')}
                        </p>
                    </div>
                )}

                <div className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-start gap-3">
                            <Settings className="w-5 h-5 mt-0.5 text-blue-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.dateTime.disableSetting')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.dateTime.disableSettingDesc')}
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
