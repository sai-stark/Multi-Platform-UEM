
import { MainLayout } from '@/components/layout/MainLayout';
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
import { useToast } from '@/components/ui/use-toast';
import { BriefDeviceInfo, Group } from '@/types/models';
import {
    ArrowLeft,
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

// Mock Data
const mockGroup: Group = {
    id: '1',
    name: 'Corporate Devices',
    description: 'All company owned devices',
    deviceCount: 3
};

const mockGroupDevices: BriefDeviceInfo[] = [
    { id: '1', name: 'Pixel 7 Pro', model: 'Pixel 7 Pro', osVersion: 'Android 14', status: 'active' },
    { id: '3', name: 'iPhone 15 Pro', model: 'iPhone 15 Pro', osVersion: 'iOS 17', status: 'active' },
    { id: '6', name: 'HP EliteBook', model: 'HP EliteBook 840', osVersion: 'Windows 11', status: 'active' },
];

const mockAvailableDevices: BriefDeviceInfo[] = [
    { id: '2', name: 'Pixel 8', model: 'Pixel 8', osVersion: 'Android 14', status: 'active' },
    { id: '4', name: 'iPad Pro', model: 'iPad Pro', osVersion: 'iPadOS 17', status: 'inactive' },
    { id: '5', name: 'Dell Latitude', model: 'Dell Latitude', osVersion: 'Windows 11', status: 'active' },
];

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

    const fetchGroupData = async () => {
        setLoading(true);
        // Simulate API
        setTimeout(() => {
            setGroup(mockGroup);
            setDevices(mockGroupDevices);
            setAvailableDevices(mockAvailableDevices);
            setLoading(false);
        }, 500);

        /*
        try {
             if(id) {
                const groupData = await GroupService.getGroup(id);
                setGroup(groupData);
                const devicesData = await GroupService.getGroupDevices(id);
                setDevices(devicesData.content);
                
                // For available devices, usually a separate call filtering out existing ones
                // OR searching via the dialog
             }
        } catch (error) {
             // Handle error
        } finally {
            setLoading(false);
        }
        */
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const handleAddDevices = async () => {
        if (selectedDevices.length === 0) return;

        // Mock add
        const devicesToAdd = availableDevices.filter(d => selectedDevices.includes(d.id));
        setDevices([...devices, ...devicesToAdd]);
        setAvailableDevices(availableDevices.filter(d => !selectedDevices.includes(d.id)));
        setIsAddDeviceOpen(false);
        setSelectedDevices([]);

        toast({
            title: "Devices Added",
            description: `Successfully added ${devicesToAdd.length} devices to the group.`,
        });

        /*
        try {
             await GroupService.addDevicesToGroup(id!, selectedDevices);
             fetchGroupData();
        } catch (error) { ... }
        */
    };

    const handleRemoveDevice = async (deviceId: string) => {
        if (confirm("Remove this device from the group?")) {
            setDevices(devices.filter(d => d.id !== deviceId));
            // Add back to available for mock
            const removed = devices.find(d => d.id === deviceId);
            if (removed) setAvailableDevices([...availableDevices, removed]);

            toast({
                title: "Device Removed",
                description: "Device has been removed from the group.",
            });
            /*
             try {
                 await GroupService.removeDevicesFromGroup(id!, [deviceId]);
                 fetchGroupData();
             } catch (error) { ... }
             */
        }
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
                <div className="flex h-full items-center justify-center">Loading...</div>
            </MainLayout>
        );
    }

    if (!group) {
        return (
            <MainLayout>
                <div className="flex bg-muted/30 h-full flex-col items-center justify-center gap-4">
                    <h2 className="text-xl font-semibold">Group Not Found</h2>
                    <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
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
                                                    onClick={() => handleRemoveDevice(device.id)}
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
