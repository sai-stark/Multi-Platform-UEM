import { policyAPI } from '@/api/services/Androidpolicies';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    AndroidPasscodePolicy as AndroidPasscodePolicyType,
    AndroidPersonalDevicesPasscodePolicy,
    AndroidDedicatedDevicePasscodePolicy,
    PasscodeComplexity,
    Platform,
    StrongAuthRequiredTimeout,
} from '@/types/models';
import {
    AlertTriangle,
    Clock,
    Edit,
    Info,
    Key,
    Loader2,
    Lock,
    Save,
    Shield,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface PasscodePolicyProps {
    platform: Platform;
    profileId: string;
    initialData?: AndroidPasscodePolicyType;
    onSave: () => void;
    onCancel: () => void;
}

export function PasscodePolicy({ platform, profileId, initialData, onSave, onCancel }: PasscodePolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.work);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const complexityOptions: { value: PasscodeComplexity; label: string; description: string }[] = [
        { value: 'LOW', label: t('passcodePolicy.complexity.low'), description: t('passcodePolicy.complexity.lowDesc') },
        { value: 'MEDIUM', label: t('passcodePolicy.complexity.medium'), description: t('passcodePolicy.complexity.mediumDesc') },
        { value: 'HIGH', label: t('passcodePolicy.complexity.high'), description: t('passcodePolicy.complexity.highDesc') },
    ];

    const strongAuthTimeoutOptions: { value: StrongAuthRequiredTimeout; label: string }[] = [
        { value: 'DEVICE_DEFAULT', label: t('passcodePolicy.strongAuth.deviceDefault') },
        { value: 'EVERY_DAY', label: t('passcodePolicy.strongAuth.everyDay') },
    ];

    // Work Policy State
    const [workComplexity, setWorkComplexity] = useState<PasscodeComplexity>(
        initialData?.work?.complexity ?? 'MEDIUM'
    );
    const [workHistoryLength, setWorkHistoryLength] = useState<number>(
        initialData?.work?.historyLength ?? 0
    );
    const [workMaxFailedAttempts, setWorkMaxFailedAttempts] = useState<number>(
        initialData?.work?.maxFailedAttemptsToWipe ?? 0
    );
    const [workChangeAfterSeconds, setWorkChangeAfterSeconds] = useState<number>(
        initialData?.work?.changeAfterSeconds ?? 0
    );
    const [workStrongAuthTimeout, setWorkStrongAuthTimeout] = useState<StrongAuthRequiredTimeout>(
        initialData?.work?.strongAuthRequiredTimeout ?? 'DEVICE_DEFAULT'
    );
    const [workSeparateLock, setWorkSeparateLock] = useState<boolean>(
        initialData?.work?.separateLock ?? false
    );

    // Enforcement State
    const [enforcementEnabled, setEnforcementEnabled] = useState<boolean>(
        !!initialData?.enforcement
    );
    const [blockAfterDays, setBlockAfterDays] = useState<number>(
        initialData?.enforcement?.blockAfterDays ?? 0
    );
    const [wipeAfterDays, setWipeAfterDays] = useState<number>(
        initialData?.enforcement?.wipeAfterDays ?? 0
    );
    const [preserveFrp, setPreserveFrp] = useState<boolean>(
        (initialData?.devicePolicyType === 'AndroidDedicatedDevicePasscodePolicy'
            ? (initialData as AndroidDedicatedDevicePasscodePolicy).enforcement?.preserveFrp
            : false) ?? false
    );
    const [policyVariant, setPolicyVariant] = useState<'personal' | 'dedicated'>(
        initialData?.devicePolicyType === 'AndroidDedicatedDevicePasscodePolicy' ? 'dedicated' : 'personal'
    );

    // Device Policy State (optional)
    const [enableDevicePolicy, setEnableDevicePolicy] = useState<boolean>(
        !!initialData?.device
    );
    const [deviceComplexity, setDeviceComplexity] = useState<PasscodeComplexity>(
        initialData?.device?.complexity ?? 'MEDIUM'
    );
    const [deviceHistoryLength, setDeviceHistoryLength] = useState<number>(
        initialData?.device?.historyLength ?? 0
    );
    const [deviceMaxFailedAttempts, setDeviceMaxFailedAttempts] = useState<number>(
        initialData?.device?.maxFailedAttemptsToWipe ?? 0
    );
    const [deviceChangeAfterSeconds, setDeviceChangeAfterSeconds] = useState<number>(
        initialData?.device?.changeAfterSeconds ?? 0
    );
    const [deviceStrongAuthTimeout, setDeviceStrongAuthTimeout] = useState<StrongAuthRequiredTimeout>(
        initialData?.device?.strongAuthRequiredTimeout ?? 'DEVICE_DEFAULT'
    );

    const buildPolicy = (): AndroidPasscodePolicyType => {
        if (policyVariant === 'dedicated') {
            const policy: AndroidDedicatedDevicePasscodePolicy = {
                work: {
                    complexity: workComplexity,
                    historyLength: workHistoryLength,
                    maxFailedAttemptsToWipe: workMaxFailedAttempts,
                    changeAfterSeconds: workChangeAfterSeconds,
                    strongAuthRequiredTimeout: workStrongAuthTimeout,
                    separateLock: workSeparateLock,
                },
                devicePolicyType: 'AndroidDedicatedDevicePasscodePolicy',
            };
            if (enforcementEnabled) {
                policy.enforcement = {
                    blockAfterDays,
                    wipeAfterDays,
                    preserveFrp,
                };
            }
            if (enableDevicePolicy) {
                policy.device = {
                    complexity: deviceComplexity,
                    historyLength: deviceHistoryLength,
                    maxFailedAttemptsToWipe: deviceMaxFailedAttempts,
                    changeAfterSeconds: deviceChangeAfterSeconds,
                    strongAuthRequiredTimeout: deviceStrongAuthTimeout,
                };
            }
            return policy;
        }

        // Personal device variant (default)
        const policy: AndroidPersonalDevicesPasscodePolicy = {
            work: {
                complexity: workComplexity,
                historyLength: workHistoryLength,
                maxFailedAttemptsToWipe: workMaxFailedAttempts,
                changeAfterSeconds: workChangeAfterSeconds,
                strongAuthRequiredTimeout: workStrongAuthTimeout,
                separateLock: workSeparateLock,
            },
            devicePolicyType: 'AndroidPersonalDevicesPasscodePolicy',
        };

        if (enforcementEnabled) {
            policy.enforcement = {
                blockAfterDays,
                wipeAfterDays,
            };
        }

        if (enableDevicePolicy) {
            policy.device = {
                complexity: deviceComplexity,
                historyLength: deviceHistoryLength,
                maxFailedAttemptsToWipe: deviceMaxFailedAttempts,
                changeAfterSeconds: deviceChangeAfterSeconds,
                strongAuthRequiredTimeout: deviceStrongAuthTimeout,
            };
        }

        return policy;
    };

    const validatePolicy = (): { isValid: boolean; errorMessage: string } => {
        if (enforcementEnabled && wipeAfterDays > 0 && blockAfterDays >= wipeAfterDays) {
            return {
                isValid: false,
                errorMessage: t('passcodePolicy.validationError'),
            };
        }
        return { isValid: true, errorMessage: '' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validation = validatePolicy();
        if (!validation.isValid) {
            alert(validation.errorMessage);
            return;
        }

        setLoading(true);
        try {
            const policy = buildPolicy();
            if (initialData?.work?.id) {
                await policyAPI.updatePasscodePolicy(platform, profileId, policy);
            } else {
                await policyAPI.createPasscodePolicy(platform, profileId, policy);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save passcode policy:', error);
            toast({
                title: t('common.error'),
                description: getErrorMessage(error, t('passcodePolicy.saveFailed')),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await policyAPI.deletePasscodePolicy(platform, profileId);
            onSave();
        } catch (error) {
            console.error('Failed to delete passcode policy:', error);
            toast({
                title: t('common.error'),
                description: getErrorMessage(error, t('passcodePolicy.deleteFailed')),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (isEditing && initialData?.work) {
            setIsEditing(false);
        } else {
            onCancel();
        }
    };

    const getComplexityLabel = (complexity: PasscodeComplexity) => {
        const option = complexityOptions.find(o => o.value === complexity);
        return option?.label ?? complexity;
    };

    // View Mode
    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Key className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t('passcodePolicy.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('passcodePolicy.subtitle')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('form.delete')}
                        </Button>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('passcodePolicy.deleteConfirm')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove the passcode policy from this profile. Devices may lose enforcement settings.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDelete}
                                >
                                    {t('form.delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('form.edit')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{t('passcodePolicy.workProfileComplexity')}</span>
                        </div>
                        <Badge variant="default">{getComplexityLabel(workComplexity)}</Badge>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{t('passcodePolicy.strongAuthTimeout')}</span>
                        </div>
                        <Badge variant="secondary">
                            {workStrongAuthTimeout === 'DEVICE_DEFAULT' 
                                ? t('passcodePolicy.strongAuth.deviceDefault') 
                                : t('passcodePolicy.strongAuth.everyDay')}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${workSeparateLock ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{t('passcodePolicy.separateWorkLock')}</span>
                        </div>
                        <Badge variant={workSeparateLock ? 'default' : 'secondary'}>
                            {workSeparateLock ? t('form.enabled') : t('form.disabled')}
                        </Badge>
                    </CardContent>
                </Card>

                {enforcementEnabled && (
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <span className="font-medium">{t('passcodePolicy.enforcement')}</span>
                            </div>
                            <div className="text-sm space-y-1">
                                <p>{t('passcodePolicy.block')}: {blockAfterDays === 0 ? t('passcodePolicy.immediately') : `${blockAfterDays} ${t('passcodePolicy.days')}`}</p>
                                <p>{t('passcodePolicy.wipe')}: {wipeAfterDays === 0 ? t('passcodePolicy.immediately') : `${wipeAfterDays} ${t('passcodePolicy.days')}`}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {enableDevicePolicy && (
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                <span className="font-medium">{t('passcodePolicy.deviceComplexity')}</span>
                            </div>
                            <Badge variant="secondary">{getComplexityLabel(deviceComplexity)}</Badge>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>{t('form.close')}</Button>
            </div>
        </div>
    );

    if (!isEditing) {
        return renderView();
    }

    // Edit Mode
    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Edit className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">
                                {initialData?.work ? t('passcodePolicy.editTitle') : t('passcodePolicy.configureTitle')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('passcodePolicy.configureSubtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Work Profile Section */}
                <div className="space-y-4">
                    <h4 className="text-md font-semibold flex items-center gap-2 border-b pb-2">
                        <Key className="h-5 w-5" />
                        {t('passcodePolicy.workProfile')}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                        {/* Complexity */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {t('passcodePolicy.passwordComplexity')}
                                <span className="text-red-500">*</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p>{t('passcodePolicy.passwordComplexityTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Select value={workComplexity} onValueChange={(v) => setWorkComplexity(v as PasscodeComplexity)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {complexityOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label} - {opt.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* History Length */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                {t('passcodePolicy.passwordHistoryLength')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p>{t('passcodePolicy.passwordHistoryTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={workHistoryLength}
                                onChange={(e) => setWorkHistoryLength(Number(e.target.value) || 0)}
                                placeholder={t('passcodePolicy.noRestriction')}
                            />
                        </div>

                        {/* Max Failed Attempts */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                {t('passcodePolicy.maxFailedAttempts')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p>{t('passcodePolicy.maxFailedAttemptsTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={workMaxFailedAttempts}
                                onChange={(e) => setWorkMaxFailedAttempts(Number(e.target.value) || 0)}
                                placeholder={t('passcodePolicy.noRestriction')}
                            />
                        </div>

                        {/* Change After Seconds */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('passcodePolicy.passwordExpiry')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p>{t('passcodePolicy.passwordExpiryTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={workChangeAfterSeconds}
                                onChange={(e) => setWorkChangeAfterSeconds(Number(e.target.value) || 0)}
                                placeholder={t('passcodePolicy.neverExpires')}
                            />
                        </div>

                        {/* Strong Auth Timeout */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                {t('passcodePolicy.strongAuthTimeout')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p>{t('passcodePolicy.strongAuthTimeoutTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Select value={workStrongAuthTimeout} onValueChange={(v) => setWorkStrongAuthTimeout(v as StrongAuthRequiredTimeout)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {strongAuthTimeoutOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Separate Lock */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {t('passcodePolicy.separateWorkLock')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <p>{t('passcodePolicy.separateWorkLockTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    checked={workSeparateLock}
                                    onCheckedChange={setWorkSeparateLock}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {workSeparateLock ? t('form.enabled') : t('form.disabled')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enforcement Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-md font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {t('passcodePolicy.enforcement')}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-sm">
                                    <p>{t('passcodePolicy.enforcementTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </h4>
                        <div className="flex items-center space-x-2">
                            <Switch checked={enforcementEnabled} onCheckedChange={setEnforcementEnabled} />
                            <span className="text-sm text-muted-foreground">
                                {enforcementEnabled ? t('form.enabled') : t('form.disabled')}
                            </span>
                        </div>
                    </div>

                    {enforcementEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                            <div className="space-y-2">
                                <Label>{t('passcodePolicy.blockAfterDays')}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={blockAfterDays}
                                    onChange={(e) => setBlockAfterDays(Number(e.target.value) || 0)}
                                    placeholder={t('passcodePolicy.blockAfterDaysHint')}
                                />
                                <p className="text-xs text-muted-foreground">{t('passcodePolicy.blockAfterDaysHint')}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('passcodePolicy.wipeAfterDays')}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={wipeAfterDays}
                                    onChange={(e) => setWipeAfterDays(Number(e.target.value) || 0)}
                                    placeholder={t('passcodePolicy.wipeAfterDaysHint')}
                                />
                                <p className="text-xs text-muted-foreground">{t('passcodePolicy.wipeAfterDaysHint')}</p>
                            </div>
                            {policyVariant === 'dedicated' && (
                                <div className="col-span-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            {t('passcodePolicy.preserveFrp')}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="max-w-xs">
                                                    <p>{t('passcodePolicy.preserveFrpTooltip')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={preserveFrp} onCheckedChange={setPreserveFrp} />
                                            <span className="text-sm text-muted-foreground">
                                                {preserveFrp ? t('form.enabled') : t('form.disabled')}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('passcodePolicy.preserveFrpDesc')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Device Policy Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-md font-semibold flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {t('passcodePolicy.devicePolicy')}
                        </h4>
                        <div className="flex items-center space-x-2">
                            <Switch checked={enableDevicePolicy} onCheckedChange={setEnableDevicePolicy} />
                            <span className="text-sm text-muted-foreground">
                                {enableDevicePolicy ? t('form.enabled') : t('form.disabled')}
                            </span>
                        </div>
                    </div>

                    {enableDevicePolicy && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    {t('passcodePolicy.deviceComplexity')}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select value={deviceComplexity} onValueChange={(v) => setDeviceComplexity(v as PasscodeComplexity)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {complexityOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label} - {opt.description}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('passcodePolicy.deviceHistoryLength')}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={deviceHistoryLength}
                                    onChange={(e) => setDeviceHistoryLength(Number(e.target.value) || 0)}
                                    placeholder={t('passcodePolicy.noRestriction')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('passcodePolicy.deviceMaxFailedAttempts')}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={deviceMaxFailedAttempts}
                                    onChange={(e) => setDeviceMaxFailedAttempts(Number(e.target.value) || 0)}
                                    placeholder={t('passcodePolicy.noRestriction')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('passcodePolicy.devicePasswordExpiry')}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={deviceChangeAfterSeconds}
                                    onChange={(e) => setDeviceChangeAfterSeconds(Number(e.target.value) || 0)}
                                    placeholder={t('passcodePolicy.neverExpires')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('passcodePolicy.deviceStrongAuthTimeout')}</Label>
                                <Select value={deviceStrongAuthTimeout} onValueChange={(v) => setDeviceStrongAuthTimeout(v as StrongAuthRequiredTimeout)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {strongAuthTimeoutOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>
                        {t('form.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2 min-w-[140px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t('form.saveChanges')}
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    );
}
