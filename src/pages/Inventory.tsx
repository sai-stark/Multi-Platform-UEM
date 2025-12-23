import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { mockInventory } from "@/data/mockInventory";
import { InventoryDevice } from "@/types/models";
import { Box, Filter, Laptop, Monitor, Pencil, Plus, Search, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
    // Initialize with mock data
    const [devices, setDevices] = useState<InventoryDevice[]>(mockInventory);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [manufacturerFilter, setManufacturerFilter] = useState("all");
    const navigate = useNavigate();
    const { toast } = useToast();

    // Effect to handle search filtering
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = mockInventory.filter(d => {
            const matchesSearch =
                d.serialNumber.toLowerCase().includes(lowerTerm) ||
                d.modelNumber.toLowerCase().includes(lowerTerm) ||
                (d.assetTag && d.assetTag.toLowerCase().includes(lowerTerm)) ||
                (d.assignedUser && d.assignedUser.toLowerCase().includes(lowerTerm));

            const matchesManufacturer = manufacturerFilter === 'all' || d.manufacturer === manufacturerFilter;

            return matchesSearch && matchesManufacturer;
        });
        setDevices(filtered);
    }, [searchTerm, manufacturerFilter]);

    const stats = {
        total: mockInventory.length,
        assigned: mockInventory.filter(d => !!d.assignedUser).length,
        unassigned: mockInventory.filter(d => !d.assignedUser).length,
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this device? (Mock Delete)")) return;

        setDevices(prev => prev.filter(d => d.id !== id));

        toast({
            title: "Success",
            description: "Device deleted successfully (Mock)",
        });
    };

    // Extract unique manufacturers for filter
    const manufacturers = Array.from(new Set(mockInventory.map(d => d.manufacturer)));

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Inventory
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage hardware inventory, assignments, and asset tagging.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/inventory/new")} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Device
                    </Button>
                </div>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                                    <h3 className="text-2xl font-bold">{stats.total}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                                    <h3 className="text-2xl font-bold">{stats.assigned}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <Box className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                                    <h3 className="text-2xl font-bold">{stats.unassigned}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-fit">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Serial, Model, Asset Tag..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Manufacturer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Manufacturers</SelectItem>
                                {manufacturers.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Manufacturer</TableHead>
                                <TableHead>Asset Tag</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Assigned User</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : devices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No devices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                devices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell className="font-medium">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer hover:underline text-primary"
                                                onClick={() => navigate(`/inventory/${device.id}`)}
                                            >
                                                <Laptop className="h-4 w-4" />
                                                {device.serialNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell>{device.modelNumber}</TableCell>
                                        <TableCell>{device.manufacturer}</TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                {device.assetTag || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell>{device.location || "-"}</TableCell>
                                        <TableCell>
                                            {device.assignedUser ? (
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span>{device.assignedUser}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/inventory/${device.id}`)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(device.id!)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </MainLayout>
    );
};

export default Inventory;
