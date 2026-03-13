import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Application, ApplicationService } from '@/api/services/applications';
import { IosApplication } from '@/types/application';
import { Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import { useAndroidFeaturesEnabled } from '@/contexts/EnterpriseContext';
import { 
  Package, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { platformConfig } from '@/components/applications/applicationConstants';
import { GooglePlayIframe } from '@/components/applications/GooglePlayIframe';
import { IosAddAppDialog } from '@/components/applications/IosAddAppDialog';
import { MacosAddAppDialog } from '@/components/applications/MacosAddAppDialog';
import { AndroidAppManager } from '@/components/applications/AndroidAppManager';
import { IosAppManager } from '@/components/applications/IosAppManager';
import { MacosAppManager } from '@/components/applications/MacosAppManager';
import { MacosApplication } from '@/types/application';

const Applications = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { shouldBlock: shouldBlockAndroid } = useAndroidFeaturesEnabled();

  // Read platform from URL search params (e.g., ?platform=ios)
  const getInitialPlatform = (): Platform => {
    const urlPlatform = searchParams.get('platform');
    if (urlPlatform === 'ios' || urlPlatform === 'android' || urlPlatform === 'macos') return urlPlatform;
    return shouldBlockAndroid ? 'ios' : 'android';
  };

  const [platform, setPlatform] = useState<Platform>(getInitialPlatform());

  // Sync URL search params when platform tab changes
  useEffect(() => {
    setSearchParams({ platform }, { replace: true });
  }, [platform, setSearchParams]);

  const [applications, setApplications] = useState<Application[]>([]);
  const [iosApplications, setIosApplications] = useState<IosApplication[]>([]);
  const [macosApplications, setMacosApplications] = useState<MacosApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await ApplicationService.getApplications(platform);
      if (platform === 'ios') {
        setIosApplications((response.content || []) as unknown as IosApplication[]);
        setApplications([]);
        setMacosApplications([]);
      } else if (platform === 'macos') {
        setMacosApplications((response.content || []) as unknown as MacosApplication[]);
        setApplications([]);
        setIosApplications([]);
      } else {
        setApplications(response.content || []);
        setIosApplications([]);
        setMacosApplications([]);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to load applications'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [platform]);

  // Stats
  const currentApps = platform === 'ios' ? iosApplications : platform === 'macos' ? macosApplications : applications;
  const stats = {
    total: currentApps.length,
    mandatory: applications.filter(a => a.action === 'MANDATORY').length,
    optional: applications.filter(a => a.action === 'OPTIONAL').length,
    blocked: applications.filter(a => a.action === 'BLOCKED').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage mobile applications for your device fleet
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Application
          </Button>
        </header>

        {/* Platform Tabs */}
        <section
          className="grid grid-cols-5 w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm p-1.5 shadow-sm"
          role="tablist"
          aria-label="Filter by platform"
        >
          {Object.keys(platformConfig).map((platformKey) => {
            const config = platformConfig[platformKey];
            const Icon = config.icon;
            const isActive = platform === platformKey;
            const isDisabled = config.disabled;
            return (
              <button
                key={platformKey}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  if (platformKey === 'android' && shouldBlockAndroid) {
                    toast({
                      title: 'Enterprise Setup Required',
                      description: 'Android Enterprise must be configured before using Android features.',
                      variant: 'destructive',
                    });
                    navigate('/android/enterprise/setup?returnTo=/applications');
                    return;
                  }
                  setPlatform(platformKey as Platform);
                }}
                className={cn(
                  "relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "bg-background text-foreground shadow-md border border-border/50 backdrop-blur-md",
                  !isActive &&
                    !isDisabled &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isDisabled &&
                    "text-muted-foreground/50 cursor-not-allowed opacity-50"
                )}
              >
                {config.image ? (
                  <img
                    src={config.image}
                    alt={config.label}
                    className={cn(
                      "w-5 h-5 object-contain",
                      isDisabled && "opacity-50"
                    )}
                  />
                ) : (
                  <Icon
                    className={cn("w-4 h-4", isActive ? config.color : "")}
                  />
                )}
                {config.label}
              </button>
            );
          })}
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Application statistics">
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-info" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Apps</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.mandatory.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Mandatory</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.optional.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Optional</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__value text-2xl">{stats.blocked.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </article>
        </section>

        {/* Applications Table */}
        <div className="rounded-md border bg-card shadow-sm p-4">
          {platform === 'ios' ? (
            <IosAppManager
              applications={iosApplications}
              loading={loading}
              onRefresh={fetchApplications}
              platform={platform}
            />
          ) : platform === 'macos' ? (
            <MacosAppManager
              applications={macosApplications}
              loading={loading}
              onRefresh={fetchApplications}
              platform={platform}
            />
          ) : (
            <AndroidAppManager
              applications={applications}
              loading={loading}
              onRefresh={fetchApplications}
              platform={platform}
            />
          )}
        </div>

        {/* Add Application Dialog - Platform Aware */}
        {platform === 'android' ? (
          <GooglePlayIframe
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onAppsAdded={fetchApplications}
          />
        ) : platform === 'ios' ? (
          <IosAddAppDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onAppRegistered={fetchApplications}
          />
        ) : platform === 'macos' ? (
          <MacosAddAppDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onAppRegistered={fetchApplications}
          />
        ) : null}
      </div>
    </MainLayout>
  );
};

export default Applications;
