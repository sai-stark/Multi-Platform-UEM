import { restrictionAPI } from '@/api/services/Androidrestrictions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneRestriction as PhoneRestrictionType, Platform } from '@/types/models';
import { Edit, Loader2, MessageSquare, Phone, PhoneOff, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface PhoneRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: PhoneRestrictionType;
    onSave: () => void;
    onCancel: () => void;
    hideFooter?: boolean;
    formId?: string;
}

export function PhoneRestriction({ platform, profileId, initialData, onSave, onCancel, hideFooter, formId }: PhoneRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<PhoneRestrictionType>>({
        disableSms: initialData?.disableSms ?? false,
        disableCalls: initialData?.disableCalls ?? false,
        devicePolicyType: 'AndroidPhoneRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updatePhoneRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createPhoneRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save phone restriction:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save phone restriction'), variant: 'destructive' });
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
            await restrictionAPI.deletePhoneRestriction(platform, profileId);
            toast({ title: 'Success', description: 'Phone restriction removed.' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to remove phone restriction'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <Phone className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.phone')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.phone.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${formData.disableCalls ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {formData.disableCalls 
                                ? <PhoneOff className="w-5 h-5 text-red-500" />
                                : <Phone className="w-5 h-5 text-green-500" />
                            }
                            <span className="font-medium">{t('restrictions.phone.calls')}</span>
                        </div>
                        <Badge variant={formData.disableCalls ? 'destructive' : 'default'}>
                            {formData.disableCalls ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableCalls 
                                ? t('restrictions.phone.callsDisabledDesc') 
                                : t('restrictions.phone.callsAllowedDesc')}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableSms ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.phone.sms')}</span>
                        </div>
                        <Badge variant={formData.disableSms ? 'destructive' : 'default'}>
                            {formData.disableSms ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.disableSms 
                                ? t('restrictions.phone.smsDisabledDesc') 
                                : t('restrictions.phone.smsAllowedDesc')}
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
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.phone')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.phone.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between py-3 border-b">
                    <Label className="flex items-start gap-3">
                        <PhoneOff className="w-5 h-5 mt-0.5 text-red-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.phone.disableCalls')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.phone.disableCallsDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableCalls}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableCalls: c }))}
                    />
                </div>

                <div className="flex items-center justify-between py-3">
                    <Label className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                            <span className="font-medium">{t('restrictions.phone.disableSms')}</span>
                            <p className="font-normal text-xs text-muted-foreground">
                                {t('restrictions.phone.disableSmsDesc')}
                            </p>
                        </div>
                    </Label>
                    <Switch
                        checked={formData.disableSms}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableSms: c }))}
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
