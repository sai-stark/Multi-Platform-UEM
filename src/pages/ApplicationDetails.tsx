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
import { IosApplication, ApplicationConfiguration } from '@/types/application';
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
  Calendar,
  Star,
  ExternalLink,
  Info,
  Image,
  Globe,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import { usePlatformValidation } from '@/hooks/usePlatformValidation';

// Action configuration for badges
const actionConfig: Record<AppActionType, { label: string; icon: typeof CheckCircle; className: string }> = {
  MANDATORY: { label: 'Mandatory', icon: CheckCircle, className: 'status-badge--compliant' },
  OPTIONAL: { label: 'Optional', icon: Clock, className: 'status-badge--pending' },
  BLOCKED: { label: 'Blocked', icon: XCircle, className: 'status-badge--non-compliant' },
};

// ============================================
// iOS Application Details View
// ============================================
interface IosDetailsProps {
  id: string;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>['toast'];
}

const IosApplicationDetailsView = ({ id, navigate, toast }: IosDetailsProps) => {
  const [app, setApp] = useState<IosApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Configuration state
  const [configs, setConfigs] = useState<ApplicationConfiguration[]>([]);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newConfigType, setNewConfigType] = useState<'string' | 'integer' | 'boolean'>('string');
  const [showAddConfig, setShowAddConfig] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ApplicationService.getIosApplication('ios', id);
        setApp(data);
        // Load configurations from app data or fetch separately
        if (data.applicationConfigurations) {
          setConfigs(data.applicationConfigurations);
        }
      } catch (err) {
        console.error('Failed to fetch iOS application:', err);
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  // Fetch configurations separately
  const fetchConfigs = async () => {
    if (!id) return;
    setConfigsLoading(true);
    try {
      const data = await ApplicationService.getConfigurations('ios', id);
      setConfigs(data || []);
    } catch (err) {
      // 204 No Content is expected when empty
      setConfigs([]);
    } finally {
      setConfigsLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!newConfigKey.trim() || !id) return;
    setConfigSaving(true);
    try {
      const updated = [...configs, { key: newConfigKey.trim(), valueType: newConfigType }];
      await ApplicationService.updateConfigurations('ios', id, updated);
      setConfigs(updated);
      setNewConfigKey('');
      setNewConfigType('string');
      setShowAddConfig(false);
      toast({ title: 'Success', description: 'Configuration added' });
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to add configuration'), variant: 'destructive' });
    } finally {
      setConfigSaving(false);
    }
  };

  const handleDeleteAllConfigs = async () => {
    if (!id) return;
    setConfigSaving(true);
    try {
      await ApplicationService.deleteConfigurations('ios', id);
      setConfigs([]);
      toast({ title: 'Success', description: 'Configurations deleted' });
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to delete configurations'), variant: 'destructive' });
    } finally {
      setConfigSaving(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast({ title: 'Copied', description: `${fieldName} copied to clipboard` });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const size = parseInt(bytes, 10);
    if (isNaN(size)) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderStars = (rating?: number) => {
    if (rating == null) return null;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i < full
                ? 'fill-yellow-400 text-yellow-400'
                : i === full && half
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-muted-foreground/30'
            )}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading iOS application details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !app) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading application</h3>
            <p className="text-muted-foreground mb-4">{error || 'Application not found'}</p>
            <Button onClick={() => navigate('/applications')}>Back to Applications</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <header className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/applications')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-4">
              {app.artworkUrl100 || app.artworkUrl60 ? (
                <img
                  src={app.artworkUrl100 || app.artworkUrl60}
                  alt={app.trackName || app.name}
                  className="w-16 h-16 rounded-xl shadow-sm border"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border">
                  <Apple className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {app.trackName || app.name}
                  </h1>
                  {app.enrollmentStatus && (
                    <Badge variant={app.enrollmentStatus === 'REGISTERED' ? 'default' : 'secondary'}>
                      {app.enrollmentStatus}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground font-mono text-sm">{app.bundleId}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(app.bundleId, 'Bundle ID')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className={cn('h-3 w-3', copiedField === 'Bundle ID' && 'text-green-500')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copiedField === 'Bundle ID' ? 'Copied!' : 'Copy bundle ID'}
                    </TooltipContent>
                  </Tooltip>
                </div>
                {app.sellerName && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    by {app.sellerName}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-sm font-medium font-mono mt-1">{app.version || '-'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Min iOS</p>
                <p className="text-sm font-medium mt-1">{app.minimumOsVersion || '-'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="text-sm font-medium mt-1">{formatFileSize(app.fileSizeBytes)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-medium mt-1">{app.formattedPrice || 'Free'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Rating</p>
                <div className="mt-1">{renderStars(app.averageUserRating) || <span className="text-sm">-</span>}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Content Rating</p>
                <p className="text-sm font-medium mt-1">{app.trackContentRating || '-'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description & Release Notes */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {app.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line max-h-[300px] overflow-y-auto">
                    {app.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No description available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Release Notes
                </CardTitle>
                {app.currentVersionReleaseDate && (
                  <CardDescription>
                    {new Date(app.currentVersionReleaseDate).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {app.releaseNotes ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line max-h-[300px] overflow-y-auto">
                    {app.releaseNotes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No release notes available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Screenshots */}
          {app.screenshotUrls && app.screenshotUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Image className="h-4 w-4" />
                  Screenshots
                </CardTitle>
                <CardDescription>{app.screenshotUrls.length} screenshot{app.screenshotUrls.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {app.screenshotUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="h-52 rounded-lg border shadow-sm flex-shrink-0 object-contain"
                      loading="lazy"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ratings & Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                Ratings & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                  <div className="mt-1">{renderStars(app.averageUserRating) || <span className="text-sm">-</span>}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Ratings</p>
                  <p className="text-lg font-semibold mt-1">
                    {app.userRatingCount?.toLocaleString() || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Version Rating</p>
                  <div className="mt-1">{renderStars(app.averageUserRatingForCurrentVersion) || <span className="text-sm">-</span>}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Version Ratings</p>
                  <p className="text-lg font-semibold mt-1">
                    {app.userRatingCountForCurrentVersion?.toLocaleString() || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Configurations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4" />
                    Managed App Configurations
                  </CardTitle>
                  <CardDescription>{configs.length} configuration{configs.length !== 1 ? 's' : ''}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchConfigs} disabled={configsLoading}>
                    {configsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
                  </Button>
                  <Button size="sm" onClick={() => setShowAddConfig(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                  {configs.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteAllConfigs} disabled={configSaving}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showAddConfig && (
                <div className="flex items-end gap-3 mb-4 p-3 border rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Key</p>
                    <Input
                      placeholder="Configuration key"
                      value={newConfigKey}
                      onChange={(e) => setNewConfigKey(e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <Select value={newConfigType} onValueChange={(v) => setNewConfigType(v as 'string' | 'integer' | 'boolean')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddConfig} disabled={!newConfigKey.trim() || configSaving} size="sm">
                    {configSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowAddConfig(false); setNewConfigKey(''); }}>
                    Cancel
                  </Button>
                </div>
              )}

              {configs.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Key</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Value Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configs.map((config, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 font-mono text-sm">{config.key}</td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="text-xs">{config.valueType}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No configurations defined. Click "Add" to create one.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {app.primaryGenreName && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{app.primaryGenreName}</Badge>
                  </div>
                )}
                {app.genres && app.genres.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Genres</p>
                    <div className="flex flex-wrap gap-1">
                      {app.genres.map((g, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {app.languageCodesISO2A && app.languageCodesISO2A.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      <Globe className="w-3 h-3 inline mr-1" />
                      Languages ({app.languageCodesISO2A.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {app.languageCodesISO2A.slice(0, 10).map((code, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{code}</Badge>
                      ))}
                      {app.languageCodesISO2A.length > 10 && (
                        <Badge variant="secondary" className="text-xs">+{app.languageCodesISO2A.length - 10}</Badge>
                      )}
                    </div>
                  </div>
                )}
                {app.releaseDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Release Date</p>
                    <p className="text-sm font-medium mt-1">
                      {new Date(app.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {app.artistName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Developer</p>
                    <p className="text-sm font-medium mt-1">{app.artistName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">VPP Device Licensing</p>
                  <p className="text-sm font-medium mt-1">
                    {app.isVppDeviceBasedLicensingEnabled ? 'Enabled' : 'Not available'}
                  </p>
                </div>
              </div>

              {/* Links */}
              <div className="mt-6 pt-4 border-t flex flex-wrap gap-3">
                {app.trackViewUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(app.trackViewUrl, '_blank')}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    View on App Store
                  </Button>
                )}
                {app.artistViewUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(app.artistViewUrl, '_blank')}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    View Developer
                  </Button>
                )}
                {app.sellerUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(app.sellerUrl, '_blank')}>
                    <Globe className="w-3.5 h-3.5 mr-2" />
                    Seller Website
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
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
          description: getErrorMessage(err, 'Failed to load application details'),
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

  // iOS Application Details View
  if (platform === 'ios') {
    return <IosApplicationDetailsView id={id!} navigate={navigate} toast={toast} />;
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
