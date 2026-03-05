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
import { useLanguage } from "@/contexts/LanguageContext";
import { mockInventory } from "@/data/mockInventory";
import { InventoryDevice } from "@/types/models";
import { DataTable, Column } from "@/components/ui/data-table";
import { Box, Laptop, Monitor, Pencil, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
    const [devices, setDevices] = useState<InventoryDevice[]>(mockInventory);
    const navigate = useNavigate();
    const { t } = useLanguage();
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
        toast({ title: t('inventory.toasts.success'), description: t('inventory.toasts.deleted') });
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
            header: t('inventory.table.serialNumber'),
            accessor: (item) => item.serialNumber,
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
            header: t('inventory.table.model'),
            accessor: (item) => item.modelNumber,
        },
        {
            key: 'manufacturer',
            header: t('inventory.table.manufacturer'),
            accessor: (item) => item.manufacturer,
        },
        {
            key: 'assetTag',
            header: t('inventory.table.assetTag'),
            accessor: (item) => item.assetTag || '-',
            render: (value) => (
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {value}
                </span>
            ),
        },
        {
            key: 'location',
            header: t('inventory.table.location'),
            accessor: (item) => item.location || '-',
        },
        {
            key: 'assignedUser',
            header: t('inventory.table.assignedUser'),
            accessor: (item) => item.assignedUser || '',
            render: (value) => (
                value ? (
                    <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{value}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground italic">{t('inventory.table.unassigned')}</span>
                )
            ),
        },
    ];

    const rowActions = (device: InventoryDevice) => (
        <>
            <DropdownMenuItem onClick={() => navigate(`/inventory/${device.id}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                {t('inventory.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(device.id!)}
            >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('inventory.actions.delete')}
            </DropdownMenuItem>
        </>
    );

    return (
        <MainLayout>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('inventory.deleteDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('inventory.deleteDialog.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('inventory.deleteDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => targetDeleteId && handleDelete(targetDeleteId)}
                        >
                            {t('inventory.actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {t('inventory.title')}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t('inventory.subtitle')}
                        </p>
                    </div>
                    <Button onClick={() => navigate("/inventory/new")} className="gap-2">
                        <Plus className="h-4 w-4" /> {t('inventory.addDevice')}
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
                                <p className="text-sm font-medium text-muted-foreground">{t('inventory.stats.total')}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">{t('inventory.stats.assigned')}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">{t('inventory.stats.inStock')}</p>
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
                        globalSearchPlaceholder={t('inventory.table.searchPlaceholder')}
                        emptyMessage={t('inventory.table.emptyMessage')}
                        rowActions={rowActions}
                        defaultPageSize={10}
                        showExport={true}
                        exportTitle={t('inventory.table.exportTitle')}
                        exportFilename="inventory"
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Inventory;
