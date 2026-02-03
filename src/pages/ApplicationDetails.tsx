import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Application, 
  ApplicationService, 
  ApplicationVersion,
  ApplicationPermission,
  AppActionType 
} from '@/api/services/applications';
import { Platform } from '@/types/models';
import { 
  ArrowLeft,
  Package,
  Smartphone,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  Lock,
  Apple,
  Users,
  Tag,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { usePlatformValidation } from '@/hooks/usePlatformValidation';

// Action configuration for badges
const actionConfig: Record<AppActionType, { label: string; icon: typeof CheckCircle; className: string }> = {
  MANDATORY: { label: 'Mandatory', icon: CheckCircle, className: 'status-badge--compliant' },
  OPTIONAL: { label: 'Optional', icon: Clock, className: 'status-badge--pending' },
  BLOCKED: { label: 'Blocked', icon: XCircle, className: 'status-badge--non-compliant' },
};

const ApplicationDetails = () => {
  const { platform, id } = useParams<{ platform: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock permissions data (would come from API in real implementation)
  const [permissions] = useState<ApplicationPermission[]>([
    { permissionId: 'android.permission.INTERNET', name: 'Internet Access', description: 'Allows the app to access the internet' },
    { permissionId: 'android.permission.CAMERA', name: 'Camera', description: 'Allows the app to use the camera' },
    { permissionId: 'android.permission.READ_CONTACTS', name: 'Read Contacts', description: 'Allows the app to read your contacts' },
    { permissionId: 'android.permission.WRITE_EXTERNAL_STORAGE', name: 'Storage Write', description: 'Allows the app to write to external storage' },
    { permissionId: 'android.permission.ACCESS_FINE_LOCATION', name: 'Fine Location', description: 'Allows the app to access precise location' },
    { permissionId: 'android.permission.RECEIVE_BOOT_COMPLETED', name: 'Boot Completed', description: 'Allows the app to receive boot completed broadcast' },
  ]);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      if (!platform || !id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const app = await ApplicationService.getApplication(platform as Platform, id);
        setApplication(app);
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError('Failed to load application details');
        toast({
          title: 'Error',
          description: 'Failed to load application details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [platform, id, toast]);

  // Validate URL platform matches fetched application's actual platform
  const { shouldRender } = usePlatformValidation(
    platform,
    application?.platform,
    loading,
    (correctPlatform) => `/applications/${correctPlatform}/${id}`
  );

  // Don't render if we're about to redirect due to platform mismatch
  if (!shouldRender) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: 'Copied',
        description: `${fieldName} copied to clipboard`
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get app type badge
  const getAppTypeBadge = (app: Application) => {
    if (app.isEmmApp) return <Badge variant="secondary">EMM App</Badge>;
    if (app.isEmmAgent) return <Badge variant="outline">EMM Agent</Badge>;
    if (app.isLauncher) return <Badge variant="default">Launcher</Badge>;
    return <Badge variant="secondary">Standard</Badge>;
  };

  // Get app icon based on type
  const getAppIcon = (app: Application) => {
    if (app.isEmmApp) return <Shield className="h-6 w-6 text-blue-500" />;
    if (app.isEmmAgent) return <Settings className="h-6 w-6 text-green-500" />;
    if (app.isLauncher) return <Smartphone className="h-6 w-6 text-purple-500" />;
    return <Package className="h-6 w-6 text-muted-foreground" />;
  };

  // Version table columns
  const versionColumns: Column<ApplicationVersion>[] = [
    {
      key: 'version',
      header: 'Version',
      accessor: (item) => item.version || item.versionName || '-',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {item.versionCode && (
            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {item.versionCode}
            </span>
          )}
          {item.isProduction && (
            <Badge className="text-xs bg-green-100 text-green-800">Production</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'deviceCount',
      header: 'Devices',
      accessor: (item) => item.deviceCount || 0,
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'profileCount',
      header: 'Profiles',
      accessor: (item) => item.profileCount || 0,
      sortable: true,
      align: 'center',
    },
    {
      key: 'action',
      header: 'Status',
      accessor: (item) => item.action || 'OPTIONAL',
      sortable: true,
      render: (_, item) => {
        const action = item.action || 'OPTIONAL';
        const config = actionConfig[action];
        const ActionIcon = config.icon;
        return (
          <span className={cn('status-badge', config.className)}>
            <ActionIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'url',
      header: 'Download',
      accessor: (item) => item.url || '',
      render: (value) => value ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(value, '_blank')}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
    },
  ];

  // iOS Coming Soon placeholder
  if (platform === 'ios') {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <header className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/applications')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                iOS Application Details
              </h1>
              <p className="text-muted-foreground mt-1">
                View detailed information about this iOS application
              </p>
            </div>
          </header>

          {/* Coming Soon Card */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Apple className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                iOS Application Details
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Detailed application information for iOS apps is coming soon. 
                Stay tuned for full iOS application management capabilities.
              </p>
              <Button variant="outline" onClick={() => navigate('/applications')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading application details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !application) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading application</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'Application not found'}
            </p>
            <Button onClick={() => navigate('/applications')}>
              Back to Applications
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate total devices
  const totalDevices = application.versions?.reduce(
    (sum, v) => sum + (v.deviceCount || 0),
    0
  ) || 0;

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <header className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/applications')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-4">
              {application.iconUrl ? (
                <img 
                  src={application.iconUrl} 
                  alt={application.name}
                  className="w-14 h-14 rounded-xl shadow-sm border"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border">
                  {getAppIcon(application)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {application.name}
                  </h1>
                  {getAppTypeBadge(application)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground font-mono text-sm">
                    {application.packageName}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(application.packageName, 'Package name')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className={cn(
                          "h-3 w-3",
                          copiedField === 'Package name' && "text-success"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copiedField === 'Package name' ? 'Copied!' : 'Copy package name'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </header>

          {/* Basic Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Version</label>
                  <p className="text-sm font-medium mt-1">{application.version || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Total Devices
                  </label>
                  <p className="text-sm font-medium mt-1">{totalDevices}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Category
                  </label>
                  {application.category ? (
                    <Badge variant="outline" className="mt-1">{application.category}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">-</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {(() => {
                      const action = application.action || 'OPTIONAL';
                      const config = actionConfig[action];
                      const ActionIcon = config.icon;
                      return (
                        <span className={cn('status-badge', config.className)}>
                          <ActionIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {application.description && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">{application.description}</p>
                </div>
              )}
              {application.appTracks && application.appTracks.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">App Tracks</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.appTracks.map((track) => (
                      <Badge key={track.trackId} variant="secondary" className="text-xs">
                        {track.trackAlias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Versions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Versions
              </CardTitle>
              <CardDescription>
                {application.versions?.length || 0} version{(application.versions?.length || 0) !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.versions && application.versions.length > 0 ? (
                <DataTable
                  data={application.versions}
                  columns={versionColumns}
                  globalSearchPlaceholder="Search versions..."
                  emptyMessage="No versions found"
                  defaultPageSize={5}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No version information available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Device Distribution & Permissions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Device Distribution Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Device Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalDevices > 0 && application.versions ? (
                  <div className="space-y-4">
                    {application.versions.map((version, index) => (
                      <div key={version.id || index} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">
                          v{version.version || version.versionName}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${((version.deviceCount || 0) / totalDevices) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">
                              {version.deviceCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No devices have this application installed
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Permissions Card - Fixed height, scrollable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Permissions
                </CardTitle>
                <CardDescription>
                  {permissions.length} permission{permissions.length !== 1 ? 's' : ''} required
                </CardDescription>
              </CardHeader>
              <CardContent>
                {permissions.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {permissions.map((permission, index) => (
                      <div
                        key={permission.permissionId || index}
                        className="p-3 border rounded-lg space-y-1 bg-muted/30"
                      >
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={permission.permissionId}>
                              {permission.name || permission.permissionId}
                            </p>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {permission.description}
                              </p>
                            )}
                            {permission.name && (
                              <p 
                                className="text-xs text-muted-foreground font-mono mt-1 truncate" 
                                title={permission.permissionId}
                              >
                                {permission.permissionId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No permissions information available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
};

export default ApplicationDetails;
