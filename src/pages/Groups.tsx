import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Group } from '@/types/models';
import { DataTable, Column } from '@/components/ui/data-table';
import {
    AlertTriangle,
    CheckCircle,
    Edit,
    Folder,
    Plus,
    Trash2,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockGroups: Group[] = [
    { id: '1', name: 'Corporate Devices', description: 'All company owned devices', deviceCount: 156 },
    { id: '2', name: 'BYOD Users', description: 'Personal devices with limited access', deviceCount: 42 },
    { id: '3', name: 'Kiosk Terminals', description: 'Public facing display units', deviceCount: 12 },
    { id: '4', name: 'Executive Team', description: 'Devices assigned to C-level execs', deviceCount: 8 },
    { id: '5', name: 'Sales Department', description: 'Field sales tablets and phones', deviceCount: 85 },
];

export default function Groups() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [targetDeleteGroup, setTargetDeleteGroup] = useState<Group | null>(null);

    const fetchGroups = async () => {
        setLoading(true);
        // Simulate API
        setTimeout(() => {
            setGroups(mockGroups);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        if (!newGroup.name) return;

        // Mock creation
        const created: Group = {
            id: Math.random().toString(36).substr(2, 9),
            name: newGroup.name,
            description: newGroup.description,
            deviceCount: 0
        };

        setGroups([...groups, created]);
        setIsCreateDialogOpen(false);
        setNewGroup({ name: '', description: '' });

        toast({
            title: t('groups.toasts.created'),
            description: t('groups.toasts.createdDesc').replace('{name}', created.name),
        });
    };

    const handleDeleteGroup = async (group: Group) => {
        // Mock delete
        setGroups(groups.filter(g => g.id !== group.id));
        toast({
            title: t('groups.toasts.deleted'),
            description: t('groups.toasts.deletedDesc').replace('{name}', group.name),
        });
    };

    const openDeleteDialog = (group: Group) => {
        setTargetDeleteGroup(group);
        setShowDeleteDialog(true);
    };

    // Stats
    const stats = {
        total: groups.length,
        devices: groups.reduce((acc, curr) => acc + (curr.deviceCount || 0), 0),
        empty: groups.filter(g => !g.deviceCount || g.deviceCount === 0).length,
        active: groups.filter(g => (g.deviceCount || 0) > 0).length
    };

    const columns: Column<Group>[] = [
        {
            key: 'name',
            header: t('groups.table.name'),
            accessor: (item) => item.name,
            render: (_, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Folder className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <button
                        className="font-medium hover:underline text-left text-foreground hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/groups/${item.id}`);
                        }}
                    >
                        {item.name}
                    </button>
                </div>
            ),
        },
        {
            key: 'description',
            header: t('groups.table.description'),
            accessor: (item) => item.description || '-',
            render: (value) => <span className="text-muted-foreground">{value}</span>,
        },
        {
            key: 'deviceCount',
            header: t('groups.table.devices'),
            accessor: (item) => item.deviceCount || 0,
            align: 'center',
            render: (value) => (
                <div className="flex items-center gap-2 justify-center">
                    <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-mono">{value}</span>
                </div>
            ),
        },
    ];

    const rowActions = (group: Group) => (
        <>
            <DropdownMenuLabel>{t('groups.actions.actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}`)}>
                {t('groups.actions.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { }}>
                <Edit className="w-4 h-4 mr-2" />
                {t('groups.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(group)}>
                <Trash2 className="w-4 h-4 mr-2" />
                {t('groups.actions.delete')}
            </DropdownMenuItem>
        </>
    );

    return (
        <MainLayout>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('groups.deleteDialog.title').replace('{name}', targetDeleteGroup?.name || '')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('groups.deleteDialog.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('groups.deleteDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => targetDeleteGroup && handleDeleteGroup(targetDeleteGroup)}
                        >
                            {t('groups.actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
                {/* Page Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t('groups.title')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('groups.subtitle')}
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                {t('groups.createGroup')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('groups.createDialog.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('groups.createDialog.desc')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('groups.createDialog.nameLabel')}</Label>
                                    <Input
                                        id="name"
                                        placeholder={t('groups.createDialog.namePlaceholder')}
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('groups.createDialog.descLabel')}</Label>
                                    <Textarea
                                        id="description"
                                        placeholder={t('groups.createDialog.descPlaceholder')}
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('groups.createDialog.cancel')}</Button>
                                <Button onClick={handleCreateGroup} disabled={!newGroup.name.trim()}>{t('groups.createGroup')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Group statistics">
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                <Folder className="w-5 h-5 text-info" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">{t('groups.stats.total')}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-success" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.devices}</p>
                                <p className="text-sm text-muted-foreground">{t('groups.stats.devices')}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.active}</p>
                                <p className="text-sm text-muted-foreground">{t('groups.stats.active')}</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-warning" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.empty}</p>
                                <p className="text-sm text-muted-foreground">{t('groups.stats.empty')}</p>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Groups Table */}
                <div className="rounded-md border bg-card shadow-sm p-4">
                    <DataTable
                        data={groups}
                        columns={columns}
                        loading={loading}
                        globalSearchPlaceholder={t('groups.table.searchPlaceholder')}
                        emptyMessage={t('groups.table.emptyMessage')}
                        rowActions={rowActions}
                        defaultPageSize={10}
                        showExport={true}
                        exportTitle={t('groups.table.exportTitle')}
                        exportFilename="groups"
                    />
                </div>
            </div>
        </MainLayout>
    );
}
