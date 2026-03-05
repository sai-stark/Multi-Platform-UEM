import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { setEntityName, setEntityIcon } = useBreadcrumb();
  const { t } = useLanguage();

  useEffect(() => {
    setEntityName(t('notFound.subtitle'));
    setEntityIcon(AlertTriangle);
  }, [setEntityName, setEntityIcon]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto space-y-6">
          {/* SVG Illustration */}
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 280 200"
              className="w-64 h-48 text-muted-foreground"
              fill="none"
            >
              {/* Background window/browser frame */}
              <rect x="40" y="20" width="200" height="150" rx="8" className="stroke-muted-foreground/30" strokeWidth="2" fill="none" />
              <rect x="40" y="20" width="200" height="24" rx="8" className="fill-muted-foreground/10" />
              <rect x="40" y="36" width="200" height="8" className="fill-muted-foreground/10" />
              {/* Browser dots */}
              <circle cx="56" cy="32" r="3" className="fill-red-400/60" />
              <circle cx="68" cy="32" r="3" className="fill-yellow-400/60" />
              <circle cx="80" cy="32" r="3" className="fill-green-400/60" />
              {/* URL bar */}
              <rect x="96" y="27" width="130" height="10" rx="3" className="fill-muted-foreground/10 stroke-muted-foreground/20" strokeWidth="1" />
              {/* Broken page content - question mark */}
              <circle cx="140" cy="105" r="35" className="stroke-muted-foreground/25" strokeWidth="2" strokeDasharray="6 4" fill="none" />
              <text x="140" y="115" textAnchor="middle" className="fill-muted-foreground/40" fontSize="36" fontWeight="bold" fontFamily="system-ui">?</text>
              {/* Decorative floating elements */}
              <rect x="60" y="65" width="20" height="3" rx="1.5" className="fill-muted-foreground/15" />
              <rect x="60" y="72" width="14" height="3" rx="1.5" className="fill-muted-foreground/10" />
              <rect x="200" y="65" width="20" height="3" rx="1.5" className="fill-muted-foreground/15" />
              <rect x="206" y="72" width="14" height="3" rx="1.5" className="fill-muted-foreground/10" />
              <rect x="60" y="140" width="24" height="3" rx="1.5" className="fill-muted-foreground/15" />
              <rect x="60" y="147" width="16" height="3" rx="1.5" className="fill-muted-foreground/10" />
              <rect x="196" y="140" width="24" height="3" rx="1.5" className="fill-muted-foreground/15" />
              <rect x="200" y="147" width="16" height="3" rx="1.5" className="fill-muted-foreground/10" />
              {/* Small disconnected chain/link icon */}
              <path d="M115 155 Q110 150 115 145" className="stroke-muted-foreground/20" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M165 155 Q170 150 165 145" className="stroke-muted-foreground/20" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* 404 Heading */}
          <div>
            <h1 className="text-6xl font-extrabold tracking-tight text-foreground">{t('notFound.title')}</h1>
            <p className="mt-2 text-lg font-medium text-muted-foreground">
              {t('notFound.subtitle')}
            </p>
          </div>

          {/* Contextual message */}
          <p className="text-sm text-muted-foreground/80">
            {t('notFound.description').split('{path}')[0]}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground/70">
              {location.pathname}
            </code>
            {t('notFound.description').split('{path}')[1]}
          </p>

          {/* Return home button */}
          <div>
            <Button asChild variant="default" size="default">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                {t('notFound.backToDashboard')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
