
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
import { DeviceInfo } from '@/types/models';
import {
    Apple,
    ArrowLeft,
    Battery,
    Cpu,
    HardDrive,
    Laptop,
    Layout,
    Lock,
    MapPin,
    Monitor,
    MoreVertical,
    Power,
    RefreshCw,
    Shield,
    Smartphone,
    Trash2,
    Wifi
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data for development/preview
const mockDevice: DeviceInfo = {
    id: '1',
    udid: '00008030-001A2B3C4D5E6F',
    serialNumber: 'C02XD12345',
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
        // Simulate API call or use service
        setTimeout(() => {
            console.log('Using mock device data');
            setDevice(mockDevice);
            setLoading(false);
        }, 500);

        /* 
        // Real API implementation
        try {
            if (platform && id) {
                 const data = await DeviceService.getDevice(platform as any, id);
                 setDevice(data);
            }
        } catch (error) {
            console.error("Failed to fetch device", error);
        } finally {
            setLoading(false);
        }
        */
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
            switch (action) {
                case 'reboot':
                    await DeviceService.rebootDevice(device.platform, device.id);
                    break;
                case 'sync':
                    await DeviceService.syncDevice(device.id);
                    break;
                case 'lock':
                    await DeviceService.lockDevice(device.platform, device.id);
                    break;
                case 'factory_reset':
                    if (confirm("Are you sure you want to factory reset this device? This action is irreversible.")) {
                        await DeviceService.factoryResetDevice(device.platform, device.id);
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
            console.error(`Failed to execute ${action}`, error);
            toast({
                title: "Action Failed",
                description: "Could not send command to device. Check console/network.",
                variant: "destructive"
            });
        }
    };

    const getPlatformIcon = (plat?: string) => {
        switch (plat) {
            case 'android': return <Smartphone className="w-5 h-5 text-success" />;
            case 'ios': return <Apple className="w-5 h-5 text-muted-foreground" />;
            case 'windows': return <Monitor className="w-5 h-5 text-info" />;
            case 'macos': return <Laptop className="w-5 h-5 text-zinc-400" />;
            case 'linux': return <Monitor className="w-5 h-5 text-orange-500" />;
            default: return <Layout className="w-5 h-5 text-primary" />;
        }
    };

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

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/devices')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {getPlatformIcon(device.platform)}
                            {device.model || 'Unknown Device'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={device.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                {device.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-mono">{device.serialNumber}</span>
                        </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAction('sync', 'Sync')}>
                            <RefreshCw className="w-4 h-4" />
                            Sync
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAction('lock', 'Lock')}>
                            <Lock className="w-4 h-4" />
                            Lock
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAction('reboot', 'Reboot')}>
                            <Power className="w-4 h-4" />
                            Reboot
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Advanced Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleAction('gps', 'Get GPS')}>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Locate Device
                                </DropdownMenuItem>
                                {device.platform === 'ios' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleAction('clear_passcode', 'Clear Passcode')}>
                                            <Shield className="w-4 h-4 mr-2" />
                                            Clear Passcode
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleAction('factory_reset', 'Factory Reset')}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Factory Reset
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* General Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                                Device Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Model:</span>
                                <span className="font-medium">{device.model}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">OS Version:</span>
                                <span className="font-medium">{device.platform} {device.osVersion}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Serial No:</span>
                                <span className="font-mono">{device.serialNumber}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">IMEI:</span>
                                <span className="font-mono">{device.imei || '-'}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">UDID:</span>
                                <span className="font-mono text-xs truncate" title={device.udid}>{device.udid || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Network Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-muted-foreground" />
                                Network & Connectivity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">MAC Address:</span>
                                <span className="font-mono">{device.macAddress || '-'}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">IP Address:</span>
                                <span>-</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Carrier:</span>
                                <span>-</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Data Roaming:</span>
                                <span>Enabled</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enrollment & Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                Security & Enrollment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Enrolled User:</span>
                                <span>{device.userEmail || '-'}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Enrollment Date:</span>
                                <span>{device.enrollmentTime ? new Date(device.enrollmentTime).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Last Sync:</span>
                                <span>{device.lastSyncTime ? new Date(device.lastSyncTime).toLocaleString() : '-'}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                <span className="text-muted-foreground">Compliance:</span>
                                <Badge variant="outline" className="w-fit text-success border-success">Compliant</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hardware (Mock / Placeholder) */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-muted-foreground" />
                                Hardware Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Battery className="w-4 h-4" /> Battery</span>
                                <span className="font-medium">84%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><HardDrive className="w-4 h-4" /> Storage</span>
                                <span className="font-medium">45GB / 128GB</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Cpu className="w-4 h-4" /> RAM</span>
                                <span className="font-medium">3.2GB / 8GB</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
}
