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

    const stats = {
        total: mockGeofences.length,
        circle: mockGeofences.filter(g => g.type === 'CIRCLE').length,
        polygon: mockGeofences.filter(g => g.type === 'POLYGON').length,
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this geofence? (Mock Delete)")) return;

        setGeofences(prev => prev.filter(g => g.id !== id));

        toast({
            title: "Success",
            description: "Geofence deleted successfully (Mock)",
        });
    };

    const columns: Column<Geofence>[] = [
        {
            key: 'name',
            header: 'Name',
            accessor: (item) => item.name,
            sortable: true,
            searchable: true,
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
            sortable: true,
            filterable: true,
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
            sortable: true,
            searchable: true,
        },
        {
            key: 'details',
            header: 'Details',
            accessor: (item) => item.type === 'POLYGON' ? `${item.coordinates?.length || 0} Points` : `${item.radius}m`,
            sortable: true,
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
                onClick={() => handleDelete(geofence.id!)}
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
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Geofences</p>
                                    <h3 className="text-2xl font-bold">{stats.total}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <Circle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Circles</p>
                                    <h3 className="text-2xl font-bold">{stats.circle}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <Hexagon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Polygons</p>
                                    <h3 className="text-2xl font-bold">{stats.polygon}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
