import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

    const stats = {
        total: mockInventory.length,
        assigned: mockInventory.filter(d => !!d.assignedUser).length,
        unassigned: mockInventory.filter(d => !d.assignedUser).length,
    };

    const handleDelete = async (id: string) => {
        setDevices(prev => prev.filter(d => d.id !== id));
        toast({ title: "Success", description: "Device deleted successfully (Mock)" });
    };

    const openDeleteDialog = (id: string) => {
        setTargetDeleteId(id);
        setShowDeleteDialog(true);
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
                onClick={() => openDeleteDialog(device.id!)}
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
            </DropdownMenuItem>
        </>
    );

    return (
        <MainLayout>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Device?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the device from inventory. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => targetDeleteId && handleDelete(targetDeleteId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
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
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                <Monitor className="h-5 w-5 text-info" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                                <p className="stat-card__value text-2xl">{stats.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                                <p className="stat-card__value text-2xl">{stats.assigned.toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                <Box className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                                <p className="stat-card__value text-2xl">{stats.unassigned.toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
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
