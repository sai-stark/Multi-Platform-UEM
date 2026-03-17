import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Shield,
  Smartphone,
  AppWindow,
  Globe,
  Users,
  MapPin,
  Package,
  Database,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { getAssetUrl } from '@/config/env';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Static route segment labels
const segmentLabels: Record<string, string> = {
  profiles: 'Profiles',
  devices: 'Devices',
  applications: 'Applications',
  'web-applications': 'Web Applications',
  policies: 'Policies',
  enrollment: 'Enrollment',
  groups: 'Groups',
  geofences: 'Geofences',
  inventory: 'Inventory',
  repositories: 'Repositories',
  android: 'Android',
  ios: 'iOS',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  enterprise: 'Enterprise',
  setup: 'Setup',
  callback: 'Callback',
  policy: 'Policy',
  new: 'New',
};

// Section icons for top-level route segments
const sectionIcons: Record<string, React.ElementType> = {
  profiles: Shield,
  devices: Smartphone,
  applications: AppWindow,
  'web-applications': Globe,
  enrollment: Users,
  groups: Users,
  geofences: MapPin,
  inventory: Package,
  repositories: Database,
  enterprise: Settings,
  policies: Settings,
};

// Platform segments get an image icon
const platformImages: Record<string, string> = {
  android: '/Assets/android.svg',
  ios: '/Assets/apple.svg',
  windows: '/Assets/microsoft.svg',
  macos: '/Assets/mac_os.svg',
  linux: '/Assets/linux.svg',
};

// Segments that are known platforms
const platformSegments = new Set(['android', 'ios', 'windows', 'macos', 'linux']);

// Segments that are known parents (list pages) - clicking platform on these should pass ?platform=
const listParents = new Set(['profiles', 'devices', 'applications', 'repositories']);

function isPotentialId(segment: string): boolean {
  if (segmentLabels[segment]) return false;
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return true;
  if (/^\d+$/.test(segment)) return true;
  return !segmentLabels[segment];
}

interface BreadcrumbItemData {
  label: string;
  href: string;
  isCurrent: boolean;
  isPlatform: boolean;
  platformImage?: string;
  isEntityId: boolean;
  sectionIcon?: React.ElementType;
}

export function AppBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const { entityName, entityIcon } = useBreadcrumb();
  const prevItemsLength = useRef(0);

  const pathname = location.pathname;

  // Keyboard shortcut: Alt + ← to navigate up one breadcrumb level
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowLeft') {
      const segs = pathname.split('/').filter(Boolean);
      if (segs.length > 0) {
        e.preventDefault();
        const parentPath = '/' + segs.slice(0, -1).join('/');
        navigate(parentPath || '/');
      }
    }
  }, [pathname, navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Don't render on dashboard
  if (pathname === '/' || pathname === '') return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  // Check for ?platform= query param (used by list pages)
  const searchParams = new URLSearchParams(location.search);
  const queryPlatform = searchParams.get('platform');

  // Build breadcrumb items
  const items: BreadcrumbItemData[] = [];
  let pathAccumulator = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    pathAccumulator += `/${segment}`;
    const isPlatform = platformSegments.has(segment);
    const isId = isPotentialId(segment);

    const hasQueryPlatformAfter = !isPlatform && !isId && i === segments.length - 1 && queryPlatform && queryPlatform !== 'all' && platformSegments.has(queryPlatform);
    const isLast = i === segments.length - 1 && !hasQueryPlatformAfter;

    let href = pathAccumulator;
    if (isPlatform && i > 0 && listParents.has(segments[i - 1])) {
      href = `/${segments[i - 1]}?platform=${segment}`;
    }

    let label = segmentLabels[segment] || segment;

    if (isId) {
      if (entityName) {
        label = entityName;
      } else {
        label = 'Details';
      }
    }

    // Attach section icon only for top-level known sections, or use entityIcon for entity segments
    let resolvedSectionIcon = (i === 0 && sectionIcons[segment]) ? sectionIcons[segment] : undefined;
    if (isId && entityIcon) {
      resolvedSectionIcon = entityIcon;
    }

    items.push({
      label,
      href,
      isCurrent: isLast,
      isPlatform,
      platformImage: isPlatform ? getAssetUrl(platformImages[segment]) : undefined,
      isEntityId: isId,
      sectionIcon: resolvedSectionIcon,
    });
  }

  // Append query platform as a breadcrumb segment
  if (queryPlatform && queryPlatform !== 'all' && platformSegments.has(queryPlatform)) {
    const alreadyInPath = segments.some(s => s === queryPlatform);
    if (!alreadyInPath) {
      const parentSegment = segments[0];
      items.push({
        label: segmentLabels[queryPlatform] || queryPlatform,
        href: `/${parentSegment}?platform=${queryPlatform}`,
        isCurrent: true,
        isPlatform: true,
        platformImage: getAssetUrl(platformImages[queryPlatform]),
        isEntityId: false,
      });
      if (items.length > 1) {
        items[items.length - 2].isCurrent = false;
      }
    }
  }

  // Track items length for animation direction
  const isNavigatingDeeper = items.length > prevItemsLength.current;
  useEffect(() => {
    prevItemsLength.current = items.length;
  });

  // Truncation: if more than 5 items, collapse middle ones
  const MAX_VISIBLE = 5;
  let displayItems: (BreadcrumbItemData | 'ellipsis')[];
  if (items.length > MAX_VISIBLE) {
    // Show first item, ellipsis, then last 3 items
    displayItems = [items[0], 'ellipsis', ...items.slice(-3)];
  } else {
    displayItems = items;
  }

  const renderItem = (item: BreadcrumbItemData, index: number) => {
    const Icon = item.sectionIcon;
    const animClass = isNavigatingDeeper
      ? 'animate-in fade-in slide-in-from-left-2 duration-300'
      : 'animate-in fade-in duration-200';

    if (item.isCurrent) {
      return (
        <BreadcrumbPage className={`flex items-center gap-1.5 text-blue-500 font-medium ${animClass}`}>
          {item.isPlatform && item.platformImage && (
            <img src={item.platformImage} alt={item.label} className="w-4 h-4 object-contain" />
          )}
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{item.label}</span>
        </BreadcrumbPage>
      );
    }

    return (
      <BreadcrumbLink asChild>
        <Link
          to={item.href}
          className={`flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground ${animClass}`}
        >
          {item.isPlatform && item.platformImage && (
            <img src={item.platformImage} alt={item.label} className="w-4 h-4 object-contain" />
          )}
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{item.label}</span>
        </Link>
      </BreadcrumbLink>
    );
  };

  return (
    <div className="px-6 pt-4">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {displayItems.map((entry, index) => {
            if (entry === 'ellipsis') {
              return (
                <span key="ellipsis" className="contents">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="flex items-center text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </span>
                  </BreadcrumbItem>
                </span>
              );
            }

            return (
              <span key={entry.href + index} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {renderItem(entry, index)}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
