import { RepositoryService } from '@/api/services/repository';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CustomRepo } from '@/types/models';
import {
    CheckCircle,
    Database,
    Edit,
    Filter,
    HardDrive,
    MoreVertical,
    Plus,
    Search,
    Server,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Repositories() {
    const { toast } = useToast();
    const [repositories, setRepositories] = useState<CustomRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Form state
    const [repoForm, setRepoForm] = useState<Partial<CustomRepo>>({
        name: '',
        url: '',
        type: 'GENERIC',
        platform: 'linux'
    });

    const fetchRepositories = async () => {
        setLoading(true);
        try {
            const data = await RepositoryService.getAllRepositories({ page: 0, size: 100 }); // Fetch all for now
            setRepositories(data.content || []);
        } catch (error) {
            console.error("Failed to fetch repositories", error);
            // Mock data fallback for dev/demo if API fails or is empty
            // setRepositories([
            //    { id: '1', name: 'Ubuntu Main', url: 'http://archive.ubuntu.com/ubuntu', type: 'APT', platform: 'linux' },
            //    { id: '2', name: 'CentOS Base', url: 'http://mirror.centos.org/centos', type: 'YUM', platform: 'linux' }
            // ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepositories();
    }, []);

    const resetForm = () => {
        setRepoForm({
            name: '',
            url: '',
            type: 'GENERIC',
            platform: 'linux'
        });
    };

    const handleCreateRepository = async () => {
        try {
            if (!repoForm.name || !repoForm.url) {
                toast({
                    title: "Validation Error",
                    description: "Name and URL are required.",
                    variant: "destructive"
                });
                return;
            }

            await RepositoryService.createRepository(repoForm as CustomRepo);

            toast({
                title: "Repository Created",
                description: `Repository "${repoForm.name}" has been created successfully.`,
            });

            setIsCreateDialogOpen(false);
            resetForm();
            fetchRepositories();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create repository.",
                variant: "destructive"
            });
        }
    };

    const handleEditClick = (repo: CustomRepo) => {
        setRepoForm({ ...repo });
        setIsEditDialogOpen(true);
    };

    const handleUpdateRepository = async () => {
        try {
            if (!repoForm.id || !repoForm.name || !repoForm.url) return;

            await RepositoryService.updateRepository(repoForm.id, repoForm as CustomRepo);

            toast({
                title: "Repository Updated",
                description: `Repository "${repoForm.name}" has been updated successfully.`,
            });

            setIsEditDialogOpen(false);
            resetForm();
            fetchRepositories();

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update repository.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteRepository = async (repo: CustomRepo) => {
        if (!repo.id) return;

        if (confirm(`Are you sure you want to delete "${repo.name}"?`)) {
            try {
                await RepositoryService.deleteRepository(repo.id);
                toast({
                    title: "Repository Deleted",
                    description: `Repository "${repo.name}" has been removed.`,
                });
                fetchRepositories();
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to delete repository.",
                    variant: "destructive"
                });
            }
        }
    };

    const filteredRepositories = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const stats = {
        total: repositories.length,
        linux: repositories.filter(r => r.platform === 'linux').length,
        apt: repositories.filter(r => r.type === 'APT').length,
        yum: repositories.filter(r => r.type === 'YUM').length
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage software repositories for your devices
                        </p>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                        setIsCreateDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create Repository
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Repository</DialogTitle>
                                <DialogDescription>
                                    Add a new software repository source.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-name">Name</Label>
                                    <Input
                                        id="create-name"
                                        placeholder="e.g., Ubuntu Main"
                                        value={repoForm.name}
                                        onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-url">URL</Label>
                                    <Input
                                        id="create-url"
                                        placeholder="https://..."
                                        value={repoForm.url}
                                        onChange={(e) => setRepoForm({ ...repoForm, url: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-type">Type</Label>
                                        <Select
                                            value={repoForm.type}
                                            onValueChange={(val: any) => setRepoForm({ ...repoForm, type: val })}
                                        >
                                            <SelectTrigger id="create-type">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="APT">APT</SelectItem>
                                                <SelectItem value="YUM">YUM</SelectItem>
                                                <SelectItem value="GENERIC">Generic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-platform">Platform</Label>
                                        <Select
                                            value={repoForm.platform}
                                            onValueChange={(val: any) => setRepoForm({ ...repoForm, platform: val })}
                                        >
                                            <SelectTrigger id="create-platform">
                                                <SelectValue placeholder="Select Platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="linux">Linux</SelectItem>
                                                <SelectItem value="windows">Windows</SelectItem>
                                                <SelectItem value="android">Android</SelectItem>
                                                <SelectItem value="macos">macOS</SelectItem>
                                                <SelectItem value="ios">iOS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateRepository} disabled={!repoForm.name || !repoForm.url}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </header>

                {/* Edit Dialog - Separate to avoid confusion with Create state usually */}
                <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Repository</DialogTitle>
                            <DialogDescription>
                                Update repository details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    placeholder="e.g., Ubuntu Main"
                                    value={repoForm.name}
                                    onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-url">URL</Label>
                                <Input
                                    id="edit-url"
                                    placeholder="https://..."
                                    value={repoForm.url}
                                    onChange={(e) => setRepoForm({ ...repoForm, url: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-type">Type</Label>
                                    <Select
                                        value={repoForm.type}
                                        onValueChange={(val: any) => setRepoForm({ ...repoForm, type: val })}
                                    >
                                        <SelectTrigger id="edit-type">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="APT">APT</SelectItem>
                                            <SelectItem value="YUM">YUM</SelectItem>
                                            <SelectItem value="GENERIC">Generic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-platform">Platform</Label>
                                    <Select
                                        value={repoForm.platform}
                                        onValueChange={(val: any) => setRepoForm({ ...repoForm, platform: val })}
                                    >
                                        <SelectTrigger id="edit-platform">
                                            <SelectValue placeholder="Select Platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="linux">Linux</SelectItem>
                                            <SelectItem value="windows">Windows</SelectItem>
                                            <SelectItem value="android">Android</SelectItem>
                                            <SelectItem value="macos">macOS</SelectItem>
                                            <SelectItem value="ios">iOS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateRepository}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Repository statistics">
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Repositories</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                                <Server className="w-5 h-5 text-info" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.linux}</p>
                                <p className="text-sm text-muted-foreground">Linux Repos</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                <HardDrive className="w-5 h-5 text-warning" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.apt}</p>
                                <p className="text-sm text-muted-foreground">APT Sources</p>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="stat-card__value text-2xl">{stats.yum}</p>
                                <p className="text-sm text-muted-foreground">YUM Sources</p>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Filter Bar */}
                <section className="filter-bar" aria-label="Repository filters">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="w-4 h-4" aria-hidden="true" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                            type="search"
                            placeholder="Search repositories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background"
                            aria-label="Search repositories"
                        />
                    </div>
                </section>

                {/* Repositories Table */}
                <section className="panel" aria-label="Repositories list">
                    <div className="overflow-x-auto">
                        <table className="data-table" role="table" aria-label="Software Repositories">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">URL</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Platform</th>
                                    <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRepositories.map((repo) => (
                                    <tr key={repo.id} className="group" tabIndex={0}>
                                        <td className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Database className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <span className="font-medium text-foreground">
                                                    {repo.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground truncate max-w-[300px]" title={repo.url}>
                                            {repo.url}
                                        </td>
                                        <td>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {repo.type}
                                            </span>
                                        </td>
                                        <td className="capitalize text-muted-foreground">{repo.platform}</td>
                                        <td>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${repo.name}`}>
                                                        <MoreVertical className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-popover border-border">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditClick(repo)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRepository(repo)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRepositories.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            {loading ? 'Loading...' : 'No repositories match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - Mock for now */}
                    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredRepositories.length} of {repositories.length} repositories
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

