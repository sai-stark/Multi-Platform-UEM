import { DeviceService } from '@/api/services/devices';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DeviceApplicationList, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    AlertCircle,
    AppWindow,
    ArrowUpCircle,
    CheckCircle2,
    Database,
    Package,
    RefreshCw,
    Shield,
    Store
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionHeader, formatBytes } from './DeviceOverviewTab';

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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <Card className="border-l-4 border-l-info">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-info/10"><Database className="w-5 h-5 text-info" /></div>
                                <div><p className="text-2xl font-bold">{formatSize(totalSize)}</p><p className="text-xs text-muted-foreground">Total Storage</p></div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {applications.map((app, index) => {
                                const bundleBytes = app.bundleSize || 0;
                                const dynamicBytes = app.dynamicSize || 0;
                                const appColors = [
                                    'from-blue-500/20 to-indigo-500/20 text-blue-600',
                                    'from-emerald-500/20 to-teal-500/20 text-emerald-600',
                                    'from-purple-500/20 to-pink-500/20 text-purple-600',
                                    'from-amber-500/20 to-orange-500/20 text-amber-600',
                                    'from-rose-500/20 to-red-500/20 text-rose-600',
                                    'from-cyan-500/20 to-sky-500/20 text-cyan-600',
                                ];
                                const colorClass = appColors[index % appColors.length];
                                const managed = app.isManaged || app.iosDeviceApplicationExtraDetails?.status === 'Managed';

                                return (
                                    <div
                                        key={app.id || index}
                                        className="group relative rounded-xl border bg-card p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                                    >
                                        {/* Header row */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClass} shrink-0`}>
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-sm truncate" title={app.name}>{app.name || 'Unknown App'}</h4>
                                                <p className="text-xs text-muted-foreground font-mono truncate" title={app.identifier || app.packageName}>
                                                    {app.identifier || app.packageName || '-'}
                                                </p>
                                            </div>
                                            {app.hasUpdateAvailable && (
                                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px] shrink-0">
                                                    <ArrowUpCircle className="w-3 h-3 mr-1" /> Update
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Badges row */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            <Badge variant="outline" className={managed ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-muted-foreground/20'} >
                                                {managed ? <><Shield className="w-3 h-3 mr-1" /> Managed</> : 'Unmanaged'}
                                            </Badge>
                                            {(app.applicationStatus || app.isInstalled) && (
                                                <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> {app.applicationStatus || 'Installed'}
                                                </Badge>
                                            )}
                                            {app.isBlocked && (
                                                <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Blocked</Badge>
                                            )}
                                            {app.betaApp && (
                                                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">Beta</Badge>
                                            )}
                                            {app.isAppClip && (
                                                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-500/30">App Clip</Badge>
                                            )}
                                            {app.appStoreVendable && (
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                    <Store className="w-3 h-3 mr-1" /> App Store
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Details grid */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50">
                                                <span className="text-muted-foreground">Version</span>
                                                <span className="ml-auto font-medium">{app.shortVersion || app.appVersion || app.version || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50">
                                                <span className="text-muted-foreground">Bundle</span>
                                                <span className="ml-auto font-medium">{bundleBytes > 0 ? formatBytes(bundleBytes) : '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50">
                                                <span className="text-muted-foreground">Data</span>
                                                <span className="ml-auto font-medium">{dynamicBytes > 0 ? formatBytes(dynamicBytes) : '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50">
                                                <span className="text-muted-foreground">Validated</span>
                                                <span className="ml-auto">
                                                    {app.isValidated ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
