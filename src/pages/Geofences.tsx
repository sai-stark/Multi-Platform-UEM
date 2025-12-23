import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { mockGeofences } from "@/data/mockGeofences";
import { Geofence } from "@/types/models";
import { Circle, Filter, Hexagon, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Geofences = () => {
    // Initialize with mock data directly
    const [geofences, setGeofences] = useState<Geofence[]>(mockGeofences);
    const [loading, setLoading] = useState(false); // No real loading needed
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const navigate = useNavigate();
    const { toast } = useToast();

    // Effect to handle search filtering on the local mock data
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = mockGeofences.filter(g => {
            const matchesSearch = g.name.toLowerCase().includes(lowerTerm) ||
                (g.description && g.description.toLowerCase().includes(lowerTerm));
            const matchesType = typeFilter === 'all' || g.type === typeFilter;
            return matchesSearch && matchesType;
        });
        setGeofences(filtered);
    }, [searchTerm, typeFilter]);

    const stats = {
        total: mockGeofences.length,
        circle: mockGeofences.filter(g => g.type === 'CIRCLE').length,
        polygon: mockGeofences.filter(g => g.type === 'POLYGON').length,
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this geofence? (Mock Delete)")) return;

        // Simulate deletion
        setGeofences(prev => prev.filter(g => g.id !== id));

        toast({
            title: "Success",
            description: "Geofence deleted successfully (Mock)",
        });
    };

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

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-fit">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search geofences..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="CIRCLE">Circle</SelectItem>
                                <SelectItem value="POLYGON">Polygon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : geofences.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No geofences found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                geofences.map((geofence) => (
                                    <TableRow key={geofence.id}>
                                        <TableCell className="font-medium">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer hover:underline text-primary"
                                                onClick={() => navigate(`/geofences/${geofence.id}`)}
                                            >
                                                <MapPin className="h-4 w-4" />
                                                {geofence.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {geofence.type === 'POLYGON' ? (
                                                    <><Hexagon className="h-3 w-3" /> Polygon</>
                                                ) : (
                                                    <><Circle className="h-3 w-3" /> Circle</>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{geofence.description || "-"}</TableCell>
                                        <TableCell>
                                            {geofence.type === 'POLYGON' ? (
                                                <span className="text-xs text-muted-foreground">{geofence.coordinates?.length || 0} Points</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Rad: {geofence.radius}m <br />
                                                    ({geofence.latitude?.toFixed(4)}, {geofence.longitude?.toFixed(4)})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/geofences/${geofence.id}`)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(geofence.id!)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </MainLayout>
    );
};

export default Geofences;
