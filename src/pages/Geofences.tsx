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
import { mockGeofences } from "@/data/mockGeofences";
import { Geofence } from "@/types/models";
import { DataTable, Column } from "@/components/ui/data-table";
import { Circle, Hexagon, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Geofences = () => {
    const [geofences, setGeofences] = useState<Geofence[]>(mockGeofences);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

    const stats = {
        total: mockGeofences.length,
        circle: mockGeofences.filter(g => g.type === 'CIRCLE').length,
        polygon: mockGeofences.filter(g => g.type === 'POLYGON').length,
    };

    const handleDelete = async (id: string) => {
        setGeofences(prev => prev.filter(g => g.id !== id));
        toast({ title: "Success", description: "Geofence deleted successfully (Mock)" });
    };

    const openDeleteDialog = (id: string) => {
        setTargetDeleteId(id);
        setShowDeleteDialog(true);
    };

    const columns: Column<Geofence>[] = [
        {
            key: 'name',
            header: 'Name',
            accessor: (item) => item.name,
            render: (value, item) => (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:underline text-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/geofences/${item.id}`);
                    }}
                >
                    <MapPin className="h-4 w-4" />
                    {value}
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            accessor: (item) => item.type,
            render: (value) => (
                <div className="flex items-center gap-2">
                    {value === 'POLYGON' ? (
                        <><Hexagon className="h-3 w-3" /> Polygon</>
                    ) : (
                        <><Circle className="h-3 w-3" /> Circle</>
                    )}
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            accessor: (item) => item.description || '-',
        },
        {
            key: 'details',
            header: 'Details',
            accessor: (item) => item.type === 'POLYGON' ? `${item.coordinates?.length || 0} Points` : `${item.radius}m`,
            render: (_, item) => (
                item.type === 'POLYGON' ? (
                    <span className="text-xs text-muted-foreground">{item.coordinates?.length || 0} Points</span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Rad: {item.radius}m <br />
                        ({item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)})
                    </span>
                )
            ),
        },
    ];

    const rowActions = (geofence: Geofence) => (
        <>
            <DropdownMenuItem onClick={() => navigate(`/geofences/${geofence.id}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(geofence.id!)}
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
                        <AlertDialogTitle>Delete Geofence?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the geofence. Any device policies using it may be affected.
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
                            Geofences
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage geographic boundaries for device policies and alerts.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/geofences/new")} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Geofence
                    </Button>
                </div>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-info" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Geofences</p>
                                <p className="stat-card__value text-2xl">{stats.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <Circle className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Circles</p>
                                <p className="stat-card__value text-2xl">{stats.circle.toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Hexagon className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Polygons</p>
                                <p className="stat-card__value text-2xl">{stats.polygon.toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Geofences Table */}
                <div className="rounded-md border bg-card shadow-sm p-4">
                    <DataTable
                        data={geofences}
                        columns={columns}
                        globalSearchPlaceholder="Search geofences..."
                        emptyMessage="No geofences found"
                        rowActions={rowActions}
                        defaultPageSize={10}
                        showExport={true}
                        exportTitle="Geofences Report"
                        exportFilename="geofences"
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Geofences;
