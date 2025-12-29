
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Group } from '@/types/models';
import {
    AlertTriangle,
    CheckCircle,
    Edit,
    Filter,
    Folder,
    MoreVertical,
    Plus,
    Search,
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });

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
            title: "Group Created",
            description: `Group "${created.name}" has been created successfully.`,
        });
    };

    const handleDeleteGroup = async (group: Group) => {
        if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
            // Mock delete
            setGroups(groups.filter(g => g.id !== group.id));
            toast({
                title: "Group Deleted",
                description: `Group "${group.name}" has been removed.`,
            });
        }
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const stats = {
        total: groups.length,
        devices: groups.reduce((acc, curr) => acc + (curr.deviceCount || 0), 0),
        empty: groups.filter(g => !g.deviceCount || g.deviceCount === 0).length,
        active: groups.filter(g => (g.deviceCount || 0) > 0).length
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Device Groups</h1>
                        <p className="text-muted-foreground mt-1">
                            Organize devices into groups for bulk management
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Group</DialogTitle>
                                <DialogDescription>
                                    Create a group to organize your devices and apply policies.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Group Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Sales Team"
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Optional description"
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateGroup} disabled={!newGroup.name.trim()}>Create Group</Button>
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
                                <p className="text-sm text-muted-foreground">Total Groups</p>
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
                                <p className="text-sm text-muted-foreground">Total Devices</p>
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
                                <p className="text-sm text-muted-foreground">Active Groups</p>
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
                                <p className="text-sm text-muted-foreground">Empty Groups</p>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Filter Bar */}
                <section className="filter-bar" aria-label="Group filters">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="w-4 h-4" aria-hidden="true" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                            type="search"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background"
                            aria-label="Search groups"
                        />
                    </div>
                </section>

                {/* Groups Table */}
                <section className="panel" aria-label="Groups list">
                    <div className="overflow-x-auto">
                        <table className="data-table" role="table" aria-label="Device groups">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Devices</th>
                                    <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGroups.map((group) => (
                                    <tr key={group.id} className="group" tabIndex={0}>
                                        <td className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Folder className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <button
                                                    className="font-medium hover:underline text-left text-foreground hover:text-primary"
                                                    onClick={() => navigate(`/groups/${group.id}`)}
                                                >
                                                    {group.name}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground">{group.description || '-'}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                <span className="font-mono">{group.deviceCount || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${group.name}`}>
                                                        <MoreVertical className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-popover border-border">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { }}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteGroup(group)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {filteredGroups.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            {loading ? 'Loading...' : 'No groups match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredGroups.length} of {groups.length} groups
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Previous</Button>
                            <Button variant="outline" size="sm" disabled>Next</Button>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
