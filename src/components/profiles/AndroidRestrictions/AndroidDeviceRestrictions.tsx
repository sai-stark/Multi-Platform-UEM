import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
import { AndroidProfileRestrictions } from '@/types/profile';
import {
    Bluetooth,
    Clock,
    Database,
    MapPin,
    Monitor,
    Phone,
    Settings,
    Shield,
    ShieldCheck,
    TabletSmartphone,
    WifiOff,
} from 'lucide-react';
import { useState , useEffect } from 'react';
import { useBaseDialogContext } from '@/components/common/BaseDialogContext';
import { ConnectivityRestriction } from './ConnectivityRestriction';
import { DateTimeRestriction } from './DateTimeRestriction';
import { DisplayRestriction } from './DisplayRestriction';
import { KioskRestriction } from './KioskRestriction';
import { LocationRestriction } from './LocationRestriction';
import { MiscellaneousRestriction } from './MiscellaneousRestriction';
import { NetworkRestriction } from './NetworkRestriction';
import { PhoneRestriction } from './PhoneRestriction';
import { SecurityRestriction } from './SecurityRestriction';
import { SyncStorageRestriction } from './SyncStorageRestriction';
import { TetheringRestriction } from './TetheringRestriction';

const CATEGORIES = [
    { key: 'security',      title: 'Security',       desc: 'Safe settings, dev mode, third-party apps', icon: <Shield className="w-5 h-5" />, color: 'text-red-500' },
    { key: 'network',       title: 'Network',         desc: 'Airplane mode, roaming, VPN, Wi-Fi',        icon: <WifiOff className="w-5 h-5" />, color: 'text-blue-500' },
    { key: 'location',      title: 'Location',        desc: 'GPS and location services',                 icon: <MapPin className="w-5 h-5" />, color: 'text-green-500' },
    { key: 'miscellaneous', title: 'Miscellaneous',   desc: 'System-level controls, factory reset',      icon: <Settings className="w-5 h-5" />, color: 'text-amber-500' },
    { key: 'kiosk',         title: 'Kiosk',           desc: 'Navigation, status bar, kiosk mode',        icon: <TabletSmartphone className="w-5 h-5" />, color: 'text-purple-500' },
    { key: 'tethering',     title: 'Tethering',       desc: 'Bluetooth & Wi-Fi tethering',               icon: <Bluetooth className="w-5 h-5" />, color: 'text-cyan-500' },
    { key: 'phone',         title: 'Phone',           desc: 'SMS and call restrictions',                 icon: <Phone className="w-5 h-5" />, color: 'text-orange-500' },
    { key: 'datetime',      title: 'Date / Time',     desc: 'Date and time settings',                    icon: <Clock className="w-5 h-5" />, color: 'text-indigo-500' },
    { key: 'display',       title: 'Display',         desc: 'Screen timeout, brightness',                icon: <Monitor className="w-5 h-5" />, color: 'text-pink-500' },
    { key: 'storage',       title: 'Storage',         desc: 'USB access, external media',                icon: <Database className="w-5 h-5" />, color: 'text-teal-500' },
    { key: 'connectivity',  title: 'Connectivity',    desc: 'Bluetooth, NFC, printing',                  icon: <Bluetooth className="w-5 h-5" />, color: 'text-lime-500' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

interface AndroidDeviceRestrictionsProps {
    platform: Platform;
    profileId: string;
    restrictions: AndroidProfileRestrictions | undefined;
    onSave: () => void;
    onCancel: () => void;
}

export function AndroidDeviceRestrictions({
    platform,
    profileId,
    restrictions,
    onSave,
    onCancel,
}: AndroidDeviceRestrictionsProps) {
    const { registerSave, setLoading: setContextLoading, setSaveDisabled } = useBaseDialogContext();
    const [selectedKey, setSelectedKey] = useState<CategoryKey>('security');

    return (
        <div className="flex flex-col h-[78vh]">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b shrink-0 pr-8">
                <div className="p-2.5 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl shadow-lg shadow-destructive/5">
                    <ShieldCheck className="w-5 h-5 text-destructive" />
                </div>
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Device Restrictions</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Configure allowed features and limitations for this Android profile
                    </p>
                </div>
            </div>

            {/* Master-Detail Layout */}
            <div className="flex flex-1 min-h-0 mt-4 gap-0 border rounded-lg overflow-hidden">
                {/* Left Panel — Category List */}
                <div className="w-[260px] shrink-0 border-r bg-gradient-to-b from-muted/30 to-muted/10 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        {CATEGORIES.map(cat => {
                            const isSelected = selectedKey === cat.key;
                            return (
                                <div
                                    key={cat.key}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-all duration-200',
                                        isSelected
                                            ? 'bg-blue-500/10 dark:bg-blue-500/15 border-l-[3px] border-l-blue-500 shadow-[inset_0_0_20px_-12px_rgba(59,130,246,0.3)]'
                                            : 'hover:bg-muted/60 border-l-[3px] border-l-transparent hover:border-l-border'
                                    )}
                                    onClick={() => setSelectedKey(cat.key)}
                                >
                                    <span className={cn('shrink-0', isSelected ? 'text-blue-500' : cat.color)}>
                                        {cat.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn('font-medium text-sm truncate transition-colors', isSelected && 'text-blue-600 dark:text-blue-400')}>
                                            {cat.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                            {cat.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel — Selected Restriction Component */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50 overflow-y-auto p-6">
                    {selectedKey === 'security' && (
                        <SecurityRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.security}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-security"
                        />
                    )}
                    {selectedKey === 'network' && (
                        <NetworkRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.network}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-network"
                        />
                    )}
                    {selectedKey === 'location' && (
                        <LocationRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.location}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-location"
                        />
                    )}
                    {selectedKey === 'miscellaneous' && (
                        <MiscellaneousRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.miscellaneous}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-miscellaneous"
                        />
                    )}
                    {selectedKey === 'kiosk' && (
                        <KioskRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.kiosk}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-kiosk"
                        />
                    )}
                    {selectedKey === 'tethering' && (
                        <TetheringRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.tethering}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-tethering"
                        />
                    )}
                    {selectedKey === 'phone' && (
                        <PhoneRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.phone}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-phone"
                        />
                    )}
                    {selectedKey === 'datetime' && (
                        <DateTimeRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.dateTime}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-datetime"
                        />
                    )}
                    {selectedKey === 'display' && (
                        <DisplayRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.display}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-display"
                        />
                    )}
                    {selectedKey === 'storage' && (
                        <SyncStorageRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.syncStorage}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-storage"
                        />
                    )}
                    {selectedKey === 'connectivity' && (
                        <ConnectivityRestriction
                            platform={platform}
                            profileId={profileId}
                            initialData={restrictions?.connectivity}
                            onSave={onSave}
                            onCancel={onCancel}
                            hideFooter
                            formId="ar-connectivity"
                        />
                    )}
                </div>
            </div>

            {/* Footer — Save/Cancel outside, matching iOS layout */}
            <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form={`ar-${selectedKey}`}
                    className="gap-2 min-w-[140px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
