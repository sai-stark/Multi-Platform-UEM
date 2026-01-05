import { PolicyService } from '@/api/services/policies';
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
import { IosPasscodeRestrictionPolicy, PasscodeRestrictionPolicy, Platform } from '@/types/models';
import {
    AlertCircle,
    CaseLower,
    CaseUpper,
    CheckCircle2,
    Clock,
    Edit,
    Hash,
    History,
    Hourglass,
    KeyRound,
    Loader2,
    Lock,
    Save,
    Shield,
    ShieldAlert,
    Timer,
    Type,
    User
} from 'lucide-react';
import { useState } from 'react';

interface PasscodePolicyProps {
    platform: Platform;
    profileId: string;
    // initialData can be either Android or iOS policy type.
    // Using union type or Partial to allow flexibility.
    initialData?: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
    onSave: () => void;
    onCancel: () => void;
}

// Helper to check if it's iOS policy data
const isIosPolicy = (data: any): data is IosPasscodeRestrictionPolicy => {
    return data?.policyType === 'IosPasscodeRestrictionPolicy';
};

export function PasscodePolicy({ platform, profileId, initialData, onSave, onCancel }: PasscodePolicyProps) {
    const [loading, setLoading] = useState(false);
    // If we have an ID, start in view mode. Otherwise, start in edit mode.
    const [isEditing, setIsEditing] = useState(!initialData?.id && !(initialData as any)?.passcodeId);

    // Initialize state based on platform.
    const [formData, setFormData] = useState<any>(() => {
        if (platform === 'ios') {
            return {
                policyType: 'IosPasscodeRestrictionPolicy',
                requirePassCode: true,
                allowSimple: false,
                forcePIN: true,
                maxFailedAttempts: 6,
                maxInactivity: 15,
                maxPinAgeInDays: 90,
                minComplexChars: 0,
                minLength: 6,
                pinHistory: 0,
                requireAlphanumeric: false,
                expirationDays: 0,
                ...initialData
            };
        }
        return {
            policyType: 'AndoidPasscodeRestrictionPolicy',
            passcodeId: (initialData as any)?.passcodeId, // Persist passcodeId for updates
            minLength: 4,
            complexity: 'low',
            minUpperCase: 0,
            minLowerCase: 0,
            minDigits: 0,
            minSymbols: 0,
            ...initialData
        };
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Determine update or create based on ID presence
            const hasId = formData.id || formData.passcodeId;

            if (hasId) {
                await PolicyService.updatePasscodeRestriction(platform, profileId, formData);
            } else {
                await PolicyService.createPasscodeRestriction(platform, profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save passcode policy:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        const hasId = initialData?.id || (initialData as any)?.passcodeId;
        if (isEditing && hasId) {
            setIsEditing(false);
            if (initialData) setFormData({ ...initialData });
        } else {
            onCancel();
        }
    };

    // --- RENDER HELPERS ---

    const renderAndroidView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card hover:shadow-sm border-l-4 border-l-blue-500">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-muted-foreground">Complexity</span>
                        </div>
                        <div className="text-2xl font-bold capitalize">{formData.complexity || 'Not Set'}</div>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-sm border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-2 mb-2">
                            <KeyRound className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-muted-foreground">Min Length</span>
                        </div>
                        <div className="text-2xl font-bold">{formData.minLength} <span className="text-sm font-normal text-muted-foreground">chars</span></div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Uppercase', icon: CaseUpper, value: formData.minUpperCase },
                    { label: 'Lowercase', icon: CaseLower, value: formData.minLowerCase },
                    { label: 'Digits', icon: Hash, value: formData.minDigits },
                    { label: 'Symbols', icon: Type, value: formData.minSymbols },
                ].map((item, i) => (
                    <div key={i} className="p-4 border rounded-xl bg-muted/20 flex flex-col items-center text-center justify-center gap-2">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</span>
                        <span className="text-xl font-bold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderIosView = () => (
        <div className="space-y-6">
            {/* Status Overview Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-card flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        <Badge variant={formData.requirePassCode ? 'default' : 'destructive'}>
                            {formData.requirePassCode ? 'Active' : 'Disabled'}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Passcode Requirement</p>
                        <p className="text-xs text-muted-foreground">Enforces device lock</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="p-2 w-fit rounded-lg bg-orange-500/10 text-orange-600">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div className="text-lg font-bold">{formData.minLength}</div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Min Length</p>
                        <p className="text-xs text-muted-foreground">Minimum characters required</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="p-2 w-fit rounded-lg bg-green-500/10 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="text-lg font-bold">{formData.allowSimple ? 'Allowed' : 'Denied'}</div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Simple Passcodes</p>
                        <p className="text-xs text-muted-foreground">Sequential or repeated chars</p>
                    </div>
                </div>
            </div>

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 border-b bg-muted/30">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-primary" /> Complexity Rules
                            </h4>
                        </div>
                        <div className="p-4 space-y-4 text-sm">
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Alphanumeric Required</span>
                                <span className="font-medium">{formData.requireAlphanumericPasscode ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Complex Passcode Required</span>
                                <span className="font-medium">{formData.requireComplexPasscode ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Min Complex Characters</span>
                                <span className="font-medium">{formData.minimumComplexCharacters}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 border-b bg-muted/30">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Expiry & Lockout
                            </h4>
                        </div>
                        <div className="p-4 space-y-4 text-sm">
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Max Failed Attempts</span>
                                <span className="font-medium">{formData.maximumFailedAttempts}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Max Inactivity</span>
                                <span className="font-medium">{formData.maximumInactivityInMinutes} min</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Passcode Age</span>
                                <span className="font-medium">{formData.maximumPasscodeAgeInDays} days</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Grace Period</span>
                                <span className="font-medium">{formData.maximumGracePeriodInMinutes} min</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Reuse Limit</span>
                                <span className="font-medium">{formData.passCodeReuseLimit}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Force Change Next Auth</span>
                                <span className="font-medium">{formData.changeAtNextAuth ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderAndroidEdit = () => (
        <div className="grid gap-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="complexity">Complexity</Label>
                    <Select value={formData.complexity} onValueChange={(v) => updateField('complexity', v)}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="minLength">Min Length</Label>
                    <Input id="minLength" type="number" min={0} max={16} value={formData.minLength} onChange={(e) => updateField('minLength', Number(e.target.value))} />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Character Rules</Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: 'minUpperCase', label: 'Uppercase', icon: CaseUpper },
                        { id: 'minLowerCase', label: 'Lowercase', icon: CaseLower },
                        { id: 'minDigits', label: 'Digits', icon: Hash },
                        { id: 'minSymbols', label: 'Symbols', icon: Type },
                    ].map((f) => (
                        <div key={f.id} className="space-y-1.5 p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-2 mb-1">
                                <f.icon className="w-4 h-4 text-muted-foreground" />
                                <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                            </div>
                            <Input
                                id={f.id}
                                type="number"
                                min={0}
                                className="h-8 text-center font-bold"
                                value={formData[f.id]}
                                onChange={(e) => updateField(f.id, Number(e.target.value))}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderIosEdit = () => (
        <div className="space-y-8">
            {/* Core Settings */}
            <div className="p-4 border rounded-xl bg-card space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Require Passcode</Label>
                        <p className="text-sm text-muted-foreground">Force users to set a passcode on their device</p>
                    </div>
                    <Switch checked={formData.requirePassCode} onCheckedChange={(c) => updateField('requirePassCode', c)} />
                </div>

                {formData.requirePassCode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>Minimum Length</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input type="number" className="pl-9" min={0} value={formData.minLength} onChange={(e) => updateField('minLength', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
                            <span className="text-sm font-medium">Simple Passcodes</span>
                            <Switch checked={formData.allowSimple} onCheckedChange={(c) => updateField('allowSimple', c)} />
                        </div>
                    </div>
                )}
            </div>

            {/* Complexity Settings */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Complexity Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
                        <div className="space-y-1">
                            <Label>Alphanumeric</Label>
                            <p className="text-xs text-muted-foreground hidden lg:block">Require letters and numbers</p>
                        </div>
                        <Switch checked={formData.requireAlphanumericPasscode} onCheckedChange={(c) => updateField('requireAlphanumericPasscode', c)} />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
                        <div className="space-y-1">
                            <Label>Complex Characters</Label>
                            <p className="text-xs text-muted-foreground hidden lg:block">Special symbols required</p>
                        </div>
                        <Switch checked={formData.requireComplexPasscode} onCheckedChange={(c) => updateField('requireComplexPasscode', c)} />
                    </div>
                    {(formData.requireComplexPasscode || formData.requireAlphanumericPasscode) && (
                        <div className="md:col-span-2 p-4 border rounded-xl bg-card flex items-center gap-4">
                            <Label className="shrink-0">Min Complex Characters (0-4)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={4}
                                className="max-w-[100px]"
                                value={formData.minimumComplexCharacters}
                                onChange={(e) => updateField('minimumComplexCharacters', Number(e.target.value))}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Expiry & Lockout Settings */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <History className="w-4 h-4" /> Expiry & Lockout
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Max Failed Attempts (2-11)</Label>
                        <div className="relative">
                            <ShieldAlert className="absolute left-3 top-2.5 w-4 h-4 text-destructive/70" />
                            <Input type="number" className="pl-9" min={2} max={11} value={formData.maximumFailedAttempts} onChange={(e) => updateField('maximumFailedAttempts', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Auto-Lock (Max 15 min)</Label>
                        <div className="relative">
                            <Timer className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input type="number" className="pl-9" min={0} max={15} value={formData.maximumInactivityInMinutes} onChange={(e) => updateField('maximumInactivityInMinutes', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Passcode Age (Max 730 days)</Label>
                        <div className="relative">
                            <Hourglass className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input type="number" className="pl-9" min={0} max={730} value={formData.maximumPasscodeAgeInDays} onChange={(e) => updateField('maximumPasscodeAgeInDays', Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
                        <div className="space-y-1">
                            <Label>Grace Period (Min)</Label>
                            <p className="text-xs text-muted-foreground">Time before lock requires code</p>
                        </div>
                        <Input
                            type="number"
                            className="w-20"
                            min={0}
                            value={formData.maximumGracePeriodInMinutes}
                            onChange={(e) => updateField('maximumGracePeriodInMinutes', Number(e.target.value))}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
                        <div className="space-y-1">
                            <Label>Reuse Limit (1-50)</Label>
                            <p className="text-xs text-muted-foreground">Prevent history reuse</p>
                        </div>
                        <Input
                            type="number"
                            className="w-20"
                            min={1}
                            max={50}
                            value={formData.passCodeReuseLimit}
                            onChange={(e) => updateField('passCodeReuseLimit', Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl bg-card mt-2">
                    <Label>Force Change Next Auth</Label>
                    <Switch checked={formData.changeAtNextAuth} onCheckedChange={(c) => updateField('changeAtNextAuth', c)} />
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    if (!isEditing) {
        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            {platform === 'ios' ? <Lock className="w-6 h-6 text-primary" /> : <Shield className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Passcode Policy</h3>
                            <p className="text-sm text-muted-foreground">
                                {platform === 'ios' ? 'iOS Passcode Requirements' : 'Android Security Layout'}
                            </p>
                        </div>
                    </div>
                    <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Configurations
                    </Button>
                </div>

                {platform === 'ios' ? renderIosView() : renderAndroidView()}

                {(formData.creationTime || formData.createdBy) && (
                    <div className="pt-6 border-t mt-8">
                        <h4 className="text-sm font-medium mb-4">Audit Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg">
                            {formData.createdBy && (
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    <span>Created by: <span className="font-medium text-foreground">{formData.createdBy}</span></span>
                                </div>
                            )}
                            {formData.creationTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Created on: <span className="font-medium text-foreground">{new Date(formData.creationTime).toLocaleString()}</span></span>
                                </div>
                            )}
                            {formData.lastModifiedBy && (
                                <div className="flex items-center gap-2">
                                    <Edit className="w-3 h-3" />
                                    <span>Modified by: <span className="font-medium text-foreground">{formData.lastModifiedBy}</span></span>
                                </div>
                            )}
                            {formData.modificationTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Modified on: <span className="font-medium text-foreground">{new Date(formData.modificationTime).toLocaleString()}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mt-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Edit className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Edit Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                {platform === 'ios' ? 'Modify iOS Passcode constraints' : 'Update Android security rules'}
                            </p>
                        </div>
                    </div>
                </div>

                {platform === 'ios' ? renderIosEdit() : renderAndroidEdit()}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10 py-4">
                <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2 min-w-[140px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
