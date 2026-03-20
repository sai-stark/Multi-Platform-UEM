import { policyAPI } from '@/api/services/Androidpolicies';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DeviceThemePolicy as DeviceThemePolicyType, IconSize, Platform, ScreenOrientation } from '@/types/models';
import { Edit, Image, Loader2, Maximize, Palette, Save, Trash2, Type } from 'lucide-react';
import { useState , useEffect } from 'react';
import { useBaseDialogContext } from '@/components/common/BaseDialogContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

interface DeviceThemePolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: DeviceThemePolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function DeviceThemePolicy({ platform, profileId, initialData, onSave, onCancel }: DeviceThemePolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { registerSave, setLoading: setContextLoading, setSaveDisabled } = useBaseDialogContext();
    const [loading, setLoadingState] = useState(false);

    const setLoading = (val: boolean) => { setLoadingState(val); setContextLoading(val); };
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [useBackgroundImage, setUseBackgroundImage] = useState(!!initialData?.backgroundImage);

    const [formData, setFormData] = useState<Partial<DeviceThemePolicyType>>({
        appNamesColor: initialData?.appNamesColor || '#ffffff',
        iconSize: initialData?.iconSize || 'MEDIUM',
        screenOrientation: initialData?.screenOrientation || 'NONE',
        backgroundColor: initialData?.backgroundColor || '#1a1a2e',
        backgroundImage: initialData?.backgroundImage || '',
        screenSignature: initialData?.screenSignature || '',
        devicePolicyType: 'AndroidDeviceThemePolicy',
        ...initialData
    });

    useEffect(() => { registerSave(handleSubmit); }, []);
    useEffect(() => { setSaveDisabled(!isEditing); }, [isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            // Only include one of backgroundColor or backgroundImage
            if (useBackgroundImage) {
                delete payload.backgroundColor;
            } else {
                delete payload.backgroundImage;
            }
            
            if (initialData?.id) {
                await policyAPI.updateDeviceThemePolicy(platform, profileId, payload);
            } else {
                await policyAPI.createDeviceThemePolicy(platform, profileId, payload);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save device theme policy:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save device theme policy'), variant: 'destructive' });
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
            await policyAPI.deleteDeviceThemePolicy(platform, profileId);
            toast({ title: 'Success', description: 'Device theme policy removed.' });
            onSave();
        } catch (error) {
            toast({ title: t('common.error'), description: getErrorMessage(error, 'Failed to remove device theme policy'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getIconSizeLabel = (size?: IconSize) => {
        switch (size) {
            case 'SMALL': return t('deviceTheme.iconSize.small');
            case 'MEDIUM': return t('deviceTheme.iconSize.medium');
            case 'LARGE': return t('deviceTheme.iconSize.large');
            default: return t('deviceTheme.iconSize.medium');
        }
    };

    const getOrientationLabel = (orientation?: ScreenOrientation) => {
        switch (orientation) {
            case 'PORTRAIT': return t('deviceTheme.screenOrientation.portrait');
            case 'LANDSCAPE': return t('deviceTheme.screenOrientation.landscape');
            case 'NONE': return t('deviceTheme.screenOrientation.auto');
            default: return t('deviceTheme.screenOrientation.auto');
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-end gap-2 pb-4 border-b">
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('deviceTheme.editTheme')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Type className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('deviceTheme.appNamesColor')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: formData.appNamesColor }}
                            />
                            <span className="font-mono text-sm">{formData.appNamesColor || t('deviceTheme.notSet')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Maximize className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('deviceTheme.iconSize')}</span>
                        </div>
                        <Badge variant="secondary">{getIconSizeLabel(formData.iconSize)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Maximize className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{t('deviceTheme.screenOrientation')}</span>
                        </div>
                        <Badge variant="secondary">{getOrientationLabel(formData.screenOrientation)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Image className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">{t('deviceTheme.background')}</span>
                        </div>
                        {formData.backgroundImage ? (
                            <span className="text-sm truncate">{formData.backgroundImage}</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-6 h-6 rounded border"
                                    style={{ backgroundColor: formData.backgroundColor }}
                                />
                                <span className="font-mono text-sm">{formData.backgroundColor || t('deviceTheme.notSet')}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {formData.screenSignature && (
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Type className="w-5 h-5 text-cyan-500" />
                                <span className="font-medium">{t('deviceTheme.screenSignature')}</span>
                            </div>
                            <span className="text-sm">{formData.screenSignature}</span>
                        </CardContent>
                    </Card>
                )}
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-end gap-2 pb-4 border-b">
            </div>

            <div className="space-y-6 p-1">
                {/* App Names Color */}
                <div className="space-y-2">
                    <Label htmlFor="appNamesColor">{t('deviceTheme.appNamesColor')}</Label>
                    <div className="flex gap-2">
                        <Input
                            id="appNamesColor"
                            type="color"
                            value={formData.appNamesColor || '#ffffff'}
                            onChange={(e) => setFormData(prev => ({ ...prev, appNamesColor: e.target.value }))}
                            className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            value={formData.appNamesColor || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, appNamesColor: e.target.value }))}
                            placeholder="#ffffff"
                            pattern="^#[0-9a-fA-F]{6}$"
                            className="flex-1"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('deviceTheme.appNamesColor.desc')}
                    </p>
                </div>

                {/* Icon Size */}
                <div className="space-y-2">
                    <Label>{t('deviceTheme.iconSize')}</Label>
                    <Select
                        value={formData.iconSize}
                        onValueChange={(value: IconSize) => 
                            setFormData(prev => ({ ...prev, iconSize: value }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('deviceTheme.iconSize')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SMALL">{t('deviceTheme.iconSize.small')}</SelectItem>
                            <SelectItem value="MEDIUM">{t('deviceTheme.iconSize.medium')}</SelectItem>
                            <SelectItem value="LARGE">{t('deviceTheme.iconSize.large')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {t('deviceTheme.iconSize.desc')}
                    </p>
                </div>

                {/* Screen Orientation */}
                <div className="space-y-2">
                    <Label>{t('deviceTheme.screenOrientation')}</Label>
                    <Select
                        value={formData.screenOrientation}
                        onValueChange={(value: ScreenOrientation) => 
                            setFormData(prev => ({ ...prev, screenOrientation: value }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('deviceTheme.screenOrientation')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NONE">{t('deviceTheme.screenOrientation.auto')}</SelectItem>
                            <SelectItem value="PORTRAIT">{t('deviceTheme.screenOrientation.portrait')}</SelectItem>
                            <SelectItem value="LANDSCAPE">{t('deviceTheme.screenOrientation.landscape')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {t('deviceTheme.screenOrientation.desc')}
                    </p>
                </div>

                {/* Background Type Toggle */}
                <div className="space-y-2">
                    <Label>{t('deviceTheme.backgroundType')}</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={!useBackgroundImage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setUseBackgroundImage(false)}
                        >
                            <Palette className="w-4 h-4 mr-2" />
                            {t('deviceTheme.solidColor')}
                        </Button>
                        <Button
                            type="button"
                            variant={useBackgroundImage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setUseBackgroundImage(true)}
                        >
                            <Image className="w-4 h-4 mr-2" />
                            {t('deviceTheme.imageUrl')}
                        </Button>
                    </div>
                </div>

                {/* Background Color or Image */}
                {!useBackgroundImage ? (
                    <div className="space-y-2">
                        <Label htmlFor="backgroundColor">{t('deviceTheme.backgroundColor')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="backgroundColor"
                                type="color"
                                value={formData.backgroundColor || '#1a1a2e'}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                value={formData.backgroundColor || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                placeholder="#1a1a2e"
                                pattern="^#[0-9a-fA-F]{6}$"
                                className="flex-1"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="backgroundImage">{t('deviceTheme.backgroundImage')}</Label>
                        <Input
                            id="backgroundImage"
                            value={formData.backgroundImage || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                            placeholder="https://example.com/wallpaper.jpg"
                            type="url"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('deviceTheme.backgroundImage.desc')}
                        </p>
                    </div>
                )}

                {/* Screen Signature */}
                <div className="space-y-2">
                    <Label htmlFor="screenSignature">{t('deviceTheme.screenSignature')}</Label>
                    <Input
                        id="screenSignature"
                        value={formData.screenSignature || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, screenSignature: e.target.value }))}
                        placeholder="Company managed device"
                    />
                    <p className="text-xs text-muted-foreground">
                        {t('deviceTheme.screenSignature.desc')}
                    </p>
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
