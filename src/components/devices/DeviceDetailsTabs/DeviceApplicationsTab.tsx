import { DeviceService } from '@/api/services/devices';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { DeviceApplicationList, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    AlertCircle,
    AppWindow,
    ArrowUpCircle,
    CheckCircle2,
    Package,
    RefreshCw,
    Shield,
    Store
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionHeader } from './DeviceOverviewTab';

interface DeviceApplicationsTabProps {
    platform: string;
    id: string;
}

export function DeviceApplicationsTab({ platform, id }: DeviceApplicationsTabProps) {
    const { toast } = useToast();
    const [applications, setApplications] = useState<DeviceApplicationList>([]);
    const [loadingApps, setLoadingApps] = useState(false);

    useEffect(() => {
        const loadApps = async () => {
            if (!platform || !id) return;
            try {
                setLoadingApps(true);
                const apps = await DeviceService.getDeviceApplications(platform as Platform, id);
                const appsAny = apps as any;
                if (appsAny?.content && Array.isArray(appsAny.content)) {
                    setApplications(appsAny.content);
                } else if (Array.isArray(apps)) {
                    setApplications(apps);
                } else {
                    setApplications([]);
                }
            } catch (e) {
                console.error("Failed to load apps", e);
                setApplications([]);
                toast({
                    title: "Warning",
                    description: getErrorMessage(e, "Failed to load device applications."),
                    variant: "destructive"
                });
            } finally {
                setLoadingApps(false);
            }
        };

        loadApps();
    }, [platform, id, toast]);

    const formatSize = (bytes: number) => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' B';
    };

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            {Array.isArray(applications) && applications.length > 0 && (() => {
                const managedCount = applications.filter(a => a.isManaged).length;
                const updateCount = applications.filter(a => a.hasUpdateAvailable).length;
                const totalSize = applications.reduce((sum, a) => sum + (a.bundleSize || 0) + (a.dynamicSize || 0), 0);

                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-primary">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10"><Package className="w-5 h-5 text-primary" /></div>
                                <div><p className="text-2xl font-bold">{applications.length}</p><p className="text-xs text-muted-foreground">Total Apps</p></div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-success">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-success/10"><Shield className="w-5 h-5 text-success" /></div>
                                <div><p className="text-2xl font-bold">{managedCount}</p><p className="text-xs text-muted-foreground">Managed</p></div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-warning">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-warning/10"><ArrowUpCircle className="w-5 h-5 text-warning" /></div>
                                <div><p className="text-2xl font-bold">{updateCount}</p><p className="text-xs text-muted-foreground">Updates Available</p></div>
                            </CardContent>
                        </Card>
                    </div>
                );
            })()}

            {/* Search / Header */}
            <Card>
                <CardHeader>
                    <SectionHeader title="Installed Applications" icon={AppWindow} />
                </CardHeader>
                <CardContent>
                    {loadingApps ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading applications...
                        </div>
                    ) : !Array.isArray(applications) || applications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Package className="w-10 h-10 mb-2 opacity-40" />
                            <p>No applications found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto min-w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[300px]">App Name</TableHead>
                                        <TableHead>Identifier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Management</TableHead>
                                        <TableHead className="text-right">Version</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.map((app, index) => {
                                        const appColors = [
                                            'bg-blue-500/10 text-blue-600',
                                            'bg-emerald-500/10 text-emerald-600',
                                            'bg-purple-500/10 text-purple-600',
                                            'bg-amber-500/10 text-amber-600',
                                            'bg-rose-500/10 text-rose-600',
                                            'bg-cyan-500/10 text-cyan-600',
                                        ];
                                        const colorClass = appColors[index % appColors.length];
                                        const managed = app.isManaged || app.iosDeviceApplicationExtraDetails?.status === 'Managed';

                                        return (
                                            <TableRow key={app.id || index} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="truncate block max-w-[200px]" title={app.name}>{app.name || 'Unknown App'}</span>
                                                            {app.hasUpdateAvailable && (
                                                                <span className="flex items-center text-[10px] text-warning mt-0.5">
                                                                    <ArrowUpCircle className="w-3 h-3 mr-1" /> Update Available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block" title={app.identifier || app.packageName}>
                                                        {app.identifier || app.packageName || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(app.applicationStatus || app.isInstalled) && (
                                                            <Badge variant="outline" className="bg-info/10 text-info border-info/30 font-normal">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" /> {app.applicationStatus || 'Installed'}
                                                            </Badge>
                                                        )}
                                                        {app.isBlocked && (
                                                            <Badge variant="destructive" className="font-normal"><AlertCircle className="w-3 h-3 mr-1" /> Blocked</Badge>
                                                        )}
                                                        {app.betaApp && (
                                                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 font-normal">Beta</Badge>
                                                        )}
                                                        {app.isAppClip && (
                                                            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-500/30 font-normal">App Clip</Badge>
                                                        )}
                                                        {app.appStoreVendable && (
                                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 font-normal">
                                                                <Store className="w-3 h-3 mr-1" /> App Store
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`font-normal ${managed ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-muted-foreground/20'}`} >
                                                        {managed ? <><Shield className="w-3 h-3 mr-1" /> Managed</> : 'Unmanaged'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {app.shortVersion || app.appVersion || app.version || '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
