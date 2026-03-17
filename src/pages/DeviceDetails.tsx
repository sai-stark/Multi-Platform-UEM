
import { DeviceService } from '@/api/services/devices';
import { DeviceApplicationsTab } from '@/components/devices/DeviceDetailsTabs/DeviceApplicationsTab';
import { DeviceCertificatesTab } from '@/components/devices/DeviceDetailsTabs/DeviceCertificatesTab';
import { DeviceEffectiveProfileTab } from '@/components/devices/DeviceDetailsTabs/DeviceEffectiveProfileTab';
import { DeviceHardwareTab } from '@/components/devices/DeviceDetailsTabs/DeviceHardwareTab';
import { DeviceNetworkTab } from '@/components/devices/DeviceDetailsTabs/DeviceNetworkTab';
import { DeviceOverviewTab, InfoRow, SectionHeader } from '@/components/devices/DeviceDetailsTabs/DeviceOverviewTab';
import { DeviceSecurityTab } from '@/components/devices/DeviceDetailsTabs/DeviceSecurityTab';
import { DeviceSettingsTab } from '@/components/devices/DeviceDetailsTabs/DeviceSettingsTab';
import { DeviceSystemTab } from '@/components/devices/DeviceDetailsTabs/DeviceSystemTab';
import { DeviceUserTab } from '@/components/devices/DeviceDetailsTabs/DeviceUserTab';
import { RemoteControlTab } from '@/components/devices/RemoteControlTab';
import { MainLayout } from '@/components/layout/MainLayout';
import { DetailPageSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssetUrl } from '@/config/env';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useToast } from '@/hooks/use-toast';
import { usePlatformValidation } from '@/hooks/usePlatformValidation';
import { cn } from '@/lib/utils';
import { DeviceInfo, DeviceLocationResponse, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    Activity,
    AppWindow,
    HardDrive as Chip,
    Cpu,
    FileText,
    Layers,
    Lock, LogOut, MapPin,
    MonitorPlay,
    MoreVertical,
    Network,
    Power, PowerOff, RefreshCw,
    Settings,
    Shield,
    Smartphone,
    Trash2,
    Unlock,
    User, UserMinus, Volume2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function DeviceDetails() {
    const { platform, id } = useParams<{ platform: string; id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const fromPlatform = (location.state as any)?.fromPlatform;
    const { toast } = useToast();
    const [device, setDevice] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const { setEntityName } = useBreadcrumb();

    // Set breadcrumb entity name when device loads
    useEffect(() => {
        if (device?.deviceName || device?.model) setEntityName(device?.deviceName || device?.model || '');
    }, [device?.deviceName, device?.model, setEntityName]);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: string | null; label: string; requiredText: string }>({
        isOpen: false,
        action: null,
        label: '',
        requiredText: ''
    });
    const [confirmInput, setConfirmInput] = useState('');



    // Lost Mode State
    const [lostModeDialog, setLostModeDialog] = useState(false);
    const [lostModeData, setLostModeData] = useState({
        message: '',
        phoneNumber: '',
        footnote: ''
    });

    // Device Location State
    const [locationData, setLocationData] = useState<DeviceLocationResponse | null>(null);
    const [showLocationDialog, setShowLocationDialog] = useState(false);

    // Delete User State
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUserName, setDeleteUserName] = useState('');

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
                description: getErrorMessage(error, "Failed to fetch device details."),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevice();
    }, [id, platform]);

    // Validate URL platform matches fetched device's actual platform
    const { shouldRender } = usePlatformValidation(
        platform,
        device?.platform,
        loading,
        (correctPlatform) => `/devices/${correctPlatform}/${id}`
    );

    // Don't render if we're about to redirect due to platform mismatch
    if (!shouldRender) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4" aria-busy="true" aria-label="Redirecting">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true"></div>
                    <p className="text-muted-foreground animate-pulse">Redirecting...</p>
                </div>
            </MainLayout>
        );
    }

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

        if (action === 'enable_lost_mode' && (device.platform === 'ios' || device.deviceType === 'IosDeviceInfo')) {
            setLostModeDialog(true);
            return;
        }

        if (action === 'delete_user') {
            setDeleteUserDialog(true);
            setDeleteUserName('');
            return;
        }

        if (action === 'get_location') {
            handleLocationClick();
            return;
        }

        executeAction(action, label);
    };

    const handleLocationClick = async () => {
        if (!device || !device.id) return;
        toast({ title: "Getting Location", description: "Requesting device location..." });
        try {
            const devicePlatform = (device.platform || platform || 'android') as Platform;
            const data = await DeviceService.getDeviceLocation(devicePlatform, device.id);
            setLocationData(data);
            setShowLocationDialog(true);
            toast({ title: "Location Received", description: "Device location updated." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: getErrorMessage(error, "Failed to get device location."), variant: "destructive" });
        }
    };

    // Helper to execute delete user
    const executeDeleteUser = async () => {
        if (!device || !device.id) return;

        toast({ title: "Action Initiated", description: "Sending Delete User command..." });

        try {
            const devicePlatform = (device.platform || platform || 'android') as Platform;
            const isIos = devicePlatform === 'ios' || device.deviceType === 'IosDeviceInfo';

            await DeviceService.deleteUser(devicePlatform, device.id, isIos ? {
                deviceType: 'ActionIosDeviceDeleteUser',
                userName: deleteUserName
            } : { deviceType: 'ActionAndroidDeviceDeleteUser' });

            toast({ title: "Success", description: "Delete User command sent successfully." });
            setDeleteUserDialog(false);
        } catch (error) {
            console.error("Failed to delete user", error);
            toast({ title: "Action Failed", description: getErrorMessage(error, "Could not send delete user command."), variant: "destructive" });
        }
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
                case 'shutdown':
                    await DeviceService.shutdownDevice(devicePlatform, device.id);
                    break;
                case 'logout':
                    await DeviceService.logoutDevice(devicePlatform, device.id);
                    break;
                case 'sync':
                    await DeviceService.syncDevices(devicePlatform, [device.id]);
                    break;
                case 'lock':
                    await DeviceService.lockDevice(devicePlatform, device.id);
                    break;
                case 'factory_reset':
                    await DeviceService.factoryResetDevice(devicePlatform, device.id);
                    break;
                case 'gps':
                    await DeviceService.getGPS(devicePlatform, device.id);
                    break;
                case 'clear_passcode':
                    await DeviceService.removePassCode(device.id);
                    break;
                case 'remove_restriction_password':
                    await DeviceService.removeRestrictionPassword(device.id);
                    break;
                case 'enable_lost_mode':
                    await DeviceService.enableLostMode(devicePlatform, device.id, devicePlatform === 'ios' ? {
                        deviceActionType: 'ActionIosEnableLostMode',
                        Message: lostModeData.message,
                        PhoneNumber: lostModeData.phoneNumber,
                        Footnote: lostModeData.footnote
                    } : { deviceActionType: 'ActionAndroidEnableLostMode' });
                    break;
                case 'disable_lost_mode':
                    await DeviceService.disableLostMode(devicePlatform, device.id, devicePlatform === 'ios' ? {
                        deviceActionType: 'ActionIosDisableLostMode'
                    } : { deviceActionType: 'ActionAndroidDisableLostMode' });
                    break;
                case 'play_lost_mode_sound':
                    await DeviceService.playLostModeSound(devicePlatform, device.id, devicePlatform === 'ios' ? {
                        deviceActionType: 'ActionIosPlayLostModeSound'
                    } : { deviceActionType: 'ActionAndroidPlayLostModeSound' });
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
                description: getErrorMessage(error, "Could not send command to device."),
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

        if (p === 'android' || p.includes('android')) assetSrc = getAssetUrl('/Assets/android.svg');
        else if (p === 'ios' || p === 'iosdeviceinfo') assetSrc = getAssetUrl('/Assets/apple.svg');
        else if (p === 'macos') assetSrc = getAssetUrl('/Assets/mac_os.svg');
        else if (p === 'windows') assetSrc = getAssetUrl('/Assets/microsoft.svg');
        else if (p === 'linux') assetSrc = getAssetUrl('/Assets/linux.svg');

        if (assetSrc) {
            return <img src={assetSrc} alt={plat} className="w-16 h-16 object-contain" />;
        }

        return <Smartphone className="w-12 h-12 text-primary" />;
    };


    if (loading) {
        return (
            <MainLayout>
                <DetailPageSkeleton />
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
                </div>
            </MainLayout>
        );
    }

    // Calculations
    const storagePercent = Math.min(100, (Number((((Number(device.storageUsed || device.usedStorage) || 0) / (Number(device.storageCapacity || device.totalStorage || device.deviceCapacity) || 1)) * 100).toFixed(2))));
    const ramPercent = Math.min(100, (Number((((Number(device.ramUsed || device.usedRam) || 0) / (Number(device.ramCapacity || device.totalRam) || 1)) * 100).toFixed(2))));

    const isIos = device.platform === 'ios' || device.deviceType === 'IosDeviceInfo';
    const isApplePlatform = isIos || device.platform === 'macos';

    return (
        <MainLayout>
            <div className="space-y-6 pb-20">

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
                                        (device.status === 'ONLINE' || device.connectionStatus === 'online') ? "bg-success hover:bg-success/90" : "bg-muted-foreground"
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
                                    {/* <Badge variant="outline" className={cn(
                                        "gap-1",
                                        device.complianceStatus === 'compliant' ? "text-success border-success/30 bg-success/10" : "text-destructive border-destructive/30 bg-destructive/10"
                                    )}>
                                        {device.complianceStatus === 'compliant' ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                        {device.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                                    </Badge> */}

                                    {device.isSupervised && (
                                        <Badge variant="outline" className="gap-1 text-accent border-accent/30 bg-accent/10">
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
                                    <DropdownMenuItem onClick={() => handleAction('sync', 'Sync')}>
                                        <RefreshCw className="w-4 h-4 mr-2" /> Sync
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction('logout', 'Logout')}>
                                        <LogOut className="w-4 h-4 mr-2" /> Logout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleAction('shutdown', 'Shutdown')}>
                                        <PowerOff className="w-4 h-4 mr-2" /> Shutdown
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleAction('delete_user', 'Delete User')}>
                                        <UserMinus className="w-4 h-4 mr-2" /> Delete User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction('get_location', 'Get Location')}>
                                        <MapPin className="w-4 h-4 mr-2" /> Get Location
                                    </DropdownMenuItem>
                                    {/* Dangerous Actions */}
                                    <DropdownMenuSeparator />
                                    {isApplePlatform && (
                                        <DropdownMenuItem onClick={() => handleAction('clear_passcode', 'Clear Passcode')}>
                                            <Unlock className="w-4 h-4 mr-2" /> Clear Passcode
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleAction('factory_reset', 'Factory Reset')}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Factory Reset
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {isApplePlatform && (
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
                                    <DropdownMenuItem onClick={() => handleAction('enable_lost_mode', 'Enable Lost Mode')}>
                                        <Lock className="w-4 h-4 mr-2" /> Enable Lost Mode
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction('disable_lost_mode', 'Disable Lost Mode')}>
                                        <Unlock className="w-4 h-4 mr-2" /> Disable Lost Mode
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction('play_lost_mode_sound', 'Play Lost Mode Sound')}>
                                        <Volume2 className="w-4 h-4 mr-2" /> Play Lost Mode Sound
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Tabs for detailed info */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="flex flex-wrap w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm gap-1 h-auto justify-start">
                        <TabsTrigger value="overview" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                            <Activity className="w-4 h-4" /> Overview
                        </TabsTrigger>

                        {!isApplePlatform && (
                            <TabsTrigger value="hardware" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                                <Chip className="w-4 h-4" /> Hardware
                            </TabsTrigger>
                        )}

                        {!isApplePlatform && (
                            <TabsTrigger value="network" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                                <Network className="w-4 h-4" /> Network
                            </TabsTrigger>
                        )}

                        <TabsTrigger value="applications" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                            <AppWindow className="w-4 h-4" /> Applications
                        </TabsTrigger>

                        <TabsTrigger value="security" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                            <Shield className="w-4 h-4" /> Security
                        </TabsTrigger>

                        <TabsTrigger value="certificates" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                            <FileText className="w-4 h-4" /> Certificates
                        </TabsTrigger>

                        {!isApplePlatform && (
                            <TabsTrigger value="system" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                                <Cpu className="w-4 h-4" /> System
                            </TabsTrigger>
                        )}

                        {!isApplePlatform && (
                            <TabsTrigger value="settings" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                                <Settings className="w-4 h-4" /> Settings
                            </TabsTrigger>
                        )}

                        {!isApplePlatform && (
                            <TabsTrigger value="user" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                                <User className="w-4 h-4" /> User
                            </TabsTrigger>
                        )}

                        <TabsTrigger value="remote-control" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                            <MonitorPlay className="w-4 h-4" /> Remote Control
                        </TabsTrigger>

                        <TabsTrigger value="effective-profile" className="flex-1 min-w-fit gap-2 px-4 py-2.5 rounded-lg hover:text-foreground hover:bg-muted/50 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50">
                            <FileText className="w-4 h-4" /> Effective Profile
                        </TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6 mt-4">
                        <DeviceOverviewTab device={device} />
                    </TabsContent>

                    {/* HARDWARE TAB - Only render for non-iOS or if forced */}
                    {!isApplePlatform && (
                        <TabsContent value="hardware" className="space-y-6">
                            <DeviceHardwareTab device={device} />
                        </TabsContent>
                    )}

                    {/* NETWORK TAB - Only render for non-iOS */}
                    {!isApplePlatform && (
                        <TabsContent value="network" className="space-y-6">
                            <DeviceNetworkTab device={device} />
                        </TabsContent>
                    )}

                    {/* APPLICATIONS TAB - Keep for both */}
                    <TabsContent value="applications" className="space-y-6">
                        <DeviceApplicationsTab platform={device.platform || platform || "android"} id={device.id} />
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security" className="space-y-6">
                        <DeviceSecurityTab platform={device.platform || platform || "android"} id={device.id} />
                    </TabsContent>

                    {/* CERTIFICATES TAB */}
                    <TabsContent value="certificates" className="space-y-6">
                        <DeviceCertificatesTab platform={device.platform || platform || "android"} id={device.id} />
                    </TabsContent>

                    {/* SYSTEM TAB - Hide for iOS */}
                    {!isApplePlatform && (
                        <TabsContent value="system" className="space-y-6">
                            <DeviceSystemTab device={device} />
                        </TabsContent>
                    )}

                    {/* SETTINGS TAB - Hide for iOS */}
                    {!isApplePlatform && (
                        <TabsContent value="settings" className="space-y-6">
                            <DeviceSettingsTab device={device} />
                        </TabsContent>
                    )}

                    {/* USER TAB */}
                    <TabsContent value="user" className="space-y-6">
                        <DeviceUserTab device={device} />
                    </TabsContent>

                    {/* REMOTE CONTROL TAB */}
                    <TabsContent value="remote-control" className="space-y-6">
                        <Card className="min-h-[500px] border-t-4 border-t-accent overflow-hidden">
                            <CardHeader className="pb-2">
                                <SectionHeader title="Remote Access Session" icon={MonitorPlay} />
                            </CardHeader>
                            <CardContent className="p-0 sm:p-2 sm:px-6 h-[800px]">
                                <RemoteControlTab
                                    roomToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE3NzAwNTgsImlkZW50aXR5IjoidXNlcjIxIiwiaXNzIjoiZGV2a2V5IiwibmFtZSI6InVzZXIyMSIsIm5iZiI6MTc3MzEzMDA1OCwic3ViIjoidXNlcjIxIiwidmlkZW8iOnsicm9vbSI6InRlc3Qtcm9vbSIsInJvb21Kb2luIjp0cnVlfX0.ElGklZSSIK7mCi5VGFpTgjDtLDMj8DNnjqWWTT6Hgd8"
                                    serverUrl="wss://192.168.75.231/livekit/sfu/"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EFFECTIVE PROFILE TAB */}
                    <TabsContent value="effective-profile" className="space-y-6">
                        <DeviceEffectiveProfileTab platform={device.platform || platform || "android"} id={device.id} />
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

            {/* Lost Mode Dialog */}
            <Dialog open={lostModeDialog} onOpenChange={setLostModeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enable Lost Mode</DialogTitle>
                        <DialogDescription>
                            Enter the details to be displayed on the device lock screen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Input
                                value={lostModeData.message}
                                onChange={(e) => setLostModeData({ ...lostModeData, message: e.target.value })}
                                placeholder="This device is lost. Please return..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={lostModeData.phoneNumber}
                                onChange={(e) => setLostModeData({ ...lostModeData, phoneNumber: e.target.value })}
                                placeholder="+91 1234567890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Footnote</Label>
                            <Input
                                value={lostModeData.footnote}
                                onChange={(e) => setLostModeData({ ...lostModeData, footnote: e.target.value })}
                                placeholder="Property of CDOT"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLostModeDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setLostModeDialog(false);
                            executeAction('enable_lost_mode', 'Enable Lost Mode');
                        }}>Content Enable Lost Mode</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the user? This action cannot be undone.
                            {(device?.platform === 'ios' || device?.deviceType === 'IosDeviceInfo') && " Please enter the username to delete."}
                        </DialogDescription>
                    </DialogHeader>
                    {(device?.platform === 'ios' || device?.deviceType === 'IosDeviceInfo') && (
                        <div className="py-4">
                            <Label htmlFor="username" className="mb-2 block">Username</Label>
                            <Input
                                id="username"
                                value={deleteUserName}
                                onChange={(e) => setDeleteUserName(e.target.value)}
                                placeholder="Enter username"
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUserDialog(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={executeDeleteUser}
                            disabled={(device?.platform === 'ios' || device?.deviceType === 'IosDeviceInfo') && !deleteUserName}
                        >
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Location Dialog */}
            <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Device Location</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {locationData ? (
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Latitude" value={locationData.Latitude} />
                                <InfoRow label="Longitude" value={locationData.Longitude} />
                                {(locationData as any).Altitude !== undefined && (
                                    <InfoRow label="Altitude" value={(locationData as any).Altitude} />
                                )}
                                {(locationData as any).Speed !== undefined && (
                                    <InfoRow label="Speed" value={(locationData as any).Speed} />
                                )}
                                {(locationData as any).Timestamp !== undefined && (
                                    <InfoRow label="Timestamp" value={(locationData as any).Timestamp} />
                                )}
                            </div>
                        ) : (
                            <p>No location data available.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
