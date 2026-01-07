
import { DeviceService } from '@/api/services/devices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { getAssetUrl } from '@/config/env';
import { cn } from '@/lib/utils';
import { DeviceApplicationList, DeviceInfo, FullProfile, Platform } from '@/types/models';
import {
    Activity,
    AppWindow,
    ArrowLeft,
    Barcode,
    Battery,
    BatteryCharging,
    Bluetooth,
    HardDrive as Chip,
    Cpu,
    Database,
    FileText,
    Gauge,
    Globe,
    Layers,
    Lock,
    MapPin,
    MessagesSquare,
    MoreVertical,
    Network,
    Power,
    RefreshCw,
    ScanBarcode,
    Settings,
    Shield,
    ShieldAlert,
    Signal,
    Smartphone,
    Sun,
    Tablet,
    Trash2,
    Unlock,
    User,
    Wifi
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DeviceDetails() {
    const { platform, id } = useParams<{ platform: string; id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [device, setDevice] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: string | null; label: string; requiredText: string }>({
        isOpen: false,
        action: null,
        label: '',
        requiredText: ''
    });
    const [confirmInput, setConfirmInput] = useState('');

    const [applications, setApplications] = useState<DeviceApplicationList>([]);
    const [effectiveProfile, setEffectiveProfile] = useState<FullProfile | null>(null);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [loadingApps, setLoadingApps] = useState(false);

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
        if (device && platform && id) {
            // Load extra details
            const loadExtras = async () => {
                try {
                    setLoadingApps(true);
                    const apps = await DeviceService.getDeviceApplications(platform as Platform, id);
                    setApplications(apps || []);
                } catch (e) {
                    console.error("Failed to load apps", e);
                } finally {
                    setLoadingApps(false);
                }

                try {
                    const profile = await DeviceService.getEffectiveProfile(platform as Platform, id);
                    setEffectiveProfile(profile);
                } catch (e) {
                    console.error("Failed to load profile", e);
                }
            };
            loadExtras();
        }
    }, [device]);

    useEffect(() => {
        fetchDevice();
    }, [id, platform]);

    const handleAction = async (action: string, label: string) => {
        if (!device || !device.id) return;

        // Intercept critical actions
        if (action === 'reboot' || action === 'factory_reset') {
            setConfirmDialog({
                isOpen: true,
                action: action,
                label: label,
                requiredText: action === 'reboot' ? 'REBOOT' : 'RESET'
            });
            setConfirmInput('');
            return;
        }

        executeAction(action, label);
    };

    const executeAction = async (action: string, label: string) => {
        if (!device || !device.id) return;

        toast({
            title: "Action Initiated",
            description: `Sending ${label} command to device...`,
        });

        try {
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
                    await DeviceService.factoryResetDevice(devicePlatform, device.id);
                    break;
                case 'gps':
                    await DeviceService.getGPS(device.id);
                    break;
                case 'clear_passcode':
                    await DeviceService.removePassCode(device.id);
                    break;
                case 'remove_restriction_password':
                    await DeviceService.removeRestrictionPassword(device.id);
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

    const handleConfirm = () => {
        if (confirmDialog.action && confirmInput === confirmDialog.requiredText) {
            executeAction(confirmDialog.action, confirmDialog.label);
            setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
    };

    const getPlatformIcon = (plat?: string) => {
        const p = plat?.toLowerCase() || '';
        let assetSrc = null;

        if (p === 'android' || p.includes('android')) assetSrc = getAssetUrl('/Assets/android.png');
        else if (p === 'ios' || p === 'iosdeviceinfo') assetSrc = getAssetUrl('/Assets/apple.png');
        else if (p === 'macos') assetSrc = getAssetUrl('/Assets/mac_os.png');
        else if (p === 'windows') assetSrc = getAssetUrl('/Assets/microsoft.png');
        else if (p === 'linux') assetSrc = getAssetUrl('/Assets/linux.png');

        if (assetSrc) {
            return <img src={assetSrc} alt={plat} className="w-16 h-16 object-contain" />;
        }

        return <Smartphone className="w-12 h-12 text-primary" />;
    };

    // Helper for formatting bytes
    const formatBytes = (bytes?: number | string) => {
        if (bytes === undefined || bytes === null || bytes === '') return '-';
        const num = typeof bytes === 'string' ? parseInt(bytes) : bytes;
        if (isNaN(num)) return bytes.toString();

        if (num === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(num) / Math.log(k));
        return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getBatteryColor = (level?: number) => {
        if (level === undefined || level < 0) return 'text-muted-foreground';
        if (level <= 20) return 'text-destructive';
        if (level <= 50) return 'text-yellow-500';
        return 'text-green-500';
    };

    const InfoRow = ({ label, value, className, icon: Icon, subValue, copyable }: { label: string, value: React.ReactNode, className?: string, icon?: React.ElementType, subValue?: string, copyable?: boolean }) => (
        <div className={cn("flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors", className)}>
            {Icon && (
                <div className="mt-1 p-2 rounded-md bg-primary/10 shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            )}
            <div className="flex flex-col gap-0.5 overflow-hidden w-full">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate block" title={typeof value === 'string' ? value : undefined}>
                        {value}
                        {value === undefined || value === null || value === '' ? '-' : ''}
                    </span>
                    {copyable && value && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                                navigator.clipboard.writeText(String(value));
                                toast({ description: "Copied to clipboard" });
                            }}
                        >
                            <FileText className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
            </div>
        </div>
    );

    const BooleanStatus = ({ label, value, trueLabel = "Enabled", falseLabel = "Disabled", invertColor = false }: { label: string, value?: boolean, trueLabel?: string, falseLabel?: string, invertColor?: boolean }) => {
        const isTrue = !!value;
        const isPositive = invertColor ? !isTrue : isTrue;

        return (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <span className="text-sm font-medium">{label}</span>
                <Badge variant={isPositive ? "default" : "secondary"} className={cn(
                    "font-normal",
                    isPositive ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200" : "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200"
                )}>
                    {isTrue ? trueLabel : falseLabel}
                </Badge>
            </div>
        );
    };

    const SectionHeader = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
        </div>
    );

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Loading device details...</p>
                </div>
            </MainLayout>
        );
    }

    if (!device) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
                    <div className="p-4 rounded-full bg-muted">
                        <Smartphone className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Device Not Found</h2>
                    <Button onClick={() => navigate('/devices')}>Back to Devices</Button>
                </div>
            </MainLayout>
        );
    }

    // Calculations
    const storagePercent = Math.min(100, ((Number(device.storageUsed || device.usedStorage) || 0) / (Number(device.storageCapacity || device.totalStorage || device.deviceCapacity) || 1)) * 100);
    const ramPercent = Math.min(100, ((Number(device.ramUsed || device.usedRam) || 0) / (Number(device.ramCapacity || device.totalRam) || 1)) * 100);

    return (
        <MainLayout>
            <div className="space-y-6 pb-20 max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <Button variant="ghost" size="sm" onClick={() => navigate('/devices')} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Devices
                </Button>

                {/* Header Card */}
                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="flex gap-6 items-start">
                            <div className="p-4 rounded-xl bg-muted/30 border">
                                {getPlatformIcon(device.deviceType || device.platform)}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {device.deviceName || device.model || 'Unknown Device'}
                                    </h1>
                                    <Badge variant={device.status === 'ONLINE' || device.connectionStatus === 'online' ? 'default' : 'secondary'} className={cn(
                                        "h-6 gap-1.5",
                                        (device.status === 'ONLINE' || device.connectionStatus === 'online') ? "bg-green-500 hover:bg-green-600" : "bg-zinc-500"
                                    )}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        {device.connectionStatus === 'online' || device.status === 'ONLINE' ? 'Online' : 'Offline'}
                                    </Badge>
                                </div>

                                <p className="text-lg font-medium text-foreground">{device.modelName || device.model}</p>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted">
                                        {device.opSysInfo?.name || (device.platform?.toUpperCase())} {device.osVersion || device.androidVersion}
                                    </span>
                                    {device.buildVersion && (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted font-mono text-xs">
                                            Build: {device.buildVersion}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Badge variant="outline" className={cn(
                                        "gap-1",
                                        device.complianceStatus === 'compliant' ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"
                                    )}>
                                        {device.complianceStatus === 'compliant' ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                        {device.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                                    </Badge>

                                    {device.isSupervised && (
                                        <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200 bg-purple-50">
                                            <Layers className="w-3 h-3" /> Supervised
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                            <Button variant="outline" size="sm" onClick={() => handleAction('sync', 'Sync')} className="gap-2">
                                <RefreshCw className="w-4 h-4" /> Sync
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleAction('reboot', 'Reboot')} className="gap-2">
                                <Power className="w-4 h-4" /> Reboot
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleAction('lock', 'Lock')}>
                                        <Lock className="w-4 h-4 mr-2" /> Lock Device
                                    </DropdownMenuItem>
                                    {device.platform === 'ios' && (
                                        <DropdownMenuItem onClick={() => handleAction('clear_passcode', 'Clear Passcode')}>
                                            <Unlock className="w-4 h-4 mr-2" /> Clear Passcode
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleAction('factory_reset', 'Factory Reset')}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Factory Reset
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {platform === 'ios' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleAction('clear_passcode', 'Clear Passcode')}>
                                                <Unlock className="w-4 h-4 mr-2" /> Clear Passcode
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('remove_restriction_password', 'Remove Restriction Password')}>
                                                <Unlock className="w-4 h-4 mr-2" /> Clear Restriction Pwd
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Tabs for detailed info */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-card border w-full h-auto p-1 flex flex-nowrap overflow-x-auto gap-2">
                        <TabsTrigger value="overview" className="gap-2 px-4 py-2 w-full">
                            <Activity className="w-4 h-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="hardware" className="gap-2 px-4 py-2 w-full">
                            <Chip className="w-4 h-4" /> Hardware
                        </TabsTrigger>
                        <TabsTrigger value="network" className="gap-2 px-4 py-2 w-full">
                            <Network className="w-4 h-4" /> Network
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="gap-2 px-4 py-2 w-full">
                            <AppWindow className="w-4 h-4" /> Applications
                        </TabsTrigger>
                        <TabsTrigger value="system" className="gap-2 px-4 py-2 w-full">
                            <Cpu className="w-4 h-4" /> System
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 px-4 py-2 w-full">
                            <Settings className="w-4 h-4" /> Settings
                        </TabsTrigger>
                        <TabsTrigger value="user" className="gap-2 px-4 py-2 w-full">
                            <User className="w-4 h-4" /> User
                        </TabsTrigger>
                        <TabsTrigger value="effective-profile" className="gap-2 px-4 py-2 w-full">
                            <FileText className="w-4 h-4" /> Effective Profile
                        </TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Battery Status */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Battery className="w-4 h-4" /> Battery
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const raw = device.batteryLevel;
                                        const normalized = (raw !== undefined && raw !== null && raw >= 0)
                                            ? (raw <= 1 ? Math.round(raw * 100) : Math.round(raw))
                                            : -1;
                                        return (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("text-4xl font-bold", getBatteryColor(normalized))}>
                                                        {normalized >= 0 ? normalized : '-'}%
                                                    </div>
                                                    <div className="space-y-1">
                                                        {device.isBatteryCharging && (
                                                            <Badge variant="outline" className="gap-1 text-green-600 bg-green-50 border-green-200">
                                                                <BatteryCharging className="w-3 h-3" /> Charging
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Progress value={normalized >= 0 ? normalized : 0} className="mt-4 h-2" />
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>

                            {/* Storage */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Database className="w-4 h-4" /> Storage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-2xl font-bold">{formatBytes(device.storageUsed || device.usedStorage)}</span>
                                        <span className="text-sm text-muted-foreground">of {formatBytes(device.storageCapacity || device.totalStorage || device.deviceCapacity)}</span>
                                    </div>
                                    <Progress value={storagePercent} className="h-2 mb-2" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Used: {Math.round(storagePercent)}%</span>
                                        <span>Free: {formatBytes(device.freeStorage || (device.availableDeviceCapacity))}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* RAM (Android mainly) */}
                            {(device.ramCapacity || device.totalRam) && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Gauge className="w-4 h-4" /> RAM
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-2xl font-bold">{formatBytes(device.ramUsed || device.usedRam)}</span>
                                            <span className="text-sm text-muted-foreground">of {formatBytes(device.ramCapacity || device.totalRam)}</span>
                                        </div>
                                        <Progress value={ramPercent} className="h-2 mb-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Used: {Math.round(ramPercent)}%</span>
                                            <span>Free: {formatBytes(device.freeRam)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Identity" icon={Smartphone} />
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <InfoRow label="Serial Number" value={device.serialNo} icon={Barcode} copyable />
                                    <InfoRow label="IMEI" value={device.imei || (device.imeis?.map(i => i.imei).join(', '))} icon={ScanBarcode} copyable />
                                    <InfoRow label="UDID / ID" value={device.udid || device.id} icon={Chip} copyable />
                                    <InfoRow label="Model Identifier" value={device.model} icon={Smartphone} />
                                    <InfoRow label="Manufacturer" value={device.manufacturer || device.modelInfo?.manufacturer} icon={Layers} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Network Summary" icon={Wifi} />
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <InfoRow label="Wi-Fi MAC" value={device.wifiMAC || device.wifiInfo?.macId || device.macAddress} icon={Network} copyable />
                                    <InfoRow label="Bluetooth MAC" value={device.bluetoothMAC} icon={Bluetooth} copyable />
                                    <InfoRow label="IP Address" value={device.ipAddress || device.wifiInfo?.ipAddress || (device.simInfos && device.simInfos[0]?.ipAddress)} icon={Globe} />
                                    {device.wifiInfo && (
                                        <InfoRow label="Connected SSID" value={device.wifiInfo.ssid} icon={Wifi} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* HARDWARE TAB */}
                    <TabsContent value="hardware" className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <SectionHeader title="Device Info" icon={Smartphone} />
                                    <InfoRow label="Model Name" value={device.modelName || device.modelInfo?.modelName} />
                                    <InfoRow label="Product Name" value={device.productName || device.modelInfo?.productName} />
                                    <InfoRow label="Manufacturer" value={device.manufacturer || device.modelInfo?.manufacturer} />
                                    <InfoRow label="Model Number" value={device.modelNumber} />
                                    <InfoRow label="Device Type" value={device.deviceType || device.modelInfo?.deviceType} />
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader title="Processor & Storage" icon={Cpu} />
                                    <InfoRow label="CPU Architecture" value={device.cpuArch || device.cpu} />
                                    <InfoRow label="Device Capacity" value={formatBytes(device.deviceCapacity || device.storageCapacity)} subValue={device.storageCapacity ? 'Total Storage' : undefined} />
                                    <InfoRow label="RAM" value={formatBytes(device.ramCapacity || device.totalRam)} />
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader title="Hardware Features" icon={Layers} />
                                    <BooleanStatus label="GPS" value={device.gpsStatus} />
                                    <BooleanStatus label="Bluetooth" value={device.bluetooth} />
                                    <BooleanStatus label="NFC" value={device.nfcStatus} />
                                    <BooleanStatus label="Audio/Volume Control" value={device.volume !== undefined} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NETWORK TAB */}
                    <TabsContent value="network" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Wi-Fi Information" icon={Wifi} />
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <BooleanStatus label="Wi-Fi Enabled" value={device.wifi} />
                                    <InfoRow label="MAC Address" value={device.wifiMAC || device.wifiInfo?.macId} />
                                    {device.wifiInfo && (
                                        <>
                                            <InfoRow label="SSID" value={device.wifiInfo.ssid} />
                                            <InfoRow label="IP Address" value={device.wifiInfo.ipAddress} />
                                            <InfoRow label="Signal Strength (RSSI)" value={device.wifiInfo.rssi} />
                                            <InfoRow label="Link Speed" value={device.wifiInfo.linkSpeed} subValue="Mbps" />
                                            <InfoRow label="Frequency" value={device.wifiInfo.frequency} subValue="MHz" />
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Cellular" icon={Signal} />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <BooleanStatus label="Mobile Data" value={device.mobileData} />
                                    {/* Android SIMs */}
                                    {device.simInfos?.map((sim, idx) => (
                                        <div key={idx} className="p-4 rounded-lg bg-muted/20 border">
                                            <p className="font-semibold text-sm mb-2">SIM Slot {idx + 1}</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <InfoRow label="Carrier" value={sim.carrierNetwork} />
                                                <InfoRow label="Phone" value={sim.phoneNumber} />
                                                <InfoRow label="IMEI" value={sim.imei} />
                                                <InfoRow label="Roaming" value={sim.isRoaming ? 'Yes' : 'No'} />
                                                <InfoRow label="Data Active" value={sim.isDataTxOn ? 'Yes' : 'No'} />
                                            </div>
                                        </div>
                                    ))}

                                    {/* iOS Service Subscriptions */}
                                    {device.serviceSubscriptions?.map((sub, idx) => (
                                        <div key={idx} className="p-4 rounded-lg bg-muted/20 border">
                                            <p className="font-semibold text-sm mb-2">Service Subscription {idx + 1} ({sub.slot})</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <InfoRow label="Carrier" value={sub.currentCarrierNetwork} />
                                                <InfoRow label="Phone" value={sub.phoneNumber} />
                                                <InfoRow label="ICCID" value={sub.iccId} />
                                                <InfoRow label="Data Preferred" value={sub.isDataPreferred ? 'Yes' : 'No'} />
                                                <InfoRow label="Voice Preferred" value={sub.isVoicePreferred ? 'Yes' : 'No'} />
                                                <InfoRow label="Roaming" value={sub.isRoaming ? 'Yes' : 'No'} />
                                            </div>
                                        </div>
                                    ))}

                                    {(!device.simInfos?.length && !device.serviceSubscriptions?.length) && (
                                        <p className="text-muted-foreground text-sm italic">No cellular information available.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* APPLICATIONS TAB */}
                    <TabsContent value="applications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Installed Applications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>App Name</TableHead>
                                            <TableHead>Identifier / Package</TableHead>
                                            <TableHead>Version</TableHead>
                                            {platform === 'ios' && <TableHead>Managed</TableHead>}
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
                                                    {loadingApps ? "Loading applications..." : "No applications found."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            applications.map((app, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{app.name}</TableCell>
                                                    <TableCell>{app.packageName || app.identifier}</TableCell>
                                                    <TableCell>{app.appVersion}</TableCell>
                                                    {platform === 'ios' && (
                                                        <TableCell>{app.isManaged ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Yes</Badge> : 'No'}</TableCell>
                                                    )}
                                                    <TableCell>
                                                        {app.isInstalled ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Installed</Badge> :
                                                            app.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <span className="text-muted-foreground">-</span>}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SYSTEM TAB */}
                    <TabsContent value="system" className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <SectionHeader title="Operating System" icon={AppWindow} />
                                    <InfoRow label="OS Details" value={device.opSysInfo?.fullVersion || `${device.opSysInfo?.name || ''} ${device.opSysInfo?.version || ''}`} />
                                    <InfoRow label="Version" value={device.osVersion || device.androidVersion} />
                                    <InfoRow label="Build Version" value={device.buildVersion} />
                                    <InfoRow label="Supplemental Build" value={device.supplementalBuildVersion} />
                                    <InfoRow label="Kernel/Baseband" value={device.modemFirmwareVersion} />
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader title="Time & Location" icon={Globe} />
                                    <InfoRow label="Timezone" value={device.timeZone} />
                                    <InfoRow label="Creation Time" value={device.creationTime} icon={FileText} />
                                    <InfoRow label="Enrollment Time" value={device.enrollmentTime} icon={FileText} />
                                    <InfoRow label="Last Sync" value={device.lastSyncTime} icon={RefreshCw} />
                                    <InfoRow label="Deployed Location" value={device.deployedLocation} icon={MapPin} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Display & Sound" icon={Sun} />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Brightness</span>
                                            <span>{device.brightness ?? '-'}%</span>
                                        </div>
                                        <Progress value={device.brightness || 0} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Volume</span>
                                            <span>{device.volume ?? '-'}%</span>
                                        </div>
                                        <Progress value={device.volume || 0} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Ring Volume</span>
                                            <span>{device.ringVolume ?? '-'}%</span>
                                        </div>
                                        <Progress value={device.ringVolume || 0} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Security & Restrictions" icon={Lock} />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <BooleanStatus label="Keyguard/Passcode" value={device.isKeyguardEnabled} />
                                    <BooleanStatus label="USB Storage" value={device.isUsbStorageEnabled} />
                                    <BooleanStatus label="Kiosk Mode" value={device.kioskMode} />
                                    <BooleanStatus label="MDM Mode" value={device.mdmMode} />
                                    <BooleanStatus label="Supervised" value={device.isSupervised} />
                                    <BooleanStatus label="Activation Lock (Supervised)" value={device.activationLockAllowedWhileSupervised} />
                                    <BooleanStatus label="Do Not Disturb" value={device.isDoNotDisturbInEffect} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <SectionHeader title="Accessibility" icon={User} />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <BooleanStatus label="VoiceOver" value={device.voiceOverEnabled} />
                                    <BooleanStatus label="Zoom" value={device.zoomEnabled} />
                                    <BooleanStatus label="Invert Colors" value={device.increaseContrastEnabled} />
                                    <BooleanStatus label="Bold Text" value={device.boldTextEnabled} />
                                    <BooleanStatus label="Reduce Motion" value={device.reduceMotionEnabled} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* USER TAB */}
                    <TabsContent value="user" className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <SectionHeader title="User Info" icon={User} />
                                    <InfoRow label="User Email" value={device.userEmail} />
                                    <InfoRow label="Device User Name" value={device.deviceUser} />
                                    <InfoRow label="Organization" value={device.organizationName} icon={Layers} />
                                    <InfoRow label="Assigned User" value={device.deviceUser} />
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader title="Shared Device (iPad)" icon={Tablet} />
                                    <BooleanStatus label="Shared Device" value={device.isMultiUser} />
                                    <InfoRow label="Resident Users" value={device.residentUsers} />
                                    <InfoRow label="Quota Size" value={formatBytes(Number(device.quotaSize) * 1024 * 1024)} subValue={device.quotaSize ? 'Calculated from MB' : undefined} />
                                    <InfoRow label="Grace Period" value={device.onlineAuthenticationGracePeriod} subValue="Days" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EFFECTIVE PROFILE TAB */}
                    <TabsContent value="effective-profile" className="space-y-6">
                        {!effectiveProfile ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No effective profile data available.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Profile Info */}
                                <Card>
                                    <CardHeader>
                                        <SectionHeader title="Profile Summary" icon={FileText} />
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Profile Name" value={effectiveProfile.name} />
                                        <InfoRow label="Description" value={effectiveProfile.description} />
                                        <InfoRow label="Profile ID" value={effectiveProfile.id} copyable />
                                        <InfoRow label="Version" value={effectiveProfile.version} />
                                        <InfoRow label="Platform" value={effectiveProfile.platform || effectiveProfile.profileType} />
                                        <InfoRow label="Status" value={effectiveProfile.status} />
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Passcode Policy */}
                                    {effectiveProfile.passCodePolicy && (
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Passcode Policy" icon={Lock} />
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <BooleanStatus label="Require Passcode" value={effectiveProfile.passCodePolicy.requirePassCode} />
                                                <BooleanStatus label="Simple Passcode Allowed" value={effectiveProfile.passCodePolicy.allowSimple} />
                                                <BooleanStatus label="Alphanumeric Required" value={effectiveProfile.passCodePolicy.requireAlphanumericPasscode} />
                                                <InfoRow label="Min Length" value={effectiveProfile.passCodePolicy.minLength} />
                                                <InfoRow label="Max Failed Attempts" value={effectiveProfile.passCodePolicy.maximumFailedAttempts} />
                                                <InfoRow label="Max Passcode Age" value={effectiveProfile.passCodePolicy.maximumPasscodeAgeInDays} subValue="Days" />
                                                <InfoRow label="Auto-Lock" value={effectiveProfile.passCodePolicy.maximumInactivityInMinutes} subValue="Minutes" />
                                                <InfoRow label="Grace Period" value={effectiveProfile.passCodePolicy.maximumGracePeriodInMinutes} subValue="Minutes" />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Wi-Fi Policy */}
                                    {effectiveProfile.wifiPolicy && (
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Wi-Fi Configuration" icon={Wifi} />
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <InfoRow label="SSID" value={effectiveProfile.wifiPolicy.ssid} />
                                                <InfoRow label="Encryption" value={effectiveProfile.wifiPolicy.encryptionType} />
                                                <BooleanStatus label="Auto Join" value={effectiveProfile.wifiPolicy.autoJoin} />
                                                <BooleanStatus label="Hidden Network" value={effectiveProfile.wifiPolicy.hiddenNetwork} />
                                                <BooleanStatus label="Is Hotspot" value={effectiveProfile.wifiPolicy.isHotspot} />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Lock Screen Message */}
                                    {effectiveProfile.lockScreenPolicy && (
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Lock Screen Message" icon={Smartphone} />
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <InfoRow label="If Lost" value={effectiveProfile.lockScreenPolicy.lockScreenFootnote} />
                                                <InfoRow label="Asset Tag" value={effectiveProfile.lockScreenPolicy.assetTagInformation} />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Web Clips */}
                                    {effectiveProfile.webClipPolicies && effectiveProfile.webClipPolicies.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Web Clips" icon={Globe} />
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {effectiveProfile.webClipPolicies.map((clip, idx) => (
                                                    <div key={idx} className="p-3 border rounded-lg">
                                                        <InfoRow label="Label" value={clip.label} />
                                                        <InfoRow label="URL" value={clip.url} />
                                                        <BooleanStatus label="Removable" value={clip.isRemovable} />
                                                        <BooleanStatus label="Full Screen" value={clip.fullScreen} />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Applications Policy */}
                                    {effectiveProfile.applicationPolicies && effectiveProfile.applicationPolicies.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Application Rules" icon={AppWindow} />
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {effectiveProfile.applicationPolicies.map((app, idx) => (
                                                    <div key={idx} className="p-3 border rounded-lg">
                                                        <InfoRow label="Bundle ID" value={app.bundleIdentifier} />
                                                        <InfoRow label="Install Action" value={app.action} />
                                                        <BooleanStatus label="Removable" value={app.removable} />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Notifications Policy */}
                                    {effectiveProfile.notificationPolicies && effectiveProfile.notificationPolicies.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Notification Settings" icon={MessagesSquare} />
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {effectiveProfile.notificationPolicies.map((notif, idx) => (
                                                    <div key={idx} className="p-3 border rounded-lg">
                                                        <InfoRow label="Bundle ID" value={notif.bundleIdentifier} />
                                                        <BooleanStatus label="Enabled" value={notif.enabled} />
                                                        <BooleanStatus label="Lock Screen" value={notif.showInLockScreen} />
                                                        <BooleanStatus label="Notification Center" value={notif.showInNotificationCenter} />
                                                        <BooleanStatus label="Alert Style" value={notif.alertStyle !== 'NONE'} trueLabel={notif.alertStyle || 'BANNER'} />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Raw JSON Fallback for other policies (optional but good for debug/completeness) */}
                                    <div className="col-span-1 lg:col-span-2">
                                        <Card>
                                            <CardHeader>
                                                <SectionHeader title="Full Policy Data (Debug)" icon={Database} />
                                            </CardHeader>
                                            <CardContent>
                                                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-96">
                                                    {JSON.stringify(effectiveProfile, (key, value) => {
                                                        if (key === 'passCodePolicy' || key === 'wifiPolicy' || key === 'lockScreenPolicy' || key === 'webClipPolicies' || key === 'notificationPolicies' || key === 'applicationPolicies') return undefined; // Hide already shown
                                                        return value;
                                                    }, 2)}
                                                </pre>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm {confirmDialog.label}</DialogTitle>
                        <DialogDescription>
                            This action is critical.
                            Please type <span className="font-bold text-foreground">{confirmDialog.requiredText}</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="confirm-input" className="mb-2 block">Confirmation Text</Label>
                        <Input
                            id="confirm-input"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder={`Type ${confirmDialog.requiredText} to confirm`}
                            className={cn(confirmInput === confirmDialog.requiredText ? "border-green-500" : "")}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={confirmInput !== confirmDialog.requiredText}
                        >
                            Confirm {confirmDialog.label}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
