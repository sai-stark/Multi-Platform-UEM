import { PolicyService } from '@/api/services/IOSpolicies';
import { PolicyCategory, PolicyMasterDetail } from '@/components/profiles/PolicyMasterDetail';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    IosAccessibilitySettings,
    IosDeviceSettingItem,
    IosDeviceSettingsPolicy as IosDeviceSettingsPolicyType,
    IosMDMOptions,
    IosOrganizationInfo,
} from '@/types/ios';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    Accessibility,
    Bluetooth,
    Building2,
    Clock,
    Globe,
    Loader2,
    Monitor,
    Server,
    Settings,
    Smartphone,
    Trash2,
    Users,
    Wifi,
    Wrench
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useBaseDialogContext } from '@/components/common/BaseDialogContext';

// ====================================================================
// Setting Category Definitions
// ====================================================================
interface SettingCategory {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const SETTING_CATEGORIES: SettingCategory[] = [
    { key: 'DeviceName', title: 'Device Name', description: 'Set device name', icon: <Smartphone className="w-5 h-5" /> },
    { key: 'Bluetooth', title: 'Bluetooth', description: 'Enable/disable Bluetooth', icon: <Bluetooth className="w-5 h-5" /> },
    { key: 'AccessibilitySettings', title: 'Accessibility', description: 'Accessibility settings (iOS 16+)', icon: <Accessibility className="w-5 h-5" /> },
    { key: 'DataRoaming', title: 'Data Roaming', description: 'Enable/disable data roaming', icon: <Globe className="w-5 h-5" /> },
    { key: 'PersonalHotspot', title: 'Personal Hotspot', description: 'Enable/disable personal hotspot', icon: <Wifi className="w-5 h-5" /> },
    { key: 'DiagnosticSubmission', title: 'Diagnostics', description: 'Enable/disable diagnostic data', icon: <Wrench className="w-5 h-5" /> },
    { key: 'TimeZone', title: 'Time Zone', description: 'Set device time zone', icon: <Clock className="w-5 h-5" /> },
    { key: 'HostName', title: 'Host Name', description: 'Set hostname (macOS)', icon: <Monitor className="w-5 h-5" /> },
    { key: 'MDMOptions', title: 'MDM Options', description: 'MDM protocol settings', icon: <Server className="w-5 h-5" /> },
    { key: 'OrganizationInfo', title: 'Organization Info', description: 'Organization contact details', icon: <Building2 className="w-5 h-5" /> },
    { key: 'SharedDeviceConfiguration', title: 'Shared Device', description: 'Shared iPad configuration', icon: <Users className="w-5 h-5" /> },
];

// ====================================================================
// Props
// ====================================================================
interface DeviceSettingsPolicyProps {
    profileId: string;
    initialData?: IosDeviceSettingsPolicyType;
    onSave: () => void;
    onCancel: () => void;
}

// ====================================================================
// Helper: extract a flat settings object from the Settings array
// ====================================================================
function flattenSettings(policy?: IosDeviceSettingsPolicyType): Record<string, any> {
    const result: Record<string, any> = {};
    const items = policy?.iosDeviceSettings?.Settings || [];
    for (const item of items) {
        for (const key of Object.keys(item)) {
            result[key] = (item as any)[key];
        }
    }
    return result;
}

function buildSettingsArray(flat: Record<string, any>): IosDeviceSettingItem[] {
    const items: IosDeviceSettingItem[] = [];
    for (const [key, value] of Object.entries(flat)) {
        if (value !== undefined && value !== null) {
            items.push({ [key]: value } as IosDeviceSettingItem);
        }
    }
    return items;
}

// ====================================================================
// Component
// ====================================================================
export function DeviceSettingsPolicy({ profileId, initialData, onSave, onCancel }: DeviceSettingsPolicyProps) {
    const { toast } = useToast();
    const { registerSave, setLoading: setContextLoading, setSaveDisabled } = useBaseDialogContext();
    const [loading, setLoadingState] = useState(false);

    const setLoading = (val: boolean) => { setLoadingState(val); setContextLoading(val); };
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(SETTING_CATEGORIES[0].key);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [settings, setSettings] = useState<Record<string, any>>(() => flattenSettings(initialData));

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return SETTING_CATEGORIES;
        const q = searchQuery.toLowerCase();
        return SETTING_CATEGORIES.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }, [searchQuery]);

    useEffect(() => {
        if (filteredCategories.length > 0 && !filteredCategories.find(c => c.key === selectedCategory)) {
            setSelectedCategory(filteredCategories[0].key);
        }
    }, [filteredCategories, selectedCategory]);

    const configuredCount = useMemo(() => {
        return SETTING_CATEGORIES.filter(c => settings[c.key] !== undefined && settings[c.key] !== null).length;
    }, [settings]);

    // ====================================================================
    // Handlers
    // ====================================================================

    const updateSetting = (categoryKey: string, value: any) => {
        setSettings(prev => ({ ...prev, [categoryKey]: value }));
    };

    const removeSetting = (categoryKey: string) => {
        setSettings(prev => {
            const next = { ...prev };
            delete next[categoryKey];
            return next;
        });
    };

    useEffect(() => { registerSave(handleSave); }, []);

    const handleSave = async () => {
        setLoading(true);
        const rawPayload: IosDeviceSettingsPolicyType = {
            ...initialData,
            name: initialData?.name || 'ios',
            policyType: 'IosDeviceSettingsPolicy',
            iosDeviceSettings: {
                Settings: buildSettingsArray(settings),
            },
        };
        const payload = cleanPayload(rawPayload) as IosDeviceSettingsPolicyType;
        try {
            if (initialData?.id) {
                await PolicyService.updateDeviceSettingsPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Device settings policy updated' });
            } else {
                await PolicyService.createDeviceSettingsPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Device settings policy created' });
            }
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save device settings'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setLoading(true);
        try {
            await PolicyService.deleteDeviceSettingsPolicy(profileId);
            toast({ title: 'Success', description: 'Device settings policy deleted' });
            setShowDeleteDialog(false);
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete device settings'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Build categories for the shared layout
    const categories: PolicyCategory[] = filteredCategories.map(cat => ({
        key: cat.key,
        title: cat.title,
        subtitle: cat.description,
        icon: cat.icon,
        hasModifications: settings[cat.key] !== undefined && settings[cat.key] !== null,
        dotColor: 'blue',
    }));

    // Content renderer — always in edit mode
    const renderSettingsContent = (category: PolicyCategory) => {
        const rawCat = SETTING_CATEGORIES.find(c => c.key === category.key);
        if (!rawCat) return null;
        return renderCategoryEditor(rawCat.key, settings[rawCat.key], (val) => updateSetting(rawCat.key, val));
    };

    return (
        <PolicyMasterDetail
            headerIcon={<Settings className="w-5 h-5 text-primary" />}
            headerColorClass="primary"
            title={`${initialData?.id ? 'Edit' : 'Create'} Device Settings`}
            subtitle={`Configure iOS device settings (${configuredCount} active)`}
            categories={categories}
            selectedCategoryKey={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchPlaceholder="Search settings..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryHeaderActions={undefined}
            renderContent={renderSettingsContent}
            footerActions={
                <>
                    {initialData?.id && (
                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={loading} className="mr-auto gap-2">
                                <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this policy? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                                        Delete
                                    </AlertDialogAction>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="gap-2 min-w-[140px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Device Settings
                    </Button>
                </>
            }
        />
    );
}


// ====================================================================
// View Mode Summary
// ====================================================================
function renderViewSummary(key: string, value: any): string {
    if (!value) return 'Not configured';
    switch (key) {
        case 'DeviceName': return `Name: ${value.DeviceName || '-'}`;
        case 'Bluetooth': return value.Enabled ? 'Enabled' : 'Disabled';
        case 'DataRoaming': return value.Enabled ? 'Enabled' : 'Disabled';
        case 'PersonalHotspot': return value.Enabled ? 'Enabled' : 'Disabled';
        case 'DiagnosticSubmission': return value.Enabled ? 'Enabled' : 'Disabled';
        case 'TimeZone': return value.TimeZone || '-';
        case 'HostName': return value.HostName || '-';
        case 'MDMOptions': return 'Configured';
        case 'OrganizationInfo': return value.OrganizationInfo?.OrganizationName || 'Configured';
        case 'SharedDeviceConfiguration': return `Max users: ${value.MaximumResidentUsers || '-'}`;
        case 'AccessibilitySettings': return 'Configured';
        default: return 'Configured';
    }
}


// ====================================================================
// Category Editor Renderers
// ====================================================================
function renderCategoryEditor(key: string, value: any, onChange: (val: any) => void) {
    switch (key) {
        case 'DeviceName':
            return <DeviceNameEditor value={value} onChange={onChange} />;
        case 'Bluetooth':
        case 'DataRoaming':
        case 'PersonalHotspot':
        case 'DiagnosticSubmission':
            return <ToggleEditor label={key === 'Bluetooth' ? 'Bluetooth' : key === 'DataRoaming' ? 'Data Roaming' : key === 'PersonalHotspot' ? 'Personal Hotspot' : 'Diagnostic Submission'} value={value} onChange={onChange} />;
        case 'TimeZone':
            return <TimeZoneEditor value={value} onChange={onChange} />;
        case 'HostName':
            return <HostNameEditor value={value} onChange={onChange} />;
        case 'MDMOptions':
            return <MDMOptionsEditor value={value} onChange={onChange} />;
        case 'OrganizationInfo':
            return <OrganizationInfoEditor value={value} onChange={onChange} />;
        case 'AccessibilitySettings':
            return <AccessibilityEditor value={value} onChange={onChange} />;
        case 'SharedDeviceConfiguration':
            return <SharedDeviceEditor value={value} onChange={onChange} />;
        default:
            return <p className="text-sm text-muted-foreground">Editor not available for this setting type.</p>;
    }
}


// ====================================================================
// Sub-editors
// ====================================================================

function DeviceNameEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { DeviceName: '', Item: 'DeviceName' };
    const isModified = !!current.DeviceName;
    return (
        <div className="space-y-4">
            <div className={cn(
                "space-y-2 p-4 rounded-xl border transition-all duration-200",
                isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
            )}>
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                    id="deviceName"
                    placeholder="e.g. iPhone - Marketing Team"
                    value={current.DeviceName || ''}
                    onChange={e => onChange({ ...current, DeviceName: e.target.value, Item: 'DeviceName' })}
                    maxLength={255}
                />
                <p className="text-xs text-muted-foreground">Max 255 characters. Requires supervised device.</p>
            </div>
        </div>
    );
}

function ToggleEditor({ label, value, onChange }: { label: string; value: any; onChange: (val: any) => void }) {
    const current = value || { Enabled: true, Item: label };
    const isModified = current.Enabled === false;
    return (
        <div className="space-y-4">
            <div className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm",
                isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
            )}>
                <div>
                    <Label className="text-sm font-semibold">{label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Enable or disable {label.toLowerCase()}</p>
                </div>
                <Switch
                    checked={current.Enabled ?? true}
                    onCheckedChange={v => onChange({ ...current, Enabled: v, Item: label })}
                />
            </div>
        </div>
    );
}

function TimeZoneEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { TimeZone: '', Item: 'TimeZone' };
    const isModified = !!current.TimeZone;
    return (
        <div className="space-y-4">
            <div className={cn(
                "space-y-2 p-4 rounded-xl border transition-all duration-200",
                isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
            )}>
                <Label htmlFor="timezone">Time Zone (IANA)</Label>
                <Input
                    id="timezone"
                    placeholder="e.g. America/New_York, Europe/London, Asia/Kolkata"
                    value={current.TimeZone || ''}
                    onChange={e => onChange({ ...current, TimeZone: e.target.value, Item: 'TimeZone' })}
                />
                <p className="text-xs text-muted-foreground">IANA time zone database name. Requires supervised device (iOS 14+).</p>
            </div>
        </div>
    );
}

function HostNameEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { HostName: '', Item: 'HostName' };
    const isModified = !!current.HostName;
    return (
        <div className="space-y-4">
            <div className={cn(
                "space-y-2 p-4 rounded-xl border transition-all duration-200",
                isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
            )}>
                <Label htmlFor="hostname">Host Name</Label>
                <Input
                    id="hostname"
                    placeholder="e.g. macbook-marketing-01"
                    value={current.HostName || ''}
                    onChange={e => onChange({ ...current, HostName: e.target.value, Item: 'HostName' })}
                    maxLength={255}
                />
                <p className="text-xs text-muted-foreground">macOS 10.11+ only.</p>
            </div>
        </div>
    );
}

function MDMOptionsEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { Item: 'MDMOptions', MDMOptions: {} as IosMDMOptions };
    const opts: IosMDMOptions = current.MDMOptions || {};

    const updateOpt = (key: keyof IosMDMOptions, v: boolean) => {
        onChange({ ...current, MDMOptions: { ...opts, [key]: v }, Item: 'MDMOptions' });
    };

    return (
        <div className="space-y-3">
            {[
                { key: 'ActivationLockAllowedWhileSupervised' as const, label: 'Activation Lock (Supervised)', desc: 'Allow Activation Lock when Find My is enabled' },
                { key: 'IdleRebootAllowed' as const, label: 'Idle Reboot Allowed', desc: 'Allow Automatic Reboot (iOS 18.1+)' },
                { key: 'PromptUserToAllowBootstrapTokenForAuthentication' as const, label: 'Bootstrap Token Prompt', desc: 'Prompt user to allow bootstrap token (macOS 11+)' },
            ].map(opt => {
                const isModified = opts[opt.key] === true;
                return (
                    <div key={opt.key} className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm",
                        isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
                    )}>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">{opt.label}</Label>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <Switch checked={opts[opt.key] ?? false} onCheckedChange={v => updateOpt(opt.key, v)} />
                    </div>
                );
            })}
        </div>
    );
}

function OrganizationInfoEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { Item: 'OrganizationInfo', OrganizationInfo: {} as IosOrganizationInfo };
    const info: IosOrganizationInfo = current.OrganizationInfo || {};

    const updateField = (key: keyof IosOrganizationInfo, v: string) => {
        onChange({ ...current, OrganizationInfo: { ...info, [key]: v }, Item: 'OrganizationInfo' });
    };

    const fields: { key: keyof IosOrganizationInfo; label: string; placeholder: string }[] = [
        { key: 'OrganizationName', label: 'Organization Name', placeholder: 'Acme Corporation' },
        { key: 'OrganizationAddress', label: 'Address', placeholder: '123 Main St, San Francisco, CA 94105' },
        { key: 'OrganizationPhone', label: 'Phone', placeholder: '+1-555-123-4567' },
        { key: 'OrganizationEmail', label: 'Email', placeholder: 'support@acme.com' },
        { key: 'OrganizationShortName', label: 'Short Name', placeholder: 'Acme' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => {
                const isModified = !!info[f.key];
                return (
                    <div key={f.key} className={cn(
                        "space-y-2 p-4 rounded-xl border transition-all duration-200",
                        isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
                    )}>
                        <Label>{f.label}</Label>
                        <Input
                            placeholder={f.placeholder}
                            value={info[f.key] || ''}
                            onChange={e => updateField(f.key, e.target.value)}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function AccessibilityEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current: IosAccessibilitySettings = value || { Item: 'AccessibilitySettings' };

    const updateField = (key: keyof IosAccessibilitySettings, v: boolean | number) => {
        onChange({ ...current, [key]: v, Item: 'AccessibilitySettings' });
    };

    const boolFields: { key: keyof IosAccessibilitySettings; label: string; desc: string }[] = [
        { key: 'BoldTextEnabled', label: 'Bold Text', desc: 'Enable bold text' },
        { key: 'IncreaseContrastEnabled', label: 'Increase Contrast', desc: 'Enable increased contrast' },
        { key: 'ReduceMotionEnabled', label: 'Reduce Motion', desc: 'Enable reduced motion' },
        { key: 'ReduceTransparencyEnabled', label: 'Reduce Transparency', desc: 'Enable reduced transparency' },
        { key: 'TouchAccommodationsEnabled', label: 'Touch Accommodations', desc: 'Enable touch accommodations' },
        { key: 'VoiceOverEnabled', label: 'VoiceOver', desc: 'Enable VoiceOver screen reader' },
        { key: 'ZoomEnabled', label: 'Zoom', desc: 'Enable zoom accessibility' },
        { key: 'GrayscaleEnabled', label: 'Grayscale', desc: 'Enable grayscale display' },
    ];

    const textSize = current.TextSize ?? 5;
    const isTextSizeModified = textSize !== 5;

    return (
        <div className="space-y-3">
            <div className={cn(
                "space-y-2 p-4 rounded-xl border transition-all duration-200",
                isTextSizeModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
            )}>
                <Label htmlFor="textSize">Text Size (0-11)</Label>
                <Input
                    id="textSize"
                    type="number"
                    min={0}
                    max={11}
                    value={textSize}
                    onChange={e => updateField('TextSize', parseInt(e.target.value) || 0)}
                />
            </div>
            {boolFields.map(f => {
                const isModified = (current[f.key] as boolean) === true;
                return (
                    <div key={f.key} className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm",
                        isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
                    )}>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">{f.label}</Label>
                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                        <Switch
                            checked={(current[f.key] as boolean) ?? false}
                            onCheckedChange={v => updateField(f.key, v)}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function SharedDeviceEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { Item: 'SharedDeviceConfiguration' };

    const updateField = (key: string, v: any) => {
        onChange({ ...current, [key]: v, Item: 'SharedDeviceConfiguration' });
    };

    const fields = [
        { key: 'MaximumResidentUsers', label: 'Max Resident Users', type: 'number' },
        { key: 'QuotaSize', label: 'Storage Quota (MB)', type: 'number' },
        { key: 'TemporarySessionTimeout', label: 'Temp Session Timeout (sec)', type: 'number' },
        { key: 'UserSessionTimeout', label: 'User Session Timeout (sec)', type: 'number' },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(f => {
                    const val = current[f.key];
                    const isModified = val !== undefined && val !== null;
                    return (
                        <div key={f.key} className={cn(
                            "space-y-2 p-4 rounded-xl border transition-all duration-200",
                            isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
                        )}>
                            <Label>{f.label}</Label>
                            <Input
                                type="number"
                                value={val ?? ''}
                                onChange={e => updateField(f.key, parseInt(e.target.value) || undefined)}
                            />
                        </div>
                    );
                })}
            </div>
            {(() => {
                const isModified = current.TemporarySessionOnly === true;
                return (
                    <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm",
                        isModified ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" : "bg-card/50"
                    )}>
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">Temporary Session Only</Label>
                            <p className="text-xs text-muted-foreground">Enable temporary session only mode</p>
                        </div>
                        <Switch checked={current.TemporarySessionOnly ?? false} onCheckedChange={v => updateField('TemporarySessionOnly', v)} />
                    </div>
                );
            })()}
        </div>
    );
}
