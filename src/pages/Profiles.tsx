import { ProfileService } from '@/api/services/profiles';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddProfileDialog } from '@/components/profiles/AddProfileDialog';
import { ProfilePlatformChart } from '@/components/profiles/ProfilePlatformChart';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Profile } from '@/types/models';
import {
    Apple,
    Archive,
    CheckCircle,
    Copy,
    Edit,
    FileText,
    Filter,
    Layout,
    Monitor,
    MoreVertical,
    Plus,
    Search,
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
    const { t } = useLanguage(); // or just use strings if translation not ready
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
            let data: Profile[] = [];
            // For verification purposes as requested by user, always include mock profiles
            // In a real scenario, we might want to toggle this or only use if API fails
            data = [...mockProfiles];

            if (platformFilter === 'all') {
                try {
                    // Attempt to fetch real data
                    /* 
                     const res = await ProfileService.getBriefProfiles({ size: 100 }, searchQuery);
                     if (res && res.content) {
                         data = [...data, ...res.content];
                     }
                     */
                } catch (e) {
                    console.error("Failed to fetch brief profiles", e);
                }
            } else {
                // Filter mock data locally if looking for specific platform, to simulate API behavior
                data = data.filter(p => p.platform === platformFilter);

                /*
               const res = await ProfileService.getProfiles(platformFilter as Platform, { size: 100 }, searchQuery);
               if (res && res.content) {
                    data = [...data, ...res.content];
               }
               */
            }

            if (searchQuery) {
                data = data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())));
            }

            if (statusFilter !== 'all') {
                data = data.filter(p => p.status === statusFilter);
            }

            if (categoryFilter !== 'all') {
                data = data.filter(p => p.category === categoryFilter);
            }

            setProfiles(data);

            // Update stats
            setStats({
                total: data.length,
                android: data.filter(p => p.platform === 'android').length,
                ios: data.filter(p => p.platform === 'ios').length,
                windows: data.filter(p => p.platform === 'windows').length,
                active: data.filter(p => p.status === 'active').length,
                draft: data.filter(p => p.status === 'draft').length,
                archived: data.filter(p => p.status === 'archived').length
            });

        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [platformFilter, searchQuery, statusFilter, categoryFilter]);

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
            // We probably need to implement a clone dialog or just call clone endpoint
            // Clone endpoint requires a profile object (payload)
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
                    {/* Placeholder for another chart, e.g. Status distribution if we had status in Profile model */}
                    <article className="panel flex items-center justify-center p-6 text-muted-foreground bg-muted/20 border-2 border-dashed">
                        {/* Future Implementation: Compliance Chart */}
                        <div className="text-center">
                            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Compliance Stats</p>
                            <p className="text-xs text-muted-foreground/70">Coming soon</p>
                        </div>
                    </article>
                </section>

                {/* Filters */}
                <section className="filter-bar">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search profiles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="status-filter" className="text-sm text-muted-foreground">Status:</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="status-filter" className="w-36 bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="category-filter" className="text-sm text-muted-foreground">Category:</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger id="category-filter" className="w-40 bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Corporate">Corporate</SelectItem>
                                <SelectItem value="BYOD">BYOD</SelectItem>
                                <SelectItem value="Kiosk">Kiosk</SelectItem>
                                <SelectItem value="Specialized">Specialized</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                {/* Profiles Table */}
                <section className="panel">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th scope="col">Profile Name</th>
                                    <th scope="col">Platform</th>
                                    <th scope="col">Last Modified</th>
                                    <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.length > 0 ? (
                                    profiles.map((profile) => (
                                        <tr key={profile.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                        {getPlatformIcon(profile.platform)}
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="font-medium text-foreground hover:text-primary cursor-pointer hover:underline"
                                                            onClick={() => navigate(`/profiles/${profile.platform}/${profile.id}`)}
                                                        >
                                                            {profile.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{profile.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="flex items-center gap-1.5">
                                                    {getPlatformIcon(profile.platform)}
                                                    <span className="text-muted-foreground capitalize">{profile.platform}</span>
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground font-mono text-sm">
                                                {profile.updatedTime ? new Date(profile.updatedTime).toLocaleDateString() : '-'}
                                            </td>
                                            <td>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border">
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
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                            {loading ? 'Loading profiles...' : 'No profiles found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
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
