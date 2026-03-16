import { DeviceService } from '@/api/services/devices';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Column, DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { DeviceApplicationList, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    AlertCircle,
    AppWindow,
    ArrowUpCircle,
    CheckCircle2,
    Package,
    Shield
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
                // Fetch first page to get total page count
                const PAGE_SIZE = 100;
                const firstPage = await DeviceService.getDeviceApplications(platform as Platform, id, { page: 0, size: PAGE_SIZE });
                const firstPageAny = firstPage as any;

                let allApps: any[] = [];

                if (firstPageAny?.content && Array.isArray(firstPageAny.content)) {
                    allApps = [...firstPageAny.content];

                    // If there are more pages, fetch them all
                    const totalPages = firstPageAny?.page?.totalPages ?? 1;
                    if (totalPages > 1) {
                        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);
                        const remaining = await Promise.all(
                            remainingPages.map(pageNum =>
                                DeviceService.getDeviceApplications(platform as Platform, id, { page: pageNum, size: PAGE_SIZE })
                            )
                        );
                        remaining.forEach(res => {
                            const resAny = res as any;
                            if (resAny?.content && Array.isArray(resAny.content)) {
                                allApps = allApps.concat(resAny.content);
                            }
                        });
                    }
                } else if (Array.isArray(firstPage)) {
                    allApps = firstPage;
                }

                // Deduplicate by identifier (package name) to avoid API returning duplicate entries
                const seen = new Set<string>();
                const deduplicatedApps = allApps.filter((app: any) => {
                    const key = app.identifier || app.packageName || app.name;
                    if (!key) return true;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setApplications(deduplicatedApps);
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

    const columns: Column<any>[] = [
        {
            key: 'name',
            header: 'App Name',
            accessor: (app) => app.name || 'Unknown App',
            render: (_, app) => {
                return (
                    <div className="min-w-0">
                        <span className="font-medium truncate block max-w-[200px]" title={app.name || 'Unknown App'}>
                            {app.name || 'Unknown App'}
                        </span>
                        {app.hasUpdateAvailable && (
                            <span className="flex items-center text-[10px] text-warning mt-0.5 font-normal">
                                <ArrowUpCircle className="w-3 h-3 mr-1" /> Update Available
                            </span>
                        )}
                    </div>
                );
            },
            sortable: true,
            filterable: true,
            searchable: true,
            width: 300,
        },
        {
            key: 'packageName',
            header: 'Package Name',
            accessor: (app) => app.identifier || app.packageName || '-',
            render: (value) => (
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block" title={value}>
                    {value}
                </span>
            ),
            sortable: true,
            filterable: true,
            searchable: true,
        },
        {
            key: 'version',
            header: 'Version',
            accessor: (app) => app.shortVersion || app.appVersion || app.version || '-',
            sortable: true,
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (app) => app.applicationStatus || (app.isInstalled ? 'Installed' : ''),
            render: (_, app) => (
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
                </div>
            ),
            sortable: true,
            filterable: true,
        },
        {
            key: 'management',
            header: 'Management',
            accessor: (app) => app.isManaged || app.iosDeviceApplicationExtraDetails?.status === 'Managed' ? 'Managed' : 'Unmanaged',
            render: (value) => {
                const managed = value === 'Managed';
                return (
                    <Badge variant="outline" className={`font-normal ${managed ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-muted-foreground/20'}`} >
                        {managed ? <><Shield className="w-3 h-3 mr-1" /> Managed</> : 'Unmanaged'}
                    </Badge>
                );
            },
            sortable: true,
            filterable: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            {Array.isArray(applications) && applications.length > 0 && (() => {
                const managedCount = applications.filter(a => a.isManaged || a.iosDeviceApplicationExtraDetails?.status === 'Managed').length;
                const updateCount = applications.filter(a => a.hasUpdateAvailable).length;

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
                    <div className="rounded-md border border-border/50">
                        <DataTable
                            data={Array.isArray(applications) ? applications : []}
                            columns={columns}
                            loading={loadingApps}
                            searchable={true}
                            filterable={true}
                            sortable={true}
                            pagination={true}
                            globalSearch={true}
                            globalSearchPlaceholder="Search applications..."
                            emptyMessage="No applications found."
                            defaultSort={{ key: 'management', dir: 'desc' }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
