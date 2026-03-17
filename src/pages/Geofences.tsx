import { GeofenceService } from "@/api/services/geofence";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table";
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Geofence } from "@/types/models";
import { Circle, Hexagon, MapPin, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Geofences = () => {
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

    // Server-side pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchGeofences = useCallback(async (page: number = currentPage, size: number = pageSize) => {
        setLoading(true);
        try {
            const res = await GeofenceService.getGeofences({ pageNumber: page - 1, pageSize: size });
            setGeofences(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch geofences", error);
            toast({ title: "Error", description: "Failed to fetch geofences", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, toast]);

    useEffect(() => {
        fetchGeofences(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const stats = {
        total: totalElements,
        circle: geofences.filter(g => g.type === 'CIRCLE').length,
        polygon: geofences.filter(g => g.type === 'POLYGON').length,
    };

    const handleDelete = async (id: string) => {
        try {
            await GeofenceService.deleteGeofence(id);
            toast({ title: t('geofences.toasts.success'), description: t('geofences.toasts.deleted') });
            fetchGeofences(currentPage, pageSize);
        } catch (error) {
            console.error("Failed to delete geofence", error);
            toast({ title: "Error", description: "Failed to delete geofence", variant: "destructive" });
        }
    };

    const openDeleteDialog = (id: string) => {
        setTargetDeleteId(id);
        setShowDeleteDialog(true);
    };

    const columns: Column<Geofence>[] = [
        {
            key: 'name',
            header: t('geofences.table.name'),
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
            header: t('geofences.table.type'),
            accessor: (item) => item.type,
            render: (value) => (
                <div className="flex items-center gap-2">
                    {value === 'POLYGON' ? (
                        <><Hexagon className="h-3 w-3" />{t('geofences.table.polygon')}</>
                    ) : (
                        <><Circle className="h-3 w-3" />{t('geofences.table.circle')}</>
                    )}
                </div>
            ),
        },
        {
            key: 'description',
            header: t('geofences.table.description'),
            accessor: (item) => item.description || '-',
        },
        {
            key: 'details',
            header: t('geofences.table.details'),
            accessor: (item) => item.type === 'POLYGON' ? `${item.coordinates?.length || 0} ${t('geofences.table.points')}` : `${item.radius}m`,
            render: (_, item) => (
                item.type === 'POLYGON' ? (
                    <span className="text-xs text-muted-foreground">{item.coordinates?.length || 0} {t('geofences.table.points')}</span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {t('geofences.table.rad')}: {item.radius}m <br />
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
                {t('geofences.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="text-destructive"
                onClick={() => openDeleteDialog(geofence.id!)}
            >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('geofences.actions.delete')}
            </DropdownMenuItem>
        </>
    );

    return (
        <MainLayout>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('geofences.deleteDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('geofences.deleteDialog.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('geofences.deleteDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => targetDeleteId && handleDelete(targetDeleteId)}
                        >
                            {t('geofences.actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {t('geofences.title')}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t('geofences.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => fetchGeofences(currentPage, pageSize)} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Sync
                        </Button>
                        <Button onClick={() => navigate("/geofences/new")} className="gap-2">
                            <Plus className="h-4 w-4" /> {t('geofences.addGeofence')}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <article className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-info" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('geofences.stats.total')}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">{t('geofences.stats.circle')}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">{t('geofences.stats.polygon')}</p>
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
                        loading={loading}
                        globalSearchPlaceholder={t('geofences.table.searchPlaceholder')}
                        emptyMessage={
                            loading ? "Loading geofences..." : (
                                <EmptyState
                                    icon={MapPin}
                                    title="No Geofences Found"
                                    description={t('geofences.table.emptyMessage')}
                                    action={
                                        <Button variant="outline" onClick={() => navigate("/geofences/new")}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('geofences.addGeofence')}
                                        </Button>
                                    }
                                />
                            )
                        }
                        rowActions={rowActions}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50, 100]}
                        showExport={true}
                        exportTitle={t('geofences.table.exportTitle')}
                        exportFilename="geofences"
                        serverSidePagination={true}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Geofences;
