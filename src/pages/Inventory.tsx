import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { mockInventory } from "@/data/mockInventory";
import { InventoryDevice } from "@/types/models";
import { DataTable, Column } from "@/components/ui/data-table";
import { Box, Laptop, Monitor, Pencil, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
    const [devices, setDevices] = useState<InventoryDevice[]>(mockInventory);
    const navigate = useNavigate();
    const { toast } = useToast();

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

    const columns: Column<InventoryDevice>[] = [
        {
            key: 'serialNumber',
            header: 'Serial Number',
            accessor: (item) => item.serialNumber,
            sortable: true,
            searchable: true,
            render: (value, item) => (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:underline text-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/inventory/${item.id}`);
                    }}
                >
                    <Laptop className="h-4 w-4" />
                    {value}
                </div>
            ),
        },
        {
            key: 'modelNumber',
            header: 'Model',
            accessor: (item) => item.modelNumber,
            sortable: true,
            searchable: true,
        },
        {
            key: 'manufacturer',
            header: 'Manufacturer',
            accessor: (item) => item.manufacturer,
            sortable: true,
            filterable: true,
        },
        {
            key: 'assetTag',
            header: 'Asset Tag',
            accessor: (item) => item.assetTag || '-',
            sortable: true,
            searchable: true,
            render: (value) => (
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {value}
                </span>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            accessor: (item) => item.location || '-',
            sortable: true,
            filterable: true,
        },
        {
            key: 'assignedUser',
            header: 'Assigned User',
            accessor: (item) => item.assignedUser || '',
            sortable: true,
            searchable: true,
            render: (value) => (
                value ? (
                    <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{value}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                )
            ),
        },
    ];

    const rowActions = (device: InventoryDevice) => (
        <>
            <DropdownMenuItem onClick={() => navigate(`/inventory/${device.id}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete(device.id!)}
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
            </DropdownMenuItem>
        </>
    );

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

                {/* Inventory Table */}
                <div className="rounded-md border bg-card shadow-sm p-4">
                    <DataTable
                        data={devices}
                        columns={columns}
                        globalSearchPlaceholder="Search by Serial, Model, Asset Tag..."
                        emptyMessage="No devices found"
                        rowActions={rowActions}
                        defaultPageSize={10}
                        showExport={true}
                        exportTitle="Inventory Report"
                        exportFilename="inventory"
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Inventory;
