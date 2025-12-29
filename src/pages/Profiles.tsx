import { ProfileService } from '@/api/services/profiles';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddProfileDialog } from '@/components/profiles/AddProfileDialog';
import { ProfilePlatformChart } from '@/components/profiles/ProfilePlatformChart';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Profile } from '@/types/models';
import { DataTable, Column } from '@/components/ui/data-table';
import {
    Apple,
    Archive,
    CheckCircle,
    Copy,
    Edit,
    FileText,
    Layout,
    Monitor,
    Plus,
    Shield,
    Smartphone,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockProfiles: Profile[] = [
    { id: '1', name: 'Corporate Android Default', description: 'Standard policy for all Android devices', platform: 'android', createdTime: '2024-01-15T10:00:00Z', updatedTime: '2024-01-20T14:30:00Z', status: 'active', category: 'Corporate' },
    { id: '2', name: 'iOS Executive Policy', description: 'High security policy for executives', platform: 'ios', createdTime: '2024-01-10T09:00:00Z', updatedTime: '2024-01-22T11:15:00Z', status: 'active', category: 'Specialized' },
    { id: '3', name: 'Windows Kiosk Mode', description: 'Locked down kiosk for public terminals', platform: 'windows', createdTime: '2024-01-05T16:20:00Z', updatedTime: '2024-01-18T09:45:00Z', status: 'active', category: 'Kiosk' },
    { id: '4', name: 'Field Workers Android', description: 'Optimized for battery and location tracking', platform: 'android', createdTime: '2024-01-12T11:30:00Z', updatedTime: '2024-01-21T15:20:00Z', status: 'draft', category: 'Specialized' },
    { id: '5', name: 'BYOD Limited Access', description: 'Restriction policy for personal devices', platform: 'ios', createdTime: '2024-01-08T13:45:00Z', updatedTime: '2024-01-19T10:10:00Z', status: 'active', category: 'BYOD' },
    { id: '6', name: 'Sales Tablet Configuration', description: 'iPad setup for sales team', platform: 'ios', createdTime: '2024-01-14T10:00:00Z', updatedTime: '2024-01-23T12:00:00Z', status: 'archived', category: 'Corporate' },
    { id: '7', name: 'Development Windows Workstation', description: 'Developer machine defaults', platform: 'windows', createdTime: '2024-01-02T08:15:00Z', updatedTime: '2024-01-16T16:50:00Z', status: 'draft', category: 'Corporate' },
];

const platformConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    all: { label: 'All Platforms', icon: Layout, color: 'text-primary' },
    android: { label: 'Android', icon: Smartphone, color: 'text-success' },
    ios: { label: 'iOS', icon: Apple, color: 'text-muted-foreground' },
    windows: { label: 'Windows', icon: Monitor, color: 'text-info' },
};

