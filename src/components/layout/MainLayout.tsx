import { SidebarProvider } from '@/components/ui/sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppBreadcrumb } from './AppBreadcrumb';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  return (
    <>
      {/* Skip Link for Keyboard Users - WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Header — full width, above sidebar */}
        <AppHeader />

        {/* Content area — sidebar + main */}
        <div className="flex flex-1 min-h-0">
          <AppSidebar />

          <div className="flex-1 flex flex-col min-w-0">
            <AppBreadcrumb />

            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={location.pathname}
                id="main-content"
                className="flex-1 p-6 overflow-auto max-w-screen-2xl mx-auto w-full"
                role="main"
                tabIndex={-1}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
