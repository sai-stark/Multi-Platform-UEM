
import { DeviceService } from '@/api/services/devices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { getAssetUrl } from '@/config/env';
import { cn } from '@/lib/utils';
import { DeviceInfo, Platform } from '@/types/models';
import {
    ArrowLeft,
    Barcode,
    Battery,
    Bluetooth,
    Building2,
    Calendar,
    ChevronDown,
    Cloud,
    Cpu,
    FileText,
    Globe,
    HardDrive,
    Hash,
    Layout,
    Lock,
    MapPin,

    Monitor,
    Network,
    Power,
    Radio,
    RefreshCw,
    ScanBarcode,
    Settings,
    Shield,
    ShieldAlert,

    Smartphone,
    Tag,
    Trash2,
    User,
    Wifi
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data for development/preview
const mockDevice: DeviceInfo = {
    id: '1',
    udid: '00008030-001A2B3C4D5E6F',
    serialNo: 'C02XD12345',
    macAddress: '00:1A:2B:3C:4D:5E',
    imei: '354890061234567',
    model: 'Pixel 7 Pro',
    osVersion: '14.0',
    platform: 'android',
    enrollmentTime: '2024-03-15T10:30:00Z',
    lastSyncTime: '2024-03-20T14:45:00Z',
    status: 'active',
    userEmail: 'employee@company.com'
};

export default function DeviceDetails() {
    const { platform, id } = useParams<{ platform: string; id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [device, setDevice] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDevice = async () => {
        setLoading(true);
        try {
            if (platform && id) {
                const data = await DeviceService.getDevice(platform as Platform, id);
                setDevice(data);
            }
        } catch (error) {
            console.error("Failed to fetch device", error);
            toast({
                title: "Error",
                description: "Failed to fetch device details.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevice();
    }, [id, platform]);

    const handleAction = async (action: string, label: string) => {
        if (!device || !device.id) return;

        toast({
            title: "Action Initiated",
            description: `Sending ${label} command to device...`,
        });

        try {
            // Mapping actions to service calls
            // Note: Actions require platform which might be missing in restricted API response, 
            // but we can use the URL param 'platform' or try to infer.
            // Using logic from Devices.tsx mapping:
            const devicePlatform = (device.platform || platform || 'android') as Platform;

            switch (action) {
                case 'reboot':
                    await DeviceService.rebootDevice(devicePlatform, device.id);
                    break;
                case 'sync':
                    await DeviceService.syncDevice(device.id);
                    break;
                case 'lock':
                    await DeviceService.lockDevice(devicePlatform, device.id);
                    break;
                case 'factory_reset':
                    if (confirm("Are you sure you want to factory reset this device? This action is irreversible.")) {
                        await DeviceService.factoryResetDevice(devicePlatform, device.id);
                    } else {
                        return; // Cancelled
                    }
                    break;
                case 'gps':
                    await DeviceService.getGPS(device.id);
                    break;
            }
            toast({
                title: "Success",
                description: `Command ${label} sent successfully.`,
            });
        } catch (error) {
            console.error(`Failed to execute ${action} `, error);
            toast({
                title: "Action Failed",
                description: "Could not send command to device. Check console/network.",
                variant: "destructive"
            });
        }
    };

    const getPlatformIcon = (plat?: string) => {
        const p = plat?.toLowerCase();
        let assetSrc = null;

        if (p === 'android') assetSrc = getAssetUrl('/Assets/android.png');
        else if (p === 'ios' || p === 'macos') assetSrc = getAssetUrl('/Assets/apple.png');
        else if (p === 'windows') assetSrc = getAssetUrl('/Assets/microsoft.png');

        if (assetSrc) {
            return <img src={assetSrc} alt={plat} className="w-16 h-16 object-contain" />;
        }

        switch (p) {
            case 'linux': return <Monitor className="w-12 h-12 text-orange-500" />;
            default: return <Layout className="w-12 h-12 text-primary" />;
        }
    };

    // Helper for formatting bytes to GB/MB
    const formatBytes = (bytes?: number) => {
        if (bytes === undefined || bytes === null) return '-';
        if (bytes === 0) return '0 B';
        // Assume input might be bytes if large, or GB if small (based on previous logic/mock).
        // Let's stick to the previous mock assumption that values are in GB for now, 
        // but label it clearly or handle "0.x" as likely GB.
        // If the value is > 10000, it's probably MB or KB? 
        // Reverting to simple string append for consistency with previous mock data approach.
        return `${bytes} GB`;
    };

    // Helper for Battery Color
    const getBatteryColor = (level?: number) => {
        if (level === undefined) return 'text-muted-foreground';
        if (level <= 20) return 'text-destructive';
        if (level <= 50) return 'text-warning';
        return 'text-success';
    };

    const InfoRow = ({ label, value, className, icon: Icon }: { label: string, value: React.ReactNode, className?: string, icon?: React.ElementType }) => (
        <div className={cn("flex items-start gap-3", className)}>
            {Icon && (
                <div className="mt-1 p-1.5 rounded-md bg-muted/50 shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
            )}
            <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className="text-sm font-medium text-foreground truncate block" title={typeof value === 'string' ? value : undefined}>
                    {value || '-'}
                </span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    Loading device details...
                </div>
            </MainLayout>
        );
    }

    if (!device) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <h2 className="text-xl font-semibold">Device Not Found</h2>
                    <Button onClick={() => navigate('/devices')}>Back to Devices</Button>
                </div>
            </MainLayout>
        );
    }

    // Ensure we have fallback for boolean checks if they are undefined in type (though we just added them)
    const isTethered = device.isNetworkTethered ?? false;
    const isRoaming = device.dataRoamingEnabled ?? false;

    return (
        <MainLayout>
            <div className="space-y-6 pb-10">
                {/* Top Navigation */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/devices')} className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Devices
                    </Button>
                </div>

                {/* Hero / Header Section */}
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between bg-card p-6 rounded-xl border shadow-sm">
                    <div className="flex gap-6">
                        {/* Device Icon / Image Placeholder */}
                        {/* <div className="w-24 h-24 rounded-2xl bg-muted/30 border flex items-center justify-center shrink-0 p-4"> */}
                        {getPlatformIcon(device.platform)}
                        {/* </div> */}

                        {/* Title & Key Identity */}
                        <div className="space-y-2">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {device.deviceName || device.model || 'Unknown Device'}
                                </h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <span className="font-medium text-foreground">{device.modelName || device.model}</span>
                                    <span>•</span>
                                    <span>{device.opSysInfo?.name || device.platform} {device.osVersion}</span>
                                    {device.buildVersion && (
                                        <>
                                            <span>•</span>
                                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                                                Build {device.buildVersion}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm pt-2">
                                <Badge variant={device.status === 'ONLINE' || device.connectionStatus === 'online' ? 'default' : 'secondary'} className={cn(
                                    "px-3 py-1 gap-1.5",
                                    (device.status === 'ONLINE' || device.connectionStatus === 'online') ? "bg-success hover:bg-success/90" : "bg-muted-foreground/50"
                                )}>
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    {device.connectionStatus === 'online' ? 'Online' : 'Offline'}
                                </Badge>

                                <Badge variant="outline" className={cn(
                                    "px-3 py-1 border-transparent bg-opacity-10",
                                    device.complianceStatus === 'compliant' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                )}>
                                    {device.complianceStatus === 'compliant' ? <Shield className="w-3 h-3 mr-1.5" /> : <ShieldAlert className="w-3 h-3 mr-1.5" />}
                                    {device.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                                </Badge>

                                {device.isSupervised && (
                                    <Badge variant="secondary" className="px-3 py-1 bg-purple-500/10 text-purple-600 border-purple-200">
                                        Supervised
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Toolbar */}
                    <div className="flex items-center gap-2 self-start md:self-center">
                        <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
                            <Button variant="ghost" size="sm" onClick={() => handleAction('sync', 'Sync')} title="Sync Device">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleAction('lock', 'Lock')} title="Lock Device">
                                <Lock className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleAction('reboot', 'Reboot')} title="Reboot Device">
                                <Power className="w-4 h-4" />
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    More Actions
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Management</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleAction('gps', 'Get GPS')}>
                                    <MapPin className="w-4 h-4 mr-2" /> Locate Device
                                </DropdownMenuItem>
                                {device.platform === 'ios' && (
                                    <DropdownMenuItem onClick={() => handleAction('clear_passcode', 'Clear Passcode')}>
                                        <Shield className="w-4 h-4 mr-2" /> Clear Passcode
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleAction('factory_reset', 'Factory Reset')}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Factory Reset
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg bg-opacity-10", getBatteryColor(device.batteryLevel).replace('text-', 'bg-'))}>
                                <Battery className={cn("w-6 h-6", getBatteryColor(device.batteryLevel))} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Battery</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold">{device.batteryLevel ?? '-'}%</span>
                                    {device.isBatteryCharging && <span className="text-xs text-success animate-pulse">Charging</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <HardDrive className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Storage</p>
                                <p className="text-2xl font-bold">{formatBytes(device.storageUsed)} <span className="text-sm font-normal text-muted-foreground">/ {formatBytes(device.storageCapacity || device.deviceCapacity)}</span></p>
                                {/* Simple Progress Bar */}
                                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${Math.min(100, ((device.storageUsed || 0) / (device.storageCapacity || device.deviceCapacity || 1)) * 100)}% ` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Cpu className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">RAM</p>
                                <p className="text-2xl font-bold">{device.ramUsed || '-'} <span className="text-sm font-normal text-muted-foreground">/ {device.ramCapacity || '-'} GB</span></p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-zinc-500/10">
                                <Radio className="w-6 h-6 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                                <p className="text-lg font-bold truncate">
                                    {device.lastSyncTime ? new Date(device.lastSyncTime).toLocaleDateString() : '-'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {device.lastSyncTime ? new Date(device.lastSyncTime).toLocaleTimeString() : ''}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Info Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Identity Card */}
                    <Card className="md:col-span-1 border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Smartphone className="w-5 h-5 text-primary" />
                                Device Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <InfoRow label="Serial Number" value={<span className="font-mono">{device.serialNo}</span>} icon={Barcode} />
                            <InfoRow label="UDID" value={<span className="font-mono break-all text-xs">{device.udid}</span>} icon={Hash} />
                            <InfoRow label="IMEI" value={<span className="font-mono">{device.imei || (device.imeis?.join(', '))}</span>} icon={ScanBarcode} />
                            <InfoRow label="Manufacturer" value={device.manufacturer || device.modelInfo?.manufacturer} icon={Building2} />
                            <InfoRow label="Model Identifier" value={device.modelInfo?.modelName || device.model} icon={Smartphone} />
                            <InfoRow label="Product Name" value={device.productName} icon={Tag} />
                        </CardContent>
                    </Card>

                    {/* Network Card */}
                    <Card className="md:col-span-1 border-l-4 border-l-info">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Wifi className="w-5 h-5 text-info" />
                                Connectivity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <InfoRow label="WiFi IP Address" value={<span className="font-mono">{device.wifiInfo?.ipAddress}</span>} icon={Globe} />
                            <InfoRow label="WiFi MAC" value={<span className="font-mono">{device.wifiMAC || device.wifiInfo?.macId}</span>} icon={Network} />
                            <InfoRow label="Bluetooth MAC" value={<span className="font-mono">{device.bluetoothMAC}</span>} icon={Bluetooth} />
                            <InfoRow label="Current SSID" value={device.wifiInfo?.ssid} icon={Wifi} />
                            <div className="flex gap-4 pt-2 pl-[3.25rem]">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className={cn("w-2 h-2 rounded-full", isTethered ? "bg-success" : "bg-muted")} />
                                    Tethering
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className={cn("w-2 h-2 rounded-full", isRoaming ? "bg-success" : "bg-muted")} />
                                    Roaming
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & OS Card */}
                    <Card className="md:col-span-1 border-l-4 border-l-indigo-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                Security & OS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="OS Version" value={device.osVersion} icon={Layout} />
                                <InfoRow label="Build Version" value={device.buildVersion} icon={Settings} />
                            </div>
                            <InfoRow label="Supervised" value={device.isSupervised ? 'Yes' : 'No'} icon={Shield} />
                            <InfoRow label="Locator Service" value={device.isDeviceLocatorServiceEnabled ? 'Enabled' : 'Disabled'} icon={MapPin} />
                            <InfoRow label="Do Not Disturb" value={device.isDoNotDisturbInEffect ? 'Active' : 'Inactive'} icon={Cloud} />
                            <div className="pt-2 pl-[3.25rem]">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Effective Policies</span>
                                <div className="flex flex-wrap gap-2">
                                    {/* Placeholder mainly, would probably loop policies if array existed */}
                                    <Badge variant="outline">Passcode</Badge>
                                    <Badge variant="outline">WiFi</Badge>
                                    <Badge variant="outline">Email</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ownership & Enrollment */}
                    <Card className="md:col-span-1 xl:col-span-3 border-l-4 border-l-emerald-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5 text-emerald-500" />
                                Enrollment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoRow label="Enrolled User" value={device.userEmail || device.deviceUser} icon={User} />
                            <InfoRow label="Organization" value={device.organizationName} icon={Building2} />
                            <InfoRow label="Enrollment Date" value={device.enrollmentTime ? new Date(device.enrollmentTime).toLocaleString() : '-'} icon={Calendar} />
                            <InfoRow label="Last Sync" value={device.lastSyncTime ? new Date(device.lastSyncTime).toLocaleString() : '-'} icon={RefreshCw} />
                            <InfoRow label="Creation Time" value={device.creationTime ? new Date(device.creationTime).toLocaleString() : '-'} icon={FileText} />
                        </CardContent>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
}
