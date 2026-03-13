import { PolicyService } from '@/api/services/IOSpolicies';
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
    Edit,
    Globe,
    Loader2,
    Monitor,
    Search,
    Server,
    Settings,
    Smartphone,
    Trash2,
    Users,
    Wifi,
    Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    onEditModeChange?: (isEditing: boolean) => void;
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
export function DeviceSettingsPolicy({ profileId, initialData, onSave, onCancel, onEditModeChange }: DeviceSettingsPolicyProps) {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(!initialData?.id);

    // Notify parent of edit mode changes
    useEffect(() => {
        onEditModeChange?.(isEditing);
    }, [isEditing, onEditModeChange]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(SETTING_CATEGORIES[0].key);

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
            onSave();
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete device settings'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // ====================================================================
    // VIEW MODE
    // ====================================================================
    if (!isEditing && initialData?.id) {
        const configuredSettings = SETTING_CATEGORIES.filter(c => settings[c.key] !== undefined);
        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Device Settings</h3>
                            <p className="text-sm text-muted-foreground">
                                {configuredSettings.length} setting{configuredSettings.length !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                    </div>
                </div>

                {configuredSettings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No device settings configured.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {configuredSettings.map(cat => {
                            const value = settings[cat.key];
                            return (
                                <div key={cat.key} className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-lg">{cat.icon}</div>
                                        <div>
                                            <span className="text-sm font-medium">{cat.title}</span>
                                            <p className="text-xs text-muted-foreground">{renderViewSummary(cat.key, value)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onCancel}>Close</Button>
                </div>
            </div>
        );
    }

    // ====================================================================
    // EDIT MODE — Master-Detail
    // ====================================================================
    const activeCat = filteredCategories.find(c => c.key === selectedCategory) || filteredCategories[0];

    return (
        <div className="flex flex-col h-[78vh] mt-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b shrink-0 pr-8">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-lg shadow-primary/5">
                        <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{initialData?.id ? 'Edit' : 'Create'} Device Settings</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Configure iOS device settings ({configuredCount} active)
                        </p>
                    </div>
                </div>
            </div>

            {/* Master-Detail */}
            <div className="flex flex-1 min-h-0 mt-4 gap-0 border rounded-lg overflow-hidden">
                {/* Left Panel */}
                <div className="w-[280px] shrink-0 border-r bg-gradient-to-b from-muted/30 to-muted/10 flex flex-col">
                    <div className="p-3 border-b bg-muted/20">
                        <div className="relative group/search">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within/search:text-blue-500" />
                            <Input
                                placeholder="Search settings..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs bg-background/80 border-border/50 focus:border-blue-500/50 focus:bg-background transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredCategories.map(cat => {
                            const isSelected = selectedCategory === cat.key;
                            const isConfigured = settings[cat.key] !== undefined && settings[cat.key] !== null;
                            return (
                                <div
                                    key={cat.key}
                                    className={cn(
                                        'group flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-all duration-200',
                                        isSelected
                                            ? 'bg-blue-500/10 dark:bg-blue-500/15 border-l-[3px] border-l-blue-500 shadow-[inset_0_0_20px_-12px_rgba(59,130,246,0.3)]'
                                            : 'hover:bg-muted/60 border-l-[3px] border-l-transparent hover:border-l-border'
                                    )}
                                    onClick={() => setSelectedCategory(cat.key)}
                                >
                                    <div className={cn("p-1.5 rounded-lg shrink-0", isConfigured ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-muted/50 text-muted-foreground")}>
                                        {cat.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("font-medium text-sm truncate transition-colors", isSelected && "text-blue-600 dark:text-blue-400")}>
                                            {cat.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{cat.description}</p>
                                    </div>
                                    {isConfigured && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                        {filteredCategories.length === 0 && searchQuery.trim() && (
                            <div className="text-center py-10 text-muted-foreground">
                                <Search className="w-5 h-5 opacity-50 mx-auto mb-2" />
                                <p className="text-xs font-medium">No matches for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                    {activeCat ? (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">{activeCat.icon}</div>
                                    <div>
                                        <h4 className="text-lg font-bold">{activeCat.title}</h4>
                                        <p className="text-sm text-muted-foreground">{activeCat.description}</p>
                                    </div>
                                </div>
                                {settings[activeCat.key] !== undefined && (
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeSetting(activeCat.key)}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                                    </Button>
                                )}
                            </div>

                            {renderCategoryEditor(activeCat.key, settings[activeCat.key], (val) => updateSetting(activeCat.key, val))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <p className="text-sm font-semibold">Select a setting category</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
                <Button variant="outline" onClick={initialData?.id ? () => setIsEditing(false) : onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="gap-2 min-w-[140px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Device Settings
                </Button>
            </div>
        </div>
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
    return (
        <div className="space-y-4">
            <div className="space-y-2 p-4 rounded-xl border bg-card/50">
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
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:shadow-sm transition-all">
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
    return (
        <div className="space-y-4">
            <div className="space-y-2 p-4 rounded-xl border bg-card/50">
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
    return (
        <div className="space-y-4">
            <div className="space-y-2 p-4 rounded-xl border bg-card/50">
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
            ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:shadow-sm transition-all">
                    <div>
                        <Label className="text-sm font-semibold">{opt.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    <Switch checked={opts[opt.key] ?? false} onCheckedChange={v => updateOpt(opt.key, v)} />
                </div>
            ))}
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
            {fields.map(f => (
                <div key={f.key} className="space-y-2 p-4 rounded-xl border bg-card/50">
                    <Label>{f.label}</Label>
                    <Input
                        placeholder={f.placeholder}
                        value={info[f.key] || ''}
                        onChange={e => updateField(f.key, e.target.value)}
                    />
                </div>
            ))}
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

    return (
        <div className="space-y-3">
            <div className="space-y-2 p-4 rounded-xl border bg-card/50">
                <Label htmlFor="textSize">Text Size (0-11)</Label>
                <Input
                    id="textSize"
                    type="number"
                    min={0}
                    max={11}
                    value={current.TextSize ?? 5}
                    onChange={e => updateField('TextSize', parseInt(e.target.value) || 0)}
                />
            </div>
            {boolFields.map(f => (
                <div key={f.key} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:shadow-sm transition-all">
                    <div>
                        <Label className="text-sm font-semibold">{f.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
                    <Switch
                        checked={(current[f.key] as boolean) ?? false}
                        onCheckedChange={v => updateField(f.key, v)}
                    />
                </div>
            ))}
        </div>
    );
}

function SharedDeviceEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
    const current = value || { Item: 'SharedDeviceConfiguration' };

    const updateField = (key: string, v: any) => {
        onChange({ ...current, [key]: v, Item: 'SharedDeviceConfiguration' });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-xl border bg-card/50">
                    <Label>Max Resident Users</Label>
                    <Input
                        type="number" min={1}
                        value={current.MaximumResidentUsers ?? ''}
                        onChange={e => updateField('MaximumResidentUsers', parseInt(e.target.value) || undefined)}
                    />
                </div>
                <div className="space-y-2 p-4 rounded-xl border bg-card/50">
                    <Label>Storage Quota (MB)</Label>
                    <Input
                        type="number" min={1}
                        value={current.QuotaSize ?? ''}
                        onChange={e => updateField('QuotaSize', parseInt(e.target.value) || undefined)}
                    />
                </div>
                <div className="space-y-2 p-4 rounded-xl border bg-card/50">
                    <Label>Temp Session Timeout (sec)</Label>
                    <Input
                        type="number" min={30}
                        value={current.TemporarySessionTimeout ?? ''}
                        onChange={e => updateField('TemporarySessionTimeout', parseInt(e.target.value) || undefined)}
                    />
                </div>
                <div className="space-y-2 p-4 rounded-xl border bg-card/50">
                    <Label>User Session Timeout (sec)</Label>
                    <Input
                        type="number" min={0}
                        value={current.UserSessionTimeout ?? ''}
                        onChange={e => updateField('UserSessionTimeout', parseInt(e.target.value) || undefined)}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                <div>
                    <Label className="text-sm font-semibold">Temporary Session Only</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Enable temporary session only mode</p>
                </div>
                <Switch checked={current.TemporarySessionOnly ?? false} onCheckedChange={v => updateField('TemporarySessionOnly', v)} />
            </div>
        </div>
    );
}
