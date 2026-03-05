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
import { mockGeofences } from "@/data/mockGeofences";
import { Geofence } from "@/types/models";
import { DataTable, Column } from "@/components/ui/data-table";
import { Circle, Hexagon, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Geofences = () => {
    const [geofences, setGeofences] = useState<Geofence[]>(mockGeofences);
    const navigate = useNavigate();
    const { t } = useLanguage();
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
        toast({ title: t('geofences.toasts.success'), description: t('geofences.toasts.deleted') });
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
                    <Button onClick={() => navigate("/geofences/new")} className="gap-2">
                        <Plus className="h-4 w-4" /> {t('geofences.addGeofence')}
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
                        globalSearchPlaceholder={t('geofences.table.searchPlaceholder')}
                        emptyMessage={t('geofences.table.emptyMessage')}
                        rowActions={rowActions}
                        defaultPageSize={10}
                        showExport={true}
                        exportTitle={t('geofences.table.exportTitle')}
                        exportFilename="geofences"
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Geofences;
