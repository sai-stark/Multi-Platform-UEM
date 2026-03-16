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
import { useLanguage } from '@/contexts/LanguageContext';
import { ConnectivityRestriction as ConnectivityRestrictionType, ControlType, Platform } from '@/types/models';
import { Bluetooth, Edit, Loader2, Nfc, Printer, Radio, Save, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface ConnectivityRestrictionProps {
    platform: Platform;
    profileId: string;
    initialData?: ConnectivityRestrictionType;
    onSave: () => void;
    onCancel: () => void;
    hideFooter?: boolean;
    formId?: string;
}

export function ConnectivityRestriction({ platform, profileId, initialData, onSave, onCancel, hideFooter, formId }: ConnectivityRestrictionProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    const [formData, setFormData] = useState<Partial<ConnectivityRestrictionType>>({
        disableOutgoingBeam: initialData?.disableOutgoingBeam ?? true,
        disablePrinting: initialData?.disablePrinting ?? true,
        nfc: initialData?.nfc || 'USER_CONTROLLED',
        bluetooth: initialData?.bluetooth || 'USER_CONTROLLED',
        devicePolicyType: 'AndroidConnectivityRestriction',
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await restrictionAPI.updateConnectivityRestriction(platform, profileId, formData);
            } else {
                await restrictionAPI.createConnectivityRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save connectivity restriction:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save connectivity restriction'), variant: 'destructive' });
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
            await restrictionAPI.deleteConnectivityRestriction(platform, profileId);
            toast({ title: 'Success', description: 'Connectivity restriction removed.' });
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to remove connectivity restriction'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getControlLabel = (control?: ControlType) => {
        switch (control) {
            case 'ENABLE': return t('restrictions.control.alwaysOn');
            case 'DISABLE': return t('restrictions.control.alwaysOff');
            case 'USER_CONTROLLED': return t('restrictions.control.userControlled');
            default: return t('restrictions.control.userControlled');
        }
    };

    const getControlColor = (control?: ControlType) => {
        switch (control) {
            case 'ENABLE': return 'border-l-green-500';
            case 'DISABLE': return 'border-l-red-500';
            default: return 'border-l-blue-500';
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Radio className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('restrictions.android.connectivity')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.android.connectivity.subtitle')}</p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-l-4 ${getControlColor(formData.bluetooth)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bluetooth className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('restrictions.connectivity.bluetooth')}</span>
                        </div>
                        <Badge variant="secondary">{getControlLabel(formData.bluetooth)}</Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${getControlColor(formData.nfc)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Nfc className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{t('restrictions.connectivity.nfc')}</span>
                        </div>
                        <Badge variant="secondary">{getControlLabel(formData.nfc)}</Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disableOutgoingBeam ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Send className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('restrictions.connectivity.outgoingBeam')}</span>
                        </div>
                        <Badge variant={formData.disableOutgoingBeam ? 'default' : 'secondary'}>
                            {formData.disableOutgoingBeam ? t('common.disabled') : t('restrictions.allowed')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${formData.disablePrinting ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Printer className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('restrictions.connectivity.printing')}</span>
                        </div>
                        <Badge variant={formData.disablePrinting ? 'default' : 'secondary'}>
                            {formData.disablePrinting ? t('common.disabled') : t('restrictions.allowed')}
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
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <Edit className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{t('common.edit')} {t('restrictions.android.connectivity')}</h3>
                        <p className="text-sm text-muted-foreground">{t('restrictions.connectivity.editDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-1">
                {/* Bluetooth Control */}
                <div className="space-y-2">
                    <Label>{t('restrictions.connectivity.bluetoothControl')}</Label>
                    <Select
                        value={formData.bluetooth}
                        onValueChange={(value: ControlType) => 
                            setFormData(prev => ({ ...prev, bluetooth: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('restrictions.connectivity.bluetoothControl')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ENABLE">
                                <div className="flex items-center gap-2">
                                    <Bluetooth className="w-4 h-4 text-green-500" />
                                    {t('restrictions.control.alwaysOn')} - {t('restrictions.control.forceEnabled')}
                                </div>
                            </SelectItem>
                            <SelectItem value="DISABLE">
                                <div className="flex items-center gap-2">
                                    <Bluetooth className="w-4 h-4 text-red-500" />
                                    {t('restrictions.control.alwaysOff')} - {t('restrictions.control.forceDisabled')}
                                </div>
                            </SelectItem>
                            <SelectItem value="USER_CONTROLLED">
                                <div className="flex items-center gap-2">
                                    <Bluetooth className="w-4 h-4 text-blue-500" />
                                    {t('restrictions.control.userControlled')} - {t('restrictions.control.letUserDecide')}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* NFC Control */}
                <div className="space-y-2">
                    <Label>{t('restrictions.connectivity.nfcControl')}</Label>
                    <Select
                        value={formData.nfc}
                        onValueChange={(value: ControlType) => 
                            setFormData(prev => ({ ...prev, nfc: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('restrictions.connectivity.nfcControl')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ENABLE">
                                <div className="flex items-center gap-2">
                                    <Nfc className="w-4 h-4 text-green-500" />
                                    {t('restrictions.control.alwaysOn')} - {t('restrictions.control.forceEnabled')}
                                </div>
                            </SelectItem>
                            <SelectItem value="DISABLE">
                                <div className="flex items-center gap-2">
                                    <Nfc className="w-4 h-4 text-red-500" />
                                    {t('restrictions.control.alwaysOff')} - {t('restrictions.control.forceDisabled')}
                                </div>
                            </SelectItem>
                            <SelectItem value="USER_CONTROLLED">
                                <div className="flex items-center gap-2">
                                    <Nfc className="w-4 h-4 text-blue-500" />
                                    {t('restrictions.control.userControlled')} - {t('restrictions.control.letUserDecide')}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Toggle Switches */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                    <div className="flex items-center justify-between py-3 border-b">
                        <Label className="flex items-start gap-3">
                            <Send className="w-5 h-5 mt-0.5 text-purple-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.connectivity.disableOutgoingBeam')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.connectivity.disableOutgoingBeamDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disableOutgoingBeam}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disableOutgoingBeam: c }))}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <Label className="flex items-start gap-3">
                            <Printer className="w-5 h-5 mt-0.5 text-orange-500" />
                            <div>
                                <span className="font-medium">{t('restrictions.connectivity.disablePrinting')}</span>
                                <p className="font-normal text-xs text-muted-foreground">
                                    {t('restrictions.connectivity.disablePrintingDesc')}
                                </p>
                            </div>
                        </Label>
                        <Switch
                            checked={formData.disablePrinting}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, disablePrinting: c }))}
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