const Profiles = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        android: 0,
        ios: 0,
        windows: 0,
        active: 0,
        draft: 0,
        archived: 0
    });

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            let data: Profile[] = [...mockProfiles];

            if (platformFilter !== 'all') {
                data = data.filter(p => p.platform === platformFilter);
            }

            setProfiles(data);

            // Update stats based on all mock data
            const allData = mockProfiles;
            setStats({
                total: allData.length,
                android: allData.filter(p => p.platform === 'android').length,
                ios: allData.filter(p => p.platform === 'ios').length,
                windows: allData.filter(p => p.platform === 'windows').length,
                active: allData.filter(p => p.status === 'active').length,
                draft: allData.filter(p => p.status === 'draft').length,
                archived: allData.filter(p => p.status === 'archived').length
            });

        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [platformFilter]);

    const handleDelete = async (profile: Profile) => {
        if (!profile.id || !profile.platform) return;
        if (confirm(`Are you sure you want to delete profile "${profile.name}"?`)) {
            try {
                await ProfileService.deleteProfile(profile.platform, profile.id);
                fetchProfiles();
            } catch (error) {
                console.error('Failed to delete profile:', error);
            }
        }
    };

    const handleClone = async (profile: Profile) => {
        if (!profile.id) return;
        try {
            await ProfileService.cloneProfile(profile.id, { ...profile, name: `${profile.name} (Copy)` });
            fetchProfiles();
        } catch (error) {
            console.error('Failed to clone profile:', error);
        }
    };

    const getPlatformIcon = (platform?: string) => {
        const config = platformConfig[platform?.toLowerCase() || 'all'];
        const Icon = config.icon;
        return <Icon className={cn('w-4 h-4', config.color)} />;
    };

    const columns: Column<Profile>[] = [
        {
            key: 'name',
            header: 'Profile Name',
            accessor: (item) => item.name,
            sortable: true,
            searchable: true,
            render: (_, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {getPlatformIcon(item.platform)}
                    </div>
                    <div>
                        <p
                            className="font-medium text-foreground hover:text-primary cursor-pointer hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profiles/${item.platform}/${item.id}`);
                            }}
                        >
                            {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item.description}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'platform',
            header: 'Platform',
            accessor: (item) => item.platform || '',
            sortable: true,
            filterable: true,
            render: (_, item) => (
                <span className="flex items-center gap-1.5">
                    {getPlatformIcon(item.platform)}
                    <span className="text-muted-foreground capitalize">{item.platform}</span>
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (item) => item.status || 'active',
            sortable: true,
            filterable: true,
            render: (value) => {
                const statusStyles: Record<string, string> = {
                    active: 'status-badge--compliant',
                    draft: 'status-badge--pending',
                    archived: 'status-badge--non-compliant',
                };
                return (
                    <span className={cn('status-badge', statusStyles[value] || 'status-badge--pending')}>
                        {value === 'active' && <CheckCircle className="w-3.5 h-3.5" />}
                        {value === 'draft' && <FileText className="w-3.5 h-3.5" />}
                        {value === 'archived' && <Archive className="w-3.5 h-3.5" />}
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                );
            },
        },
        {
            key: 'category',
            header: 'Category',
            accessor: (item) => item.category || '-',
            sortable: true,
            filterable: true,
            render: (value) => <span className="text-muted-foreground">{value}</span>,
        },
        {
            key: 'updatedTime',
            header: 'Last Modified',
            accessor: (item) => item.updatedTime || '',
            sortable: true,
            render: (value) => (
                <span className="text-muted-foreground font-mono text-sm">
                    {value ? new Date(value).toLocaleDateString() : '-'}
                </span>
            ),
        },
    ];

    const rowActions = (profile: Profile) => (
        <>
            <DropdownMenuItem onClick={() => navigate(`/profiles/${profile.platform}/${profile.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Policies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleClone(profile)}>
                <Copy className="w-4 h-4 mr-2" />
                Clone Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(profile)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
            </DropdownMenuItem>
        </>
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Profiles
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage configuration profiles and policies for devices
                        </p>
                    </div>
                    <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Create Profile
                    </Button>
                </header>

                {/* Platform Tabs */}
                <section className="flex gap-2">
                    {Object.keys(platformConfig).map((platform) => {
                        const config = platformConfig[platform];
                        const Icon = config.icon;
                        const isActive = platformFilter === platform;
                        return (
                            <Button
                                key={platform}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPlatformFilter(platform)}
                                className={cn('gap-2', isActive && 'shadow-md')}
                            >
                                <Icon className={cn('w-4 h-4', isActive ? '' : config.color)} />
                                {config.label}
                            </Button>
                        );
                    })}
                </section>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Layout className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Profiles</p>
                            </div>
                        </div>
                    </article>

                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.active}</p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </article>

                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.draft}</p>
                                <p className="text-sm text-muted-foreground">Draft</p>
                            </div>
                        </div>
                    </article>

                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Archive className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.archived}</p>
                                <p className="text-sm text-muted-foreground">Archived</p>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Dashboard Charts */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ProfilePlatformChart data={[
                        { name: 'Android', count: stats.android, fill: 'hsl(var(--success))' },
                        { name: 'iOS', count: stats.ios, fill: 'hsl(var(--muted-foreground))' },
                        { name: 'Windows', count: stats.windows, fill: 'hsl(var(--info))' },
                    ]} />
                    <article className="panel flex items-center justify-center p-6 text-muted-foreground bg-muted/20 border-2 border-dashed">
                        <div className="text-center">
                            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Compliance Stats</p>
                            <p className="text-xs text-muted-foreground/70">Coming soon</p>
                        </div>
                    </article>
                </section>

                {/* Profiles Table */}
                <div className="rounded-md border bg-card shadow-sm p-4">
                    <DataTable
                        data={profiles}
                        columns={columns}
                        loading={loading}
                        globalSearchPlaceholder="Search profiles..."
                        emptyMessage="No profiles found."
                        rowActions={rowActions}
                        defaultPageSize={10}
                        showExport={true}
                        exportTitle="Profiles Report"
                        exportFilename="profiles"
                    />
                </div>
            </div>

            <AddProfileDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onProfileAdded={fetchProfiles}
            />
        </MainLayout>
    );
};

export default Profiles;
