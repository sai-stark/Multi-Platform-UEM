
import { MainLayout } from '@/components/layout/MainLayout';
import { GroupDetailSkeleton } from '@/components/skeletons';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useToast } from '@/hooks/use-toast';
import { BriefDeviceInfo, Group } from '@/types/models';
import {
    Laptop,
    Monitor,
    Plus,
    Search,
    Smartphone,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DeviceService } from '@/api/services/devices';
import { GroupService } from '@/api/services/groups';

export default function GroupDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [group, setGroup] = useState<Group | null>(null);
    const [devices, setDevices] = useState<BriefDeviceInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [availableDevices, setAvailableDevices] = useState<BriefDeviceInfo[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [targetRemoveDeviceId, setTargetRemoveDeviceId] = useState<string | null>(null);
    const { setEntityName } = useBreadcrumb();

    // Set breadcrumb entity name when group loads
    useEffect(() => {
        if (group?.name) setEntityName(group.name);
    }, [group?.name, setEntityName]);

    const fetchGroupData = async () => {
        setLoading(true);
        try {
            if (id) {
                const groupData = await GroupService.getGroup(id);
                setGroup(groupData);

                const devicesData = await GroupService.getGroupDevices(id, { page: 0, size: 50 });
                const groupDevs = devicesData.content || [];
                setDevices(groupDevs);

                // Fetch all devices for "available devices" list
                const allDevsRes = await DeviceService.getDevices('all' as any, { page: 0, size: 100 });
                const allDevs = allDevsRes.content || [];

                // Filter out devices already in the group
                const groupDevIds = new Set(groupDevs.map((d: any) => d.id));
                const available = allDevs.filter((d: any) => !groupDevIds.has(d.id));
                setAvailableDevices(available as any);
            }
        } catch (error) {
            console.error("Failed to fetch group details", error);
            toast({ title: "Error", description: "Failed to fetch group details.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const handleAddDevices = async () => {
        if (selectedDevices.length === 0) return;

        try {
            await GroupService.addDevicesToGroup(id!, selectedDevices);

            const devicesToAdd = availableDevices.filter(d => selectedDevices.includes(d.id));
            setDevices([...devices, ...devicesToAdd]);
            setAvailableDevices(availableDevices.filter(d => !selectedDevices.includes(d.id)));
            setIsAddDeviceOpen(false);
            setSelectedDevices([]);

            toast({
                title: "Devices Added",
                description: `Successfully added ${devicesToAdd.length} devices to the group.`,
            });
        } catch (error) {
            console.error("Failed to add devices", error);
            toast({ title: "Error", description: "Failed to add devices to group.", variant: "destructive" });
        }
    };

    const handleRemoveDevice = async (deviceId: string) => {
        try {
            await GroupService.removeDevicesFromGroup(id!, [deviceId]);

            setDevices(devices.filter(d => d.id !== deviceId));
            const removed = devices.find(d => d.id === deviceId);
            if (removed) setAvailableDevices([...availableDevices, removed]);
            toast({ title: "Device Removed", description: "Device has been removed from the group." });
        } catch (error) {
            console.error("Failed to remove device", error);
            toast({ title: "Error", description: "Failed to remove device from group.", variant: "destructive" });
        }
    };

    const openRemoveDialog = (deviceId: string) => {
        setTargetRemoveDeviceId(deviceId);
        setShowRemoveDialog(true);
    };

    const getPlatformIcon = (name: string) => {
        // Simple heuristic for icon since BriefDeviceInfo might not have platform
        if (name.toLowerCase().includes('pixel') || name.toLowerCase().includes('android')) return <Smartphone className="w-4 h-4 text-success" />;
        if (name.toLowerCase().includes('iphone') || name.toLowerCase().includes('ipad')) return <Smartphone className="w-4 h-4 text-muted-foreground" />;
        if (name.toLowerCase().includes('windows') || name.toLowerCase().includes('dell') || name.toLowerCase().includes('hp')) return <Laptop className="w-4 h-4 text-info" />;
        return <Monitor className="w-4 h-4" />;
    };

    const toggleDeviceSelection = (deviceId: string) => {
        if (selectedDevices.includes(deviceId)) {
            setSelectedDevices(selectedDevices.filter(id => id !== deviceId));
        } else {
            setSelectedDevices([...selectedDevices, deviceId]);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <GroupDetailSkeleton />
            </MainLayout>
        );
    }

    if (!group) {
        return (
            <MainLayout>
                <div className="flex bg-muted/30 h-full flex-col items-center justify-center gap-4">
                    <h2 className="text-xl font-semibold">Group Not Found</h2>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove device from group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The device will be unassigned from this group. It will not be deleted from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => targetRemoveDeviceId && handleRemoveDevice(targetRemoveDeviceId)}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
                {/* Header */}

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Users className="w-6 h-6 text-primary" />
                            {group.name}
                        </h1>
                        <p className="text-muted-foreground">{group.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Devices
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add Devices to Group</DialogTitle>
                                    <DialogDescription>
                                        Select devices to add to <strong>{group.name}</strong>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Search available devices..." className="pl-9" />
                                    </div>
                                    <div className="border rounded-md h-[300px] overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted sticky top-0">
                                                <tr className="border-b">
                                                    <th className="p-3 w-10"></th>
                                                    <th className="p-3 text-left font-medium">Device Name</th>
                                                    <th className="p-3 text-left font-medium">Model</th>
                                                    <th className="p-3 text-left font-medium">OS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {availableDevices.map(device => (
                                                    <tr key={device.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => toggleDeviceSelection(device.id)}>
                                                        <td className="p-3">
                                                            <Checkbox
                                                                checked={selectedDevices.includes(device.id)}
                                                                onCheckedChange={() => toggleDeviceSelection(device.id)}
                                                            />
                                                        </td>
                                                        <td className="p-3 font-medium">{device.name}</td>
                                                        <td className="p-3 text-muted-foreground">{device.model}</td>
                                                        <td className="p-3 text-muted-foreground">{device.osVersion}</td>
                                                    </tr>
                                                ))}
                                                {availableDevices.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                            No available devices found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedDevices.length} devices selected
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddDevices} disabled={selectedDevices.length === 0}>Add Selected</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Group Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="border rounded-md">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Device Name</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Model</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">OS Version</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devices.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((device) => (
                                        <tr key={device.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4 font-medium flex items-center gap-2">
                                                {getPlatformIcon(device.name || device.model)}
                                                {device.name}
                                            </td>
                                            <td className="p-4 text-muted-foreground">{device.model}</td>
                                            <td className="p-4 text-muted-foreground">{device.osVersion}</td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className="capitalize">{device.status}</Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => openRemoveDialog(device.id)}
                                                    title="Remove from group"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {devices.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No devices in this group.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
